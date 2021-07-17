// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require('../env.js')
})

// 云函数入口函数
module.exports = async (event, context) => {
  const db = cloud.database();

  return await db.collection('xlh_dictvalue').get();
}