const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const constants = require("../comm/constants.js");
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
    shopid,
    rights
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
  if (userInfo.shopinfo.create_userid != constants.FOUNDER_ID) {
    var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
    if (!check.auth) {
      return {
        errMsg: check.errMsg
      }
    }
  }
  var res = await db.collection('sys_roleright').where({ roleid: roleid, shopid: shopid }).field({ _id: true }).get();
  if (res.data && res.data.length > 0) {
    var cmd = db.command;
    res = await db.collection('sys_roleright').doc(res.data[0]._id).update({
      data: {
        rights: cmd.set(rights),
        mod_userid: oper_userid,
        updatetime: db.serverDate()
      }
    });
    if (res.stats && res.stats.updated) {
      return {
        success: 1,
        errMsg: `修改角色权限成功`
      }
    }
  } else {
    res = await db.collection('sys_roleright').add({
      data: {
        roleid: roleid,
        shopid: shopid,
        rights: rights,
        create_userid: oper_userid,
        updatetime: db.serverDate(),
        settime: db.serverDate()
      }
    });
    if (res._id) {
      return {
        success: 1,
        errMsg: `分配角色权限成功`
      }
    }
  }
  return res;
}