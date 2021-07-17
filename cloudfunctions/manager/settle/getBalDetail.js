//const utils = require("../comm/utils.js");
const query = require("../comm/query.js");
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
// 云函数入口函数
/*
{"transtype":"settle","actionname":"getBalDetail","beginmonth":"201901","endmonth":"201912"}
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

  const $ = db.command;

  var whereCondi = {
    shopid: userInfo.shopinfo.shopid
  };
  event.beginmonth ? (whereCondi.statismonth = $.gte(event.beginmonth)) : null;
  event.endmonth ? (whereCondi.statismonth = $.lte(event.endmonth)) : null;

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: 10,
    orderby_field: ["statismonth"],
    orderby_type: ["desc"],
    batch_time: -1
  }
  var selectField = {
    statismonth: 1,
    amt: 1,
    settleamt:1,
    goods_num: 1,
    order_num: 1,
    settime:1
  };

  statis = await query('bal_shopdetail', whereCondi, ctrlParams, selectField);
  statis.statisdate = {
    beginmonth: event.beginmonth,
    endmonth: event.beginmonth
  };

  //statis.data = statis.data;
  return statis;
}