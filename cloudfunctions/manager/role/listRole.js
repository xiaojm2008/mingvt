const query = require('../comm/query');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
/**
 * {
 * }
 * 
 */
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    shopid,
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
    page_size: 100,
    orderby_field: ["status","updatetime"],
    orderby_type: ["desc", "desc"],
    batch_time: -1
  }

  var whereCondi = {
    shopid: shopid
  };
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";
  event.rolename && event.rolename != "" ? (whereCondi.rolename = event.rolename) : "";
  var selectField = {
    roleid: true,
    rolename: true,
    shopid: true,
    shopname: true,
    status: true,
    regtime: true,
    create_userid:true,
    mod_userid:true,
    summary:true
  };

  return await query('sys_role', whereCondi, ctrlParams, selectField);

}