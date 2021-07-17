const utils = require("../comm/utils.js");
const constants = require("../comm/constants.js");
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
// 云函数入口函数
/*
{"transtype":"month","actionname":"income"}
*/
module.exports = async (event, wxContext) => {

  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

}