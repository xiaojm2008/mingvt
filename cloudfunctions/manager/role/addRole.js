const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const getRoleInfo = require('./getRoleInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/**
 * 
 */
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    roleid,
    rolename,
    status,
    shopid,
    summary
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
  var exsits = await getRoleInfo(event, wxContext);
  exsits = exsits.data && exsits.data.length > 0 ? exsits.data[0] : null;
  if (exsits) {
    return {
      errMsg: `角色ID【${roleid}】已经存在，请重新分配一个吧`
    }
  } 
  var willAdd = {};
  willAdd.roleid = roleid;
  willAdd.rolename = rolename;
  willAdd.shopid =  userInfo.shopinfo.shopid;
  willAdd.shopname = userInfo.shopinfo.shopname;
  willAdd.summary = summary; 
  willAdd.status = status;
  willAdd.create_userid = oper_userid;
  willAdd.regtime = db.serverDate();
  willAdd.settime = db.serverDate();
  willAdd.updatetime = db.serverDate();
  var res = await db.collection('sys_role').add({ data: willAdd });
  if (res._id) {
    return {
      roleid:willAdd.roleid,
      success: 1,
      errMsg: `角色创建成功`
    }
  }
  return res;
}