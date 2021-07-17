// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
var UN_USED = "1";
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var {
    status
  } = event;
  status = status ? status : UN_USED;
  return await db.collection("xlh_coupontaken").where({
    openid: wxContext.OPENID,
    status: status
  }).get();
}