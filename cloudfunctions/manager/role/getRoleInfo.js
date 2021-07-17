// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  if (!event.roleid) {
    return {
      errMsg: `参数错误`
    }
  }
  const wxContext = cloud.getWXContext();

  const db = cloud.database();
  return await db.collection('sys_role').where({ roleid:event.roleid}).field({
    roleid:true,
    rolename:true,
    shopid:true,
    shopname:true,
    status:true
  }).get();
}