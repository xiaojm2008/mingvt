const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
{
  "transtype":"goods",
  "actionname":"getGoodsDetail",
  "goodsno":"S0000201907201424131230b668d6955a9"
}
*/
var setOrderStatus = async(event, wxContext) => {
  const {
    order_id,
    status,
    actionname
  } = event;
  const userid = wxContext.OPENID;

  if (!order_id) {
    return {
      errMsg: '订单编号不能空'
    }
  }

  var userInfo = await getUserInfo(userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  const shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
  if (!shopid) {
    return {
      errMsg: '您还未开店，信息不存在'
    }
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, userid, shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  return await db.collection('xlh_orderdetail').where({
    shopid: shopid,
    order_id: order_id
  }).update({
    data: {
      status: status
    }
  });
}

module.exports = setOrderStatus;