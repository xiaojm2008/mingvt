const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
//const utils = require('../comm/utils.js');
const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

module.exports = async (event, wxContext) => {
  var {
    shopid,
    shopname,
    drawmonth,
    drawyear
  } = event;

  const userid = wxContext.OPENID;

  var userInfo = await getUserInfo(userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  if (userInfo.sysadmin != '1') {
    shopid = shopid ? shopid : userInfo.shopinfo.shopid;
    var check = await manageRight.checkUserRight(event.transtype, event.actionname, userid, shopid);
    if (!check.auth) {
      return {
        errMsg: check.errMsg
      }
    }
  } 
  var ctrlParams = {
    openid: userid,
    page_size: event.page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }

  var whereCondi = {};

  shopid ? (whereCondi.shopid = shopid) : null;
  drawyear?(whereCondi.drawyear=drawyear):null,
  drawmonth ? (whereCondi.drawmonth = drawmonth) : null;
  event.status && event.status !== "" ? (whereCondi.status = event.status) : "";
  if (shopname) {
    whereCondi.shopname = {
      $regex: '.*' + shopname,
      $options: 'i'
    }
  }

  const outField = {
    shopid: 1,
    shopname: 1,
    amt: 1,
    drawmonth: 1,
    openid: 1,
    appr_errcode:1,
    appr_errmsg:1,
    cashout_errmsg:1,
    cashout_errcode:1,
    errcode: 1,
    errmsg: 1,
    message:1,
    status: 1,
    settime: 1,
    updatetime: 1
  }

  var res =  await query('bal_cashoutapp', whereCondi, ctrlParams, outField);
  res.sysadmin = userInfo.sysadmin;
  return res;
}