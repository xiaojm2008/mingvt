const utils = require("../comm/utils.js");
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const func = require("./actionfunc.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
{"transtype":"cfg","actionname":"getStatisList"}
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
 
  return {success:1,data:func.funclist};
}