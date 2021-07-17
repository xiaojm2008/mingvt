const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const getRoleInfo = require('./getRoleInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    roleid,
    rolename,
    status,
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
  if (!exsits) {
    return {
      errMsg: `角色【${roleid}-${rolename}】不存在`
    }
  }
  var docid = exsits._id;
  delete exsits._id;
  exsits.rolename = rolename;
  exsits.summary = summary;
  exsits.status = status;
  exsits.mod_userid = oper_userid;
  exsits.updatetime = db.serverDate();
  var res = await db.collection('sys_role').doc(docid).update({ data: exsits });
  if (res.stats.updated == 1) {
    return {  
      success: 1,
      errMsg: `角色更新成功`
    }
  }
  return res;
}