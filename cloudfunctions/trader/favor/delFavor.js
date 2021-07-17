// 云函数入口文件
const getUserInfo = require("../user/getUserInfo.js")
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

module.exports = async (event, wxContext) => {

  var {
    _ids
  } = event;
  
  if(!_ids || !_ids.length ===0){
    return {
      errMsg:"参数错误"
    }
  }
  const _ = db.command;
  var res = await db.collection('xlh_favor').where({
    _id: _.in(_ids)
  }).remove();

  if(res.stats.removed > 0){
    return {
      success:1,
      errMsg:"收藏已删除"
    }
  }

  return {
    errMsg:"删除错误"
  }
  /*
  var res = await db.collection("xlh_favor").doc(_id).remove();
  if(res.stats.removed===1){
    return {
      success:1,
      errMsg:"收藏已删除"
    }
  }
  return {
    errMsg:"删除错误"
  }
  */
}