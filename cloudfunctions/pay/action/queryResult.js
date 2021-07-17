var payConfig = require('../payConfig.js');
var nonceStr = require('../comm/nonceStr.js');
var utils = require('../comm/utils.js');
var checkSign = require('../comm/checkSign.js');
var crypto = require('crypto');
var request = require('request');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: true
});
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
const PAY_PEN = "2"; //待支付
const PAY_SUCCESS = "1";
const PAY_FAIL = "0";
const PAY_EXCEPT = "3"; //含TIMEOUT

const ORST_PEN_PAY = "0"; //待支付
const ORST_PEN_DELIVERY = "1"; //待发货
var trade_state = {
  SUCCESS: "支付成功",
  REFUND: "转入退款",
  NOTPAY: "未支付",
  CLOSED: "已关闭",
  REVOKED: "已撤销（付款码支付）",
  USERPAYING: "用户支付中（付款码支付）",
  PAYERROR: "支付失败(其他原因，如银行返回失败)"
};
/*
   '0': '待付款',
        '1': '待发货',
        '2': '待收货',
        '3': '待评价',
        '4': '退款审核中',
        '5': '退款中',
        '6': '已完成',
        '7': '已关闭'
*/
/*SUCCESS—支付成功
REFUND—转入退款
NOTPAY—未支付
CLOSED—已关闭
REVOKED—已撤销（付款码支付）
USERPAYING--用户支付中（付款码支付）
PAYERROR--支付失败(其他原因，如银行返回失败)
  */
/* var result = {
  "pay_id": payment.pay_id,
  "mch_id": payresult.mch_id,
  "sub_mch_id": payresult.sub_mch_id,
  "transaction_id": payresult.transaction_id,
  "fee_type": payresult.fee_type,
  "coupon_fee": payresult.coupon_fee,
  "settlement_total_fee": payresult.settlement_total_fee,
  "cash_fee": payresult.cash_fee,
  "total_fee": payresult.total_fee,
  "result_code": payresult.result_code,
  "return_code": payresult.return_code,
  "return_msg": payresult.return_msg,
  "err_code": payresult.err_code,
  "err_code_des": payresult.err_code_des,
  "trade_state": payresult.trade_state,
  "trade_state_desc": payresult.trade_state_desc + "_" + trade_state_desc,
  "time_end": payresult.time_end
};*/
var updPaymentStatus = (payment)=>{
  db.collection('xlh_paymentlog').doc(payment.pay_id).update({
    data: {
      status:PAY_EXCEPT
    }
  })
}

var _doResult = async (payresult, payment) => {
 
    //var orderSt = ORST_PEN_DELIVERY; //
    var trade_state_desc = "";
    if(payresult.trade_state){
      trade_state_desc = trade_state[payresult.trade_state];
    }

    if (payresult.result_code == "SUCCESS" && payresult.return_code == "SUCCESS" && payresult.trade_state == "SUCCESS") {
      if (!checkSign(payresult)) {
        payresult.pay_msg = "验证微信返回报文签名失败";
        payresult.pay_status = PAY_FAIL;
        //orderSt = ORST_PEN_PAY;
      } else if (parseInt(payresult.total_fee) != payment.total_pay) {
        payresult.pay_msg = "支付金额不比配！请与商家联系或确认后重新下单！";
        payresult.pay_status = PAY_FAIL;
        //orderSt = ORST_PEN_PAY;
      } else {
        payresult.pay_msg = trade_state_desc;
        payresult.pay_status = PAY_SUCCESS;
        //orderSt = ORST_PEN_DELIVERY;
        //20190724
      }
    } else {
      payresult.pay_msg = `${trade_state_desc}！备注：${payresult.return_msg},${payresult.err_code_des||""} ${payresult.trade_state_desc||''}:${payresult.trade_state||''}`;
      payresult.pay_status = PAY_FAIL;
      //orderSt = ORST_PEN_PAY;
    };

    payresult.openid = payment.openid; //支付者
    payresult.primary_id = payment.primary_id;
    payresult.order_openid = payment.order_openid; //订单所有者
    payresult.order_id = payment.order_id;
    payresult.pay_id = payment.pay_id;
    payresult.total_pay = payment.total_pay;
    //payresult.pay_status = payresult.pay_status;
    //payresult.pay_msg = payresult.pay_msg;
    //payresult.updatetime = db.serverDate();
    payresult.settime = db.serverDate();

    await db.collection('xlh_wxpayresult').add({
      data: payresult
    });
    
    //payment.confirmdate = utils.dateFormat(new Date(),"yyyyMMdd"),
    //payment.confirmtime = utils.dateFormat(new Date(),"hhmmss"),
    payment.paytime = payresult.time_end||'', //14位字符串
    payment.payresulttime = new Date();
    payment.updatetime = db.serverDate(),
    payment.status = payresult.pay_status,
    payment.errmsg = payresult.pay_msg;
    /*
    var order = {
      "order_num":payment.order_num,
      "pay_id":payment.pay_id,
      "paystatus":payment.status, //支付状态
      "confirmdate":payment.confirmdate,
      "confirmtime":payment.confirmtime,   
      "paytime": payment.paytime, //payresult.time_end 
      "updatetime": payment.updatetime,
      "errmsg": payment.errmsg,
      "status": payment.status == PAY_SUCCESS ? ORST_PEN_DELIVERY : ORST_PEN_PAY //订单状态
    }
    */
    var res = await _updPaymentLog(payment);
    if(res.stats.updated==1){
      return await _UpEnrollInfo(payment);
    } 
    return {
      errMsg:"支付失败，请重试"
    }
}

var _updPaymentLog = async (payment) => {
  return db.collection('xlh_paymentlog').doc(payment.pay_id).update({
    data: {
      //confirmdate:payment.confirmdate,
      //confirmtime:payment.confirmtime,
      paytime:payment.payresulttime, //支付结果获取时间
      updatetime:payment.updatetime,
      status: payment.status,
      errmsg:payment.errmsg
    }
  });
}
var _UpEnrollInfo = async(payment)=>{
  var res =  await db.collection("xlh_enrollinfo").doc(payment.primary_id).update({
    data:{
      pay_id:payment.pay_id,
      paystatus:payment.status,
      errmsg:payment.errmsg,
      paytime:new Date()
    }
  });
  if(payment.status==PAY_SUCCESS){
    if(res.stats.updated==1){
      return {
        success:1,
        errMsg:"支付成功"
      }
    } else {
      return {
        success:1,
        errMsg:"支付成功：更新订单失败"
      }
    }
  } else {
    return {
      success:0,
      errMsg:payment.errmsg
    }
  }
}

var _retryUpEnrollInfo = async(payment)=>{
  var res =  await db.collection("xlh_enrollinfo").doc(payment.primary_id).update({
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
  var str = `appid=${payment.appid}&mch_id=${payConfig.mch_id}&nonce_str=${payment.nonce_str}&out_trade_no=${payment.pay_id}&sign_type=MD5&key=${payConfig.key}`;
  payment.sign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

var _initReqBody = (payment) => {
  return `<xml>
   <appid><![CDATA[${payment.appid}]]></appid>
   <mch_id><![CDATA[${payConfig.mch_id}]]></mch_id>
   <nonce_str><![CDATA[${payment.nonce_str}]]></nonce_str>
   <out_trade_no><![CDATA[${payment.pay_id}]]></out_trade_no>
   <sign><![CDATA[${payment.sign}]]></sign>
   <sign_type>MD5</sign_type>
  </xml>`;
}

var _getPaymentLog = async(event) => {
  return await db.collection("xlh_paymentlog").where(event.pay_id ? {
    pay_id: event.pay_id
  } : (event.primary_id?{
      primary_id: event.primary_id //对应xlh_orderdetail._id
    }:{
      order_id: event.order_id //对应xlh_orderdetail._id
    })).field({
    appid: 1,
    mergeflag:1,
    pay_id: 1,
    order_id: 1,
    primary_id: 1, //对应xlh_orderdetail._id
    order_num: 1, //订单数量
    total_pay: 1,
    openid: 1,
    order_openid: 1,
    status: 1,
    errmsg: 1,
    stock_rollback:1,
    goods_info: 1
  }).get();
}

var requestWX= async (payment)=>{
  payment.nonce_str = nonceStr();
   _genReqSign(payment);  
  var reqParams = await _initReqBody(payment);

  return await new Promise((resolve, reject) => request({
    url: payConfig.query_url,
    method: 'POST',
    body: reqParams
  }, (err, res, body) => {
    if (!body) {

      updPaymentStatus(payment);

      reject({
        errMsg: "返回报文未空"
      })
      return;
    }
    xmlParser.parseString(body, (err, res) => {
      if (err) {
        //网络异常情况怎么处理？？获取不到支付结果，必须重试
        /* 未明确获取失败，不需要回滚
        if(payment.stock_rollback!=1){
          _rollBackStock(payment);
        }*/
        updPaymentStatus(payment);
        
        reject({
          errMsg: `${err.message}:${JSON.stringify(res)}`
        })
        return;
      }
      resolve(res.xml);
    });
  }));
}
/**
{"pay_id":"5181582203495718b6457cd71a7a23fd","transtype":"action","actionname":"queryResult"}
{"pay_id":"4961582261415299e8528f96ad7e533f","transtype":"action","actionname":"queryResult"}
 */
module.exports = async(event, wxContext) => {

  if(!event.pay_id && !event.primary_id && !event.order_id){
    return {
      errMsg: "查询参数错误：订单号，支付流水号等错误！"
    }
  }
  var res = null;
  var payment = await _getPaymentLog(event);
  if (!payment.data || payment.data.length === 0) {
    return {
      errMsg: "订单支付流水不存在：" + event.pay_id||event.primary_id
    }
  }

  payment = payment.data[0];

  if (payment.status == PAY_SUCCESS) {
    res = await _retryUpEnrollInfo(payment);
    if (res) {
      return res;
    }
  }/* else if(payment.status == PAY_FAIL){
    return {
      errMsg:payment.errmsg
    }
  }*/

  res = await requestWX(payment);

  return await _doResult(res, payment);

}