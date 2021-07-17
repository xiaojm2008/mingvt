// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { _id, active, all_active } = event;

  const db = cloud.database();
  if (!!all_active) {
    return await db.collection('xlh_cart').where({
      openid: wxContext.OPENID,
      status: '0'
    }).update({
      data: {
        active: active
      }
    });
  } else {
    return await db.collection('xlh_cart').doc(_id).update({
      data: {
        active: active
      }
    });
  }
}