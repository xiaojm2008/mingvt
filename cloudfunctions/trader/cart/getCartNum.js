// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database();
  const $ = db.command.aggregate;
  //return await db.collection('xlh_cart').where({ openid: wxContext.OPENID, status: "0" }).count();
  var totalnum = await db.collection('xlh_cart').aggregate()
    .match({ openid: wxContext.OPENID, status: "0" })
    .group({
      _id: null,
      num: $.sum('$num')
    })
    .end();
  return {total:totalnum.list[0].num};
}