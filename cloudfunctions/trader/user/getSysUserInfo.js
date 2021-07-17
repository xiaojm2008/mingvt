// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

module.exports  = async (openid) => {
  var userInfo = await db.collection('sys_user').where({
    userid: openid
  }).field({
    _id: true,
    userid: true,
    openid: true,    
    shopinfo: true
  }).get();
  userInfo = userInfo.data && userInfo.data.length > 0 ? userInfo.data[0] : null;
  if (userInfo) {
   if (userInfo.shopinfo) {
      return userInfo;
    } else {
      return {
        errMsg: `您还未开店，请进入【我要开店】流程完成开店申请！`
      }
    }
  } else {
    return {
      errMsg: `您还未注册！`
    }
  }
}