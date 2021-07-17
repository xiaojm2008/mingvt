const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
{
  "transtype":"user",
  "actionname":"addUserBenefit"
  "phone":"13510775624",
  "level":""
  }
*/
var addUserBenefit = async(event, wxContext) => {
  const {
    transtype,
    phone,
    level,
    actionname
  } = event;
  const oper_userid = wxContext.OPENID;

  if (!phone) {
    return {
      errMsg: '需要用户手机号码不能为空'
    }
  }

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
  if (oper_shopid != 'S0000') {
    return {
      errMsg: '需要平台权限！'
    }
  }

  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var willAddUser = db.collection('xlh_userinfo').where({
    phone: phone
  }).field({
    _id: true,
    openid: true,
    username: true
  }).get();

  willAddUser = willAddUser && willAddUser.data && willAddUser.data.length == 1 ? willAddUser.data[0] : null;
  if (!willAddUser) {
    return {
      errMsg: `手机号码${phone}未注册，或您用同样手机号码注册了多个用户`
    }
  }
  var b = db.collection('xlh_userbenefit').where({ openid: willAddUser.openid}).field({_id:true}).get();
  if(b && b.data && b.data.length > 0){
    return {
      errMsg: `用户${phone}已有权益`
    }
  }
  var benefit = {
    openid: willAddUser.openid,
    username: willAddUser.username,
    phone: willAddUser.phone,
    level: 'A',
    invitation_code: null,
    can_cashout: null,
    cashout: 0,
    commission: 0,
    income: 0,
    rewards: 0,
    create_userid:oper_userid,
    settime: db.serverDate(),
    updatetime: db.serverDate()
  };
  b = await db.collection("xlh_userbenefit").add({
    data: benefit
  });
  if (b._id) {
    return b;
  } else {
    return {
      errMsg: `注册用户权益失败`
    }
  }
}

module.exports = addUserBenefit;