const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
{
  "logis_id":"goods",
}
*/
module.exports = async (event, wxContext) => {
  const userid = wxContext.OPENID;

  if (!event.logis_id || !event.logis_id.trim()) {
    return {
      errMsg: '预约取件编号不能空'
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

  return await db.collection('xlh_orderdetail').where({ logis_id: event.logis_id }).field({
    "goods_info.cover":1,
    "goods_info.model_value": 1,
    "goods_info.price": 1,
    "goods_info.num": 1,
    "goods_info.goodsno": 1,
    "remark": 1
  }).get();
}
