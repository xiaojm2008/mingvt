const myNum = require("./myNum.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const ORST_PEN_PAY = "0"; //待支付
const ORST_PEN_DELIVERY = "1"; //待发货
module.exports  = async (payment) => {
  var res = await db.collection("xlh_orderdetail").where({
    pay_id: payment.pay_id
  }).field({
    status: 1,
    shopid: 1,
    total_pay: 1
  }).get();
  if (!res.data || res.data.length === 0) {
    return {
      errMsg:"该订单还未发起支付请求"
    };
  }
  var tasks = [], total_pay = 0;
  res.data.forEach((v) => {
    //支付流水已经支付但是订单明细状态还是待支付
    total_pay += myNum.toFen(v.total_pay);
    if (v.status === ORST_PEN_PAY) {
      tasks.push(db.collection('xlh_orderdetail').doc(v._id).update({
        data: {
          "paytime": payment.time_end,
          "deliverytime": null,
          "dealtime": null,
          "updatetime": db.serverDate(),
          "errmsg": payment.errmsg,
          "pre_errmsg":v.errmsg,
          "status": ORST_PEN_DELIVERY
        }
      }))
    }
  })
  if (total_pay != payment.total_pay) {
    return {
      errMsg: `您的某些订单部分已经支付，但是总支付金额不一致【${total_pay}:${payment.total_pay}】，您可以进入我的【订单页面】继续完成支付！`
    }
  }
  if (tasks.length === 0) {
    return {
      errMsg: "该订单已经支付"
    };
  }
  res = await Promise.all(tasks);
  if (res.some((v, i, a) => {
    return !v.stats || v.stats.updated === 0;
  })) {
    return {
      errMsg: '您的某些订单实际已经支付成功了，但是订单状态为【待支付】状态，您可以重新发起支付来刷新订单支付状态'
    }
  }
}
