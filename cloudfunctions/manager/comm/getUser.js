// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database({
  throwOnNotFound: false
});

module.exports  = async (openid) => {
  //var userInfo = await db.collection('sys_user').where({
  var userInfo = await db.collection('xlh_userinfo').doc(openid).field({
    _id: true,
    //userid:true,
    openid: true,
    idcard: true,
    phone: true,
    platform: true,
    sysadmin:true,
    username: true,
    status: true,
    avatarurl: true,
    basedir:true,
    shopinfo: true
  }).get();
  return userInfo.data;
}
