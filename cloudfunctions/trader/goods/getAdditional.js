// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const db = cloud.database({
    throwOnNotFound: false
  });

  if (!event.goodsno && !event.goodsno.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var out = {};
  const wxContext = cloud.getWXContext();

  var res = null;
  
  res =  await db.collection('xlh_favor').where({
    goodsno: event.goodsno,
    openid:wxContext.OPENID
  }).limit(1).field({_id:1}).get();

  out.isfavor = res.data&&res.data.length>0;

  return out;
}