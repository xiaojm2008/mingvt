const query = require('../comm/query.js');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const getUserInfoByUserid = require('./getUserInfo.js');
const constants = require("../comm/constants.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var _setDefaultShopInfo = async(user_id, shopinfo) => {
  return await db.collection("xlh_userinfo").doc(user_id).update({
    data: {
      shopinfo: shopinfo
    }
  });
}

module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    userid,
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

  var willAdd = await getUserInfoByUserid(event, wxContext);
  willAdd = willAdd.data && willAdd.data.length == 1 ? willAdd.data[0] : null;
  if (!willAdd) {
    return {
      errMsg: `用户不存在`
    }
  }
  const willUpdUser_id = willAdd._id;
  delete willAdd.regtime;
  delete willAdd.openid;
  delete willAdd._id;
  willAdd.updatetime = db.serverDate();
  willAdd.status = status;
  willAdd.summary = summary;
  willAdd.mod_userid = oper_userid;

  var exists = await db.collection('sys_user').where({
    userid: userid,
    "shopinfo.shopid": userInfo.shopinfo.shopid
  }).update({
    data: willAdd
  });

  if (exists.stats.updated >= 0) {   
    userInfo.shopinfo.create_userid = userInfo.shopinfo.create_userid == constants.FOUNDER_ID ? oper_userid : userInfo.shopinfo.create_userid;
    var res = await _setDefaultShopInfo(willUpdUser_id, userInfo.shopinfo);
    if (res.stats.updated >= 0) {
      return {
        success: 1,
        errMsg: exists.stats.updated > 0 ? "用户登记信息更新成功" : "用户登记信息无需更新"
      }
    }
  }
  return {
    errMsg: `用户未登记`
  }
}