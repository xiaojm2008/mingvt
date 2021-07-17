const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const getUserInfoByPhone = require('./getUserInfo.js');
const constants = require("../comm/constants.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var _setDefaultShopInfo = async (user_id, shopinfo) => {
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
    phone
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
  var willAdd = await getUserInfoByPhone(event, wxContext);

  willAdd = willAdd.data && willAdd.data.length > 0 ? willAdd.data[0] : null;
  if (!willAdd) {
    return {
      errMsg: `用户不存在`
    }
  }
  var exists = await db.collection('sys_user').where({
    "openid": willAdd.openid,
    "shopinfo.shopid": userInfo.shopinfo.shopid
  }).field({
    phone: true,
    status: true
  }).get();
  if (exists.data && exists.data.length > 0) {
    if (exists.data[0].phone != willAdd.phone) {
      return {
        errMsg: `用户登记已经存在了,但是登记的手机号码与本次不一致，确认本人后，可做更新手机号码处理`
      }
    }
    var res = null;
    if (exists.data[0].status == '1') {
      return {
        errMsg: `用户登记已经存在了，无需再次登记`
      }
    } else {
      return {
        errMsg: `用户登记已经存在了,但状态非法，不需要再次登记，可做状态修改处理`
      }
    }
  }
  var usershop = {};
  usershop.gender = willAdd.gender;
  usershop.phone = willAdd.phone;
  usershop.avatarurl = willAdd.avatarurl;
  usershop.openid = willAdd.openid;
  usershop.userid = willAdd.openid; 
  usershop.nickname =  willAdd.nickname;
  usershop.username = willAdd.username;
  usershop.regtime = db.serverDate();
  usershop.settime = db.serverDate();
  usershop.updatetime = db.serverDate();
  usershop.status = '1';
  usershop.summary = event.summary;
  
  usershop.create_userid = userInfo.shopinfo.create_userid == constants.FOUNDER_ID ? oper_userid : userInfo.shopinfo.create_userid;
  usershop.shopinfo = userInfo.shopinfo;
  userInfo.shopinfo.create_userid = usershop.create_userid;
  //userInfo.shopinfo.create_userid = userInfo.shopinfo.create_userid == constants.FOUNDER_ID ?
  var res = await db.collection('sys_user').add({
    data: usershop
  });
  if (res._id) {   
    res = await _setDefaultShopInfo(willAdd._id, userInfo.shopinfo);
    if (res.stats.updated >= 0) {
      return {
        success: 1,
        errMsg: `用户登记成功`
      }
    }
  }
  return res;
}