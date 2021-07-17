const cloud = require('wx-server-sdk')
cloud.init({
  env: require('../env.js')
})
const db = cloud.database();

module.exports = async function () {
  return await db.collection('sys_dict').get();
}