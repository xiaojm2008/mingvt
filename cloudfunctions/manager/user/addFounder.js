/**
 * 店铺创始人
 */
//const getUserInfo = require('./getUserInfo.js');
const getUser = require('../comm/getUser.js');
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
/**
 * 非外部接口，只是在shop/createShop中调用
 */
//module.exports = async (event, wxContext) => {
module.exports = async (openid, shopinfo) => {

  var userinfo = await getUser(openid);
  if (!userinfo) {
    return {
      errMsg: "您还未登陆，请登陆后再试！"
    };
  }
  const oper_userid = userinfo.openid;
  const usershop = {
    shopid: shopinfo.shopid,
    shopname: shopinfo.shopname,
    basedir: shopinfo.basedir,
    status: '1'
  };
  var res = await db.collection('sys_user').where({
    "shopinfo.shopid": usershop.shopid,
    userid: oper_userid
  }).field({
    create_userid: 1
  }).get();

  if (res.data && res.data.length > 0) {
    usershop.create_userid = res.data[0].create_userid;
    res = await db.collection('sys_user').where({
      "shopinfo.shopid": usershop.shopid,
      userid: oper_userid
    }).update({
      data: {
        shopinfo: usershop
      }
    });
    if (res.stats.updated >= 0) {     
      res = await _setDefaultShopInfo(userinfo._id, usershop);
      if (res.stats.updated >= 0) {
        return {
          success: 1,
          data: usershop
        }
      }
    }
    return res;
  }
  var user = {
    userid: oper_userid,
    openid: userinfo.openid,
    phone: userinfo.phone,
    username: userinfo.username,
    nickname: userinfo.nickname,
    gender: userinfo.gender,
    avatarurl: userinfo.avatarurl,
    shopinfo: usershop,
    regtime: db.serverDate(),
    settime: db.serverDate(),
    updatetime: db.serverDate(),
    status: '1',
    summary: '系统初始化',
    create_userid: constants.FOUNDER_ID
  };

  res = await db.collection('sys_user').add({
    data: user
  });
  if (!res._id) {
    return res;
  }

  usershop.create_userid = constants.FOUNDER_ID;
  res = await _setDefaultShopInfo(userinfo._id, usershop);
  if (res.stats.updated >= 0) {
    return {
      success: 1,
      data: usershop
    }
  }
  return res;
}