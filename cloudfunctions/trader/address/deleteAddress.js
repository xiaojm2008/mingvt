// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const { _id } = event;
  var db = cloud.database();
  return db.collection("xlh_address").doc(_id).remove();

}