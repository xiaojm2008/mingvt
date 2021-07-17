// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({ env: require("../env.js").database});

module.exports = async function () {
  return await db.collection('sys_clientcfg').get();
}
