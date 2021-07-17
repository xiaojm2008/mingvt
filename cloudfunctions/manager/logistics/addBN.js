const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const constants = require("../comm/constants.js");
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

module.exports = async (event, wxContext) => {

  if (!event.logis_id || !event.logis_id.trim()) {
    return {
      errMsg: "预约取件号不能为空"
    }
  }
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
  //xlh_logistics:event.logis_id = xlh_logistics._id = logis_id
  //xlh_bookingnote,
  var res = await db.collection('xlh_logistics').doc(event.logis_id).update({
    data: {
      BN: event.BN,
      status:"1", //'0':待揽件，'1':已经揽件,2：'已达到'，'3':对方已经确认收件
      summary:event.summary,
      updatetime: db.serverDate
    }
  });

  res = await db.collection('xlh_orderdetail').where({logis_id:event.logis_id}).update({
    data: {
      BN: event.BN,
      exp_code:event.exp_code,
      status:constants.ORST_PEN_RECV, //待收货
      summary:event.summary,
      updatetime: db.serverDate
    }
  });

  if(res.stats.updated ===1){
    return {
      success:1,
      errMsg:"录入成功"
    }
  }
  return {
    errMsg:res.stats.updated ===0 ? "未修改运单号，不做更新":res.errMsg
  }
}