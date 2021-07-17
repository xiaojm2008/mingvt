const payConfig = require('../payConfig.js');
const mySeq = require('../comm/mySeq.js');
const myNum = require("../comm/myNum.js");
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
const PAY_SUCCESS = "1";
const PAY_FAIL = "0";
const PAY_PEN = "2"; //待支付/或者未知状态（超时时候未收到应答）

var _getEnrollInfo = async(enrollid)=>{
  return await db.collection("xlh_enrollinfo").doc(enrollid).field({
    paystatus:1,
    paytime:1,
    pay_id:1,
    openid:1,
    total_pay:1,
    x_username:1,
    x_nickname:1,
    x_phone:1
  }).get();
}

var _getPaymentLog = async(pay_id) => {
  return await db.collection("xlh_paymentlog").doc(pay_id).field({
    order_id: 1, //enroll
    pay_id:1,
    total_pay: 1,
    status: 1,
    errmsg: 1
  }).get();
}

//xlh_paymentlog
var _insertPaymentLog = async(payment) => {
  return await db.collection("xlh_paymentlog").add({
    data: payment
  });
}
var _retryUpEnrollInfo = async(payment)=>{
  var res =  await db.collection("xlh_enrollinfo").doc(payment.order_id).update({
    data:{
      pay_id:payment.pay_id,
      paystatus:PAY_SUCCESS,
      paytime:payment.settime
    }
  });
  if(res.stats.updated==1){
    return {
      success:1,
      errMsg:"支付成功"
    }
  }
}
var _genReqSign = (payment) => {
  var goods_tag = payment.selected_benefit && payment.selected_benefit.discount_type == '01' ? `&goods_tag=${payment.selected_benefit.discount_tag}` : '';
  var str = `appid=${payment.appid}&body=${payConfig.body}&detail=${payment.goods_info_str}${goods_tag}&mch_id=${payConfig.mch_id}&nonce_str=${payment.nonce_str}&notify_url=${payConfig.notify_url}&openid=${payment.openid}&out_trade_no=${payment.pay_id}&spbill_create_ip=${payConfig.ip}&total_fee=${payment.total_pay}&trade_type=JSAPI&key=${payConfig.key}`;
  //toUpperCase 一定转换为大写
  payment.sign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}


var _initReqBody = (payment) => {
  var goods_tag = '';
  if (payment.selected_benefit && payment.selected_benefit.discount_type == '01') {
    goods_tag = `<goods_tag>${payment.selected_benefit.discount_tag}</goods_tag>`
  }
  /*
  out_trade_no
  商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_ -|*@ ，且在同一个商户号（mch_id）下唯一。
  */
  return `<xml>
  <appid><![CDATA[${payConfig.appid}]]></appid>
  <body><![CDATA[${payConfig.body}]]></body>
  <detail><![CDATA[${payment.goods_info_str}]]></detail>
  ${goods_tag}
  <mch_id><![CDATA[${payConfig.mch_id}]]></mch_id>
  <nonce_str><![CDATA[${payment.nonce_str}]]></nonce_str>
  <notify_url><![CDATA[${payConfig.notify_url}]]></notify_url>
  <openid><![CDATA[${payment.openid}]]></openid>  
  <out_trade_no><![CDATA[${payment.pay_id}]]></out_trade_no>
  <spbill_create_ip><![CDATA[${payConfig.ip}]]></spbill_create_ip>
  <total_fee>${payment.total_pay}</total_fee>
  <trade_type>JSAPI</trade_type>
  <sign><![CDATA[${payment.sign}]]></sign>
  </xml>`;
}
var requestWX  = async(reqParams)=>{
  return await new Promise((resolve, reject) => request({
    url: payConfig.unified_url,
    method: 'POST',
    body: reqParams
  }, (err, res, body) => {
    if (!body) {
      reject({
        errMsg: "返回报文未空"+`(${err.message}):(${res})`
      })
    }
    xmlParser.parseString(body, (err, res) => {
      if (err) {
        reject({
          errMsg: `${err.message||err.errMsg}(${rls.errMsg})`
        })
        return;
      }
      resolve(res.xml)   
    });

  }));
}
var _doResult = (prepaylog, payment) => {
  try {
    var result = null;
    if (prepaylog.result_code == "SUCCESS") {
      if (!checkSign(prepaylog)) {
        result = {
          prepay_id: null,
          retmsg: "验证微信返回报文签名失败"
        }
      } else {
        result = {
          prepay_id: prepaylog.prepay_id
        };
      }
    } else {

      result = {
        prepay_id: null,
        retcode: prepaylog.retcode,
        retmsg: prepaylog.retmsg,
        return_code: prepaylog.return_code,
        return_msg: prepaylog.return_msg,
        err_code: prepaylog.err_code,
        err_code_des: prepaylog.err_code_des
      };
    }

    prepaylog.settime = db.serverDate();
    prepaylog.openid = payment.openid;
    prepaylog.order_openid = payment.order_openid;
    prepaylog.pay_id = payment.pay_id;
    prepaylog.order_id = payment.order_id||'';
    prepaylog.primary_id = payment.primary_id;
    prepaylog.shopid = payment.shopid;
    prepaylog.total_pay = payment.total_pay;
    //写预支付流水
    db.collection('xlh_wxprepaylog').add({
      data: prepaylog
    });
    return result;
  } catch (err) {
    return {
      return_msg: err.message
    };
  }
}
var _initPayment = (result) => {
  var times = new Date().getTime(); //appId=${result.appid}&
  var str = `appId=${result.appid}&nonceStr=${result.nonce_str}&package=prepay_id=${result.prepay_id}&signType=MD5&timeStamp=${times}&key=${payConfig.key}`;
  var paySign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  return {
    timeStamp: times.toString(),
    nonceStr: result.nonce_str,
    package: `prepay_id=${result.prepay_id}`,
    signType: 'MD5',
    paySign: paySign,
    outTradeNo: result.pay_id
  };
}
module.exports = async(event, wxContext) => {

  if(!event.enrollid || !event.enrollid.trim()){
    return {
      errMsg:"参数错误"
    }
  }

  var enrollinfo = await _getEnrollInfo(event.enrollid);
  enrollinfo = enrollinfo.data;
  if (!enrollinfo) {
    return {
      errMsg:"申请记录不存在"
    }
  } else if(!enrollinfo.total_pay){
     return {
       errMsg:"支付金额非法"
     }
   } else if(enrollinfo.openid == wxContext.OPENID){
   /* return {
      errMsg:"支付人与申请人不一致"
    }*/
  }

  if (enrollinfo.pay_id) {
    //已经支付过了，需要检查是否重复支付
    var _payment = await _getPaymentLog(enrollinfo.pay_id);
    _payment = _payment.data;
    if (_payment && _payment.status === PAY_SUCCESS
     && myNum.toFen(enrollinfo.total_pay) === _payment.total_pay) {
      return await _retryUpEnrollInfo(_payment);
    }
  }
/*
  var res = _calcOrderTotalPay(oDetail);
  if (res && res.errMsg) {
    return res;
  }
*/
  var payment = {};
  payment.appid = wxContext.APPID;
  payment.openid = wxContext.OPENID;
  payment.goodsno = enrollinfo.actionid; //商品编号
  payment.goods_info_str = "报名费用:"+enrollinfo.actionname;
  payment.nonce_str = nonceStr();
  payment.settime = new Date();
  payment.status = PAY_PEN;//等待支付状态
  payment.total_pay = myNum.toFen(enrollinfo.total_pay);
  payment.cash_type="1";//收费类别,1:报名费用 0:商品支付 
  payment.pay_id = mySeq.mySeq32(mySeq.N3());
  //支付确认成功的日期,用的是业务服务器的时间，即查询支付结果的日志（注意：与paytime可能不相等），参考queryOrder
  //payment.confirmdate = null;
  //把goods_info[].shopid去重并且转换为[shopid1,shopid2,shopid3]字符串数组，后面在cashout.genIncomeMonth.js查询统计中使用
  payment._id = payment.pay_id;
  payment.order_openid = enrollinfo.openid;
  payment.order_id = enrollinfo._id||'';
  payment.primary_id = enrollinfo._id;
  payment.stock_rollback = 1; //因为没有库存，所以不用回滚
  payment.shopid = '';

  //更新支付流水，类似物流处理需要处理logis_id（见：manager/logistics/createLogistics)
  var res = await db.collection('xlh_enrollinfo').doc(enrollinfo._id).update({
      data: {
        pay_id: payment.pay_id,
        paystatus:PAY_PEN,
        updatetime: db.serverDate()
      }
    });

  var res = await _insertPaymentLog(payment);
  if (!res._id) {
    return res;
  }

  _genReqSign(payment);

  var reqParams = _initReqBody(payment);

  var resWX = await requestWX(reqParams);

  var result = _doResult(resWX, payment);

  if (!result.prepay_id) {
    return {
      errMsg: `${result.err_code_des}:${result.retmsg}_${result.return_msg}(${rls.errMsg})`
    }
  }
  result.nonce_str = payment.nonce_str;
  result.pay_id = payment.pay_id;
  result.appid = payment.appid;

  var payParams = _initPayment(result);
  payParams.sandbox = payConfig.key == payConfig.sandbox_key;
  payParams.pay_id = payment.pay_id;

  //返回success了,调整前台处理方式
  payParams.success=1;
  return payParams;
}