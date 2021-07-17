// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

var getUserInfo = async(openid) => {
  //var userInfo = await db.collection('sys_user').where({
  var userInfo = await db.collection('xlh_userinfo').doc(openid).field({
    _id: true,
    //userid:true,
    openid: true,
    idcard: true,
    phone: true,
    platform: true,
    username: true,
    nickname:true,
    sysadmin:true,
    status:true,
    basedir:true,
    avatarurl:true,
    shopinfo: true
  }).get();
  userInfo = userInfo.data;
  if (userInfo) {
    /*if(userInfo.status != '1'){
      return {
        errMsg: '用户状态异常'
      }
    } else */if (userInfo.shopinfo) {
      
      if (userInfo.shopinfo.status == '0') {
        return {
          regflag:8,
          errMsg: '您还未完成保证金支付，请进入【我的订单】完成支付。'
        }
      } else if (userInfo.shopinfo.status != '1') {
        return {
          regflag:7,
          errMsg: `您状态异常，请与客服联系！`
        }
      } else {
        userInfo.userid = userInfo.openid;
        return userInfo;
      }
    } else {
      return {
        regflag:9,
        errMsg: `权限拒绝！`
        //errMsg: `您尚未开店，请进入【我要开店】流程完成开店申请！`
      }
    }
  } else {
    return {
      regflag:0,
      errMsg: `您未获取权限！`
      //errMsg: `您还未开店/注册！`
    }
  }
}


module.exports = getUserInfo;