/**
 * 店铺创始人
 */
//const getUserInfo = require('../user/getUserInfo.js'); 不能用这个，这个可能查询所有用户
const getUser = require('../comm/getUser.js');


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

module.exports = async (event, wxContext) => {
  const {
    shopinfo
  } = event;
  var userinfo = await getUser(wxContext.OPENID);
  if (!userinfo) {
    return {
      regflag:0,
      errMsg: "您还未注册，请注册！"
    };
  }
  var res = await db.collection('sys_user').where({
    "shopinfo.shopid": shopinfo.shopid,
    userid: userinfo.openid
  }).field({
    shopinfo:1,
    create_userid: 1
  }).get();

  if (res.data && res.data.length > 0) {
    var usershop = res.data[0].shopinfo;
    usershop.create_userid = res.data[0].create_userid;
    res = await _setDefaultShopInfo(userinfo._id, usershop);
    if (res.stats.updated >= 0) {
      return {
        success: 1,
        userinfo:userinfo,
        updated:res.stats.updated,
        data: usershop
      }
    } 
    return res;
  }
  return {
    errMsg:"您没有登记该店铺的操作权限"
  }
}