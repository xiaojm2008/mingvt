// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
// 云函数入口函数
module.exports = async(openid) => {

  var res = await db.collection('xlh_userinfo').doc(openid).field({
    _id: true,
    //platform: true,
    openid: true,
    idcard: true,
    phone: true,   
    nickname: true,
    gender: true,
    basedir: true,
    shopinfo: true
  }).get();
  return res.data||null;
}