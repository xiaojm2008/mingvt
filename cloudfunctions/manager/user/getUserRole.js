const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

// 云函数入口函数
module.exports = async (event, context) => {

  const {
    transtype,
    actionname,
    userid,
    shopid
  } = event;
  if (!userid || !shopid) {
    return {
      errMsg: `参数错误`
    }
  }
  const wxContext = cloud.getWXContext();

  const oper_userid = wxContext.OPENID;
  /*
    if (!phone) {
      return {
        errMsg: '需要用户手机号码不能为空'
      }
    }
  */
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
  var roleright = [];
  return await manageRight.getUserRole(userid, shopid);
}