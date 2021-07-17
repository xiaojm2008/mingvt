const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const{
    transtype,
    actionname,
    thema
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

  //var res = await db.collection('xlh_shopthema').doc(oper_shopid).remove();

  //const removed = res.stats.removed;
  var res = await db.collection("xlh_shopthema").doc(oper_shopid).set({
    data: {
      shopid:oper_shopid,
      thema:thema,
      userid:oper_userid,
      settime:db.serverDate()
    }
  });

  if (res._id) {
    return {
      success: 1,
      //removed: removed,
      errMsg: "保存成功"
    }
  } 
  return {
    errMsg: res.errMsg
  }
}
