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
  /**
   * 
   */
  if (event.enrollid && event.enrollid.trim()) {
    return await db.collection('xlh_enrollinfo').doc(event.enrollid).get();
  } else if (event.actionid && event.actionid.trim()) {
    const wxContext = cloud.getWXContext();
    var res = await db.collection('xlh_enrollinfo').where({
      actionid: event.actionid,
      openid:wxContext.OPENID
    }).get();
    if(res.data && res.data.length>0){
      return {data:res.data[0]}
    }
    return {data:null};
  }
  return {
    errMsg: "参数错误"
  }
}