// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

var dateFormat = (dt, fmt) => {
  var y = dt.getFullYear();
  var m = dt.getMonth() + 1;
  var day = dt.getDate();
  var h = dt.getHours();
  var min = dt.getMinutes();
  var sec = dt.getSeconds();
  var SS = dt.getMilliseconds();
  var o = {
    "M+": m,
    "d+": day,
    "h+": h,
    "m+": min,
    "s+": sec,
    "q+": Math.floor((m + 2) / 3),
    "S+": SS
  };
  if (/(y+)/.test(fmt)) {
    let p1 = RegExp.$1;
    let ys = y.toString();
    fmt = fmt.replace(p1, ys.substr(4 - p1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      let p1 = RegExp.$1;
      var v = o[k];
      var sv = "00" + v;
      var v2 = sv.substr(("" + v).length);
      //alert(p1 + ":"+"2ms12".substr(3));
      fmt = fmt.replace(p1, (p1.length == 1) ? v : v2);
    }
  }
  return fmt;
};
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const cmd = db.command;


  var coupon = await db.collection('xlh_coupon').orderBy("cutamt", "asc").where({
    endtime: cmd.gte(dateFormat(new Date(), 'yyyy-MM-dd')),
    status: "1"
  }).get();

  var myCouponTaken = await db.collection("xlh_coupontaken").where({
    openid: wxContext.OPENID
  }).get();
  if (myCouponTaken.data && myCouponTaken.data.length > 0) {
    myCouponTaken = myCouponTaken.data;

    var couponOut = [];
    coupon.data.forEach((item) => {
      var f = myCouponTaken.find((item2) => {
        return item._id == item2.coupon_id;
      });
      if (!f) {
        couponOut.push(item);
      }
    });
    return { data: couponOut };
  }
  return coupon;
}