// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
// 云函数入口函数
module.exports = async(event, context) => {
  const wxContext = cloud.getWXContext();

  const db = cloud.database();

  return await db.collection('xlh_userinfo').where({
    openid: wxContext.OPENID
  }).field({
    _id: true,
    openid: true,
    idcard: true,
    phone: true,
    platform: true,
    username: true,
    birthdate: true,
    nickname: true,
    gender: true,
    city: true,
    prov: true,
    country: true,
    avatarurl: true,
    detail: true,
    basedir:true,
    shopinfo: true,
    regtime: true
  }).get();
}