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

  if (!event.actionid && !event.actionid.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var out = {};
  const wxContext = cloud.getWXContext();

  var res =  await db.collection('xlh_enrollinfo').where({
    actionid: event.actionid
  }).count();

  out.num = res.total;

  res =  await db.collection('xlh_enrollinfo').where({
    actionid: event.actionid,
    openid:wxContext.OPENID
  }).limit(1).field({_id:1}).get();

  out.isenroll = res.data.length>0?1:0;

  res =  await db.collection('xlh_favor').where({
    openid:wxContext.OPENID
  }).count();

  out.favor = res.total;
  
  res =  await db.collection('xlh_favor').where({
    actionid: event.actionid,
    openid:wxContext.OPENID
  }).limit(1).field({_id:1}).get();

  out.isfavor = res.data&&res.data.length>0;

  return out;
}