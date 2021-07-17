var getUser = require('../comm/getUser.js');
var payConfig = require('../payConfig.js');
const mySeq = require('../comm/mySeq.js');
//const retryUpdOrderDetail = require("../comm/retryUpdOrderDetail.js");
const myNum = require("../comm/myNum.js");
//var getField = require('./getXmlField.js');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: true,
  errThrown: true
});
var nonceStr = require('../comm/nonceStr.js');
var checkSign = require('../comm/checkSign.js');
var crypto = require('crypto');
var request = require('request');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});

const CASHOUT_APPR_SUCC = "1"; //申请提取审批成功
const CASHOUT_OK = "3"; //已经提取成功
const CASHOUT_FAIL = "4"; //提取失败
/*
var prepaylog = {
  appid: getField(body, "appid"),
  mch_id: getField(body, "mch_id"),
  device_info: getField(body, "device_info"),
  nonce_str: getField(body, "nonce_str"),
  sign: getField(body, "sign"),
  prepay_id: getField(body, "prepay_id"),
  retmsg: getField(body, "retmsg"),
  retcode: getField(body, "retcode"),
  return_code: getField(body, "return_code"),   
  return_msg: getField(body, "return_msg"),
  result_code: getField(body, "result_code"),
  err_code_des: getField(body, "err_code_des"),
  err_code: getField(body, "err_code"),
  trade_type: getField(body, "trade_type"),
  code_url: getField(body, "code_url")
}
<xml>
<return_code><![CDATA[SUCCESS]]></return_code>
<return_msg><![CDATA[]]></return_msg>
<mch_appid><![CDATA[wxec38b8ff840bd989]]></mch_appid>
<mchid><![CDATA[10013274]]></mchid>
<device_info><![CDATA[]]></device_info>
<nonce_str><![CDATA[lxuDzMnRjpcXzxLx0q]]></nonce_str>
<result_code><![CDATA[SUCCESS]]></result_code>
<partner_trade_no><![CDATA[10013574201505191526582441]]></partner_trade_no>
<payment_no><![CDATA[1000018301201505190181489473]]></payment_no>
<payment_time><![CDATA[2015-05-19 15：26：59]]></payment_time>
</xml>
<return_code><![CDATA[FAIL]]></return_code>
<return_msg><![CDATA[系统繁忙,请稍后再试.]]></return_msg>
<result_code><![CDATA[FAIL]]></result_code>
<err_code><![CDATA[SYSTEMERROR]]></err_code>
<err_code_des><![CDATA[系统繁忙,请稍后再试.]]></err_code_des>
*/
var _doResult = async (cashoutres, cashout) => {
  try {
    await _insertBalCashoutLog(cashoutres);
    var result = null;
    if (cashoutres.return_code == "SUCCESS" 
    && cashoutres.result_code ==='SUCCESS') {
      /*if (!checkSign(cashoutres)) {
        result = {
          payment_no: null,
          retmsg: "验证微信返回报文签名失败"
        }
      } else {*/
        result = {
          success:1,
          errMsg:'交易成功',
          partner_trade_no: cashoutres.partner_trade_no,
          cashout_no: cashoutres.payment_no,
          cashout_time: cashoutres.payment_time
        //};
      }
    } else {
      result = {
        errMsg: `${cashoutres.err_code_des}:${cashoutres.err_code}_${cashoutres.return_msg}`,  
      };
      /**
       * partner_trade_no: cashoutres.partner_trade_no,
        return_code: cashoutres.return_code,
        return_msg: cashoutres.return_msg,
        result_code: cashoutres.result_code,
        err_code: cashoutres.err_code,
        err_code_des: cashoutres.err_code_des
       */
    }
   
    await db.collection("bal_cashoutapp").doc(cashout._id).update({
        data: {
          status: result.success==1? CASHOUT_OK:CASHOUT_FAIL,
          partner_trade_no: cashoutres.partner_trade_no,
          cashout_errmsg:result.errMsg,
          cashout_errcode: cashoutres.err_code,
          cashout_time: cashoutres.payment_time||null,
          cashout_no: cashoutres.payment_no||null,
          repay_id:cashout.repay_id,
          updatetime:new Date()
        }
    }); 
    return result;
  } catch (err) {
    return {
      return_msg: err.message
    };
  }
}
var _genReqSign = (cashout) => {
  var str = `amount=${cashout.amount}&check_name=FORCE_CHECK&desc=${cashout.summary}&mch_appid=${payConfig.appid}&mchid=${payConfig.mch_id}&nonce_str=${cashout.nonce_str}&openid=${cashout.openid}&partner_trade_no=${cashout.repay_id}&re_user_name=${cashout.username}&spbill_create_ip=${payConfig.ip}&key=${payConfig.key}`;
  //toUpperCase 一定转换为大写
  cashout.sign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

var _initReqBody = (cashout) => {
  //partner_trade_no:商户订单号
  return `<xml>
<amount><![CDATA[${cashout.amt}]]></amount>
<check_name>FORCE_CHECK</check_name>
<desc><![CDATA[${cashout.summary}]]>!</desc>
<mch_appid><![CDATA[${payConfig.appid}]]></mch_appid>
<mchid><![CDATA[${payConfig.mch_id}]]></mchid>
<nonce_str><![CDATA[${cashout.nonce_str}]]></nonce_str>
<openid><![CDATA[${cashout.openid}]]></openid>
<partner_trade_no><![CDATA[${cashout.repay_id}]]></partner_trade_no>
<re_user_name><![CDATA[${cashout.username}]]></re_user_name>
<spbill_create_ip><![CDATA[${payConfig.ip}]]></spbill_create_ip>
<sign><![CDATA[${cashout.sign}]]></sign>
</xml>`;
}

var _getBalCashoutApp = async (cashoutid) => {
  return await db.collection("bal_cashoutapp").doc(cashoutid).field({
    shopid: 1,
    username: 1,
    amt: 1, //对应xlh_orderdetail._id
    summary: 1, //订单数量
    openid: 1,
    cashoutid: 1,
    status: 1
  }).get();
}

//
var _insertBalCashoutLog = async (cashoutlog) => {
  return await db.collection("bal_cashoutlog").add({
    data: cashoutlog
  });
}

module.exports = async (event, wxContext) => {
  var userinfo = await getUser(wxContext.OPENID);
  if(!userinfo || userinfo.sysadmin !='1'){
    return {
      errMsg: "提现权限拒绝"
    }
  }
  var cashoutapp = await _getBalCashoutApp(event.cashoutid);
  cashoutapp = cashoutapp.data ? cashoutapp.data:null;
  if(!cashoutapp){
    return {
      errMsg: "提现未申请"
    }
  }
  //未审核
  if (cashoutapp.status != CASHOUT_APPR_SUCC) {
    return{
      errMsg:"提现未审核成功"
    }
  }

  cashoutapp.nonce_str = nonceStr();

  var cashout = Object.assign({}, cashoutapp);

  cashout.amt = myNum.toFen(cashout.amt);
  cashout.repay_id = mySeq.mySeq32(mySeq.N3());
  cashout.oper_openid = wxContext.OPENID;
  cashout.oper_username = userinfo.username;

  var res = await _insertBalCashoutLog(cashout);
  if (!res._id) {
    return res;
  }

  _genReqSign(cashout);

  var reqParams = _initReqBody(cashout);

  return new Promise((resolve, reject) => request({
    url: payConfig.cashout_url,
    method: 'POST',
    body: reqParams
  }, (err, res, body) => {
    if (!body) {
      reject({
        errMsg: "返回报文未空"
      })
      return;
    }
    xmlParser.parseString(body, (err, res) => {
      if (err) {
        //网络异常
         db.collection("bal_cashoutapp").doc(cashout._id).update({
          data: {
            status: CASHOUT_FAIL,
            //partner_trade_no: cashoutres.partner_trade_no,
            cashout_errmsg: `${err.message}:${JSON.stringify(res)}`,         
            updatetime: new Date()
          }
        }).then(log=>{
          console.log(log);
        }).catch(loge=>{
          console.log(loge);
        });

        reject({
          errMsg: `${err.message}:${JSON.stringify(res)}`
        })
        return;
      }
      _doResult(res.xml, cashout).then(result=>{
      //返回success成功result.success=1;
        resolve(result);
      }).catch(reserr=>{
        resolve(reserr);
      });     
     
    });
  }));
}