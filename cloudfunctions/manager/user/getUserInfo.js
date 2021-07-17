// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const db = cloud.database();
  if (!event.phone
    && (!event.userid || !event.userid.trim())){
      return {
        errMsg:"用户ID，手机号码不能同时为空！"
      }
  }
  var where = {};
  event.phone ? where.phone = (event.phone+'') :'';
  event.userid ? where.openid = event.userid : '';
  return await db.collection('xlh_userinfo').where(where).field({
    openid: true,
    phone: true,
    username: true,
    nickname: true,
    gender: true,
    sysadmin: true,
    avatarurl: true,
    regtime: true
  }).get();
}