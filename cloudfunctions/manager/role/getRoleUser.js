const query = require('../comm/query');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/**
 * {
 * }
 * 
 */
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    roleid,
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
    orderby_field: ["userid"],
    orderby_type: ["desc"],
    batch_time: -1
  }

  const cmd = db.command;
  var _or = [{
    shopid: shopid
  }];

  if(userInfo.sysadmin=='1'){
    _or.push({
      shopid: cmd.eq(null)
    }) 
  }
  
  var whereCondi = cmd.or(_or);

  var _and = { roles: {} };
  _and['roles'][roleid] = { status: '1' };

  whereCondi.and([_and]);

  var selectField = {
    userid: true,   
    shopid: true,
    roles:true
  };
  return await query('sys_userrole', whereCondi, ctrlParams, selectField);
}