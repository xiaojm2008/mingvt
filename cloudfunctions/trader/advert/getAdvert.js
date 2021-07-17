const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
// 云函数入口函数
module.exports = async (event, context) => {
  //const wxContext = cloud.getWXContext();
  if(!event._id || !event._id.trim()){
    return {
      errMsg:"参数错误"
    }
  }
  const db = cloud.database({
    throwOnNotFound: false
  });
  return await db.collection('xlh_advert').doc(event._id).field({
    show:1,
    content:1
  }).get();
}