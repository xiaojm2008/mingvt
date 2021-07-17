// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { _id } = event;

  var exists = await db.collection("xlh_coupontaken").where({ openid: wxContext.OPENID, counpon_id: _id }).get();
  if (exists.data && exists.data.length > 0) {
    return {
      errMsg: "您优惠券已经领取了，不能重复领取"
    };
  }
  var srcCoupon = await db.collection("xlh_coupon").doc(_id).get();
  if (!srcCoupon.data) {
    return {
      errMsg: "优惠券不存在！"
    };
  }
  srcCoupon = srcCoupon.data;
  var coupon = {
    "openid": wxContext.OPENID,
    "coupon_id": _id,
    "promid": srcCoupon.promid,
    "promtype": srcCoupon.promtype,
    "promname": srcCoupon.promname,
    "promfullname": srcCoupon.promfullname,
    "limittimeflag": srcCoupon.limittimeflag,
    "begtime": srcCoupon.begtime,
    "endtime": srcCoupon.endtime,
    "endflag": srcCoupon.endflag,
    "prominfo": srcCoupon.prominfo,
    "cutamt": srcCoupon.cutamt,
    "fullamt": srcCoupon.fullamt,
    "status": srcCoupon.status,
    "settime": new Date().getTime(),
    "updatetime": new Date().getTime()
  };
  return await db.collection("xlh_coupontaken").add({ data: coupon });
}