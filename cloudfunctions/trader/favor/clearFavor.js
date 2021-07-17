// 云函数入口文件
const getUserInfo = require("../user/getUserInfo.js")
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

module.exports = async (event, wxContext) => {


  var res = await db.collection('xlh_favor').where({
    openid: wxContext.OPENID
  }).remove();

  if(res.stats.removed > 0){
    return {
      success:1,
      errMsg:"收藏已清空"
    }
  }

  return {
    errMsg:"收藏清空错误"
  }
}