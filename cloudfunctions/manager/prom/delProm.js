const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    prom_id
  } = event;

  if (prom_id === undefined || null === prom_id || prom_id==="") {
    return {
      errMsg: '参数错误：活动ID空异常'
    }
  }
  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  const oper_shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
  if (!oper_shopid) {
    return {
      errMsg: '您还未开店，信息不存在'
    }
  }

  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  var res = null;
  res = await db.collection('xlh_goodsprom').where({prom_id:prom_id}).field({ prom_id: 1 }).limit(1).get();
  if (res.data && res.data.length > 0) {
    return {
      errMsg: '请先删除所有商品活动信息，才能删除活动'
    }
  }
  res = await db.collection('xlh_promotion').doc(prom_id).remove();
  if (res.stats.removed) {
    return {
      success: 1,
      errMsg: "删除活动成功"
    }
  }
  return res;
}