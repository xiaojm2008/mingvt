const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

// 云函数入口函数
module.exports = async(event, context) => {

  const {
    transtype,
    actionname,
    roleid,
    shopid
  } = event;
  if (!roleid || !shopid) {
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
  var res = await db.collection('sys_roleright').where({
    shopid: shopid,
    roleid: roleid,
  }).field({
    _id: true,
    roleid: true,
    rolename: true,
    shopid: true,
    rights: true
  }).get();
  if (res.data && res.data.length >= 0) {
    return {
      rights: res.data[0]? res.data[0].rights:[]
    }
  }
  return res;
}