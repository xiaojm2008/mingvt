// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();

  return await db.collection('xlh_toprank').orderBy('rankdate', 'desc').orderBy('rank', 'asc').limit(10).get();
}