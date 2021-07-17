const query = require('../comm/query.js');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    batch_time,
    page_size,
    shopid,
    promtype,
    promname,
    status
  } = event;

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

  var ctrlParams = {
    openid: oper_userid,
    page_size: page_size,
    orderby_field: ["status", "updatetime"],
    orderby_type: ["desc", "desc"],
    batch_time: batch_time
  }

  var whereCondi = {
    shopid: shopid
  };
  promtype && promtype != "" ? (whereCondi.promtype = promtype) : "";
  status && status != "" ? (whereCondi.status = status) : "";
  if (promname) {
    whereCondi.promname = {
      $regex: '.*' + promname,
      $options: 'i'
    }
  }
 
  return await query('xlh_promotion', whereCondi, ctrlParams, null);
}