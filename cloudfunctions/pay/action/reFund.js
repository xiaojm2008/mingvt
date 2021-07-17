const mySeq = require('../comm/mySeq.js');
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
/*
{"pay_id":"39515822613835102e504d3459cb11db","transtype":"action","actionname":"reFund"}
*/
module.exports = async(event, wxContext) => {

  if(!event.pay_id || !event.pay_id.trim()){
    return {
      errMsg:"参数错误"
    }
  }
  var apprefund = await db.collection("app_refund").doc(event.pay_id).field({
    status:1
  }).get();
  apprefund = apprefund.data;
  if(apprefund){
    if(apprefund.status =='1'){
      return {
        errMsg:"您已经退款已经处理了"
      }
    } else if(apprefund.status=='0'){
      return {
        errMsg:apprefund.errmsg
      }
    }
    return {
      errMsg:"您已经发起了退款申请，请等待退款"
    }
  }
  var payment = await db.collection("xlh_paymentlog").doc(event.pay_id).field({
    goodsno:1,
    goods_info_str:1,
    payresulttime:1,
    status:1,/**支付状态 */
    paytime:1,
    primary_id:1,
    order_id:1,
    total_pay:1,
    order_id:1,
    primary_id:1,
    pay_id:1,
    order_openid:1,
    openid:1
  }).get();
  payment = payment.data;
  if(!payment){
    return {
      errMsg:"订单未支付"
    }
  } else if(payment.status != PAY_SUCCESS){
    return {
      errMsg:"订单未支付成功"
    }
  }

  var enrollinfo = await db.collection("xlh_enrollinfo").doc(payment.primary_id).field({
    actionid:1,
    actionname:1,
    paystatus:1,
    total_pay:1
  }).get();
  enrollinfo = enrollinfo.data;
  if(!enrollinfo){
    return {
      errMsg:"订单不存在"
    }
  }
  if(enrollinfo.paystatus !=PAY_SUCCESS){
    return {
      errMsg:"订单未支付或者支付失败"
    }
  }
  apprefund = {
    _id:payment.pay_id, /** 一笔支付只能一笔退款申请 */
    goodsno:enrollinfo.actionid,
    goodsname:enrollinfo.actionname,
    pay_openid:payment.openid,
    order_openid:payment.order_openid,
    refund_openid:wxContext.OPENID,
    pay_amt:payment.total_pay,
    app_amt:payment.total_pay,
    pay_time:payment.paytime,
    status:"2",/**待退款 */
    errmsg:"申请退款",
    settime:new Date(),
    updatetime:new Date(),
    pay_resulttime:payment.payresulttime,
  }
  var res = await db.collection("xlh_enrollinfo").doc(enrollinfo._id).update({
   data:{refundstatus:'2',//100037
    updatetime:new Date(),
    errmsg:"申请退款审核中"
    }
  });
  if(res.stats.updated===1){
    res = await db.collection("app_refund").add({
      data:apprefund
    });
    return {
      success:1,
      errMsg:"退款申请成功，请等待！"
    }
  }
  return {
    errMsg:"退款申请失败，请重试！"
  }
}