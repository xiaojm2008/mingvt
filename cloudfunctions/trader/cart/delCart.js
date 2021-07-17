// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const {
    openid,
    _ids,
  } = event;

  const db = cloud.database();
  const cmd = db.command;

  return await db.collection("xlh_cart").where({
    _id: cmd.in(_ids)
  }).update({
    data: {
      status: "9"
    }
  });
}