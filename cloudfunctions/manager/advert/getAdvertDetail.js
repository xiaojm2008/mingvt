//获取报名人员清单信息
//管理台功能
const utils = require("../comm/utils.js");
const cloud = require('wx-server-sdk')
const query2 = require('../comm/query2.js');
cloud.init({
  env: require("../env.js")
})
//const query = require('../comm/query.js');

const MAX_LIMIT = 10;

module.exports = async (event, wxContext) => {
  if(!event._id || !event._id.trim()){
    return {
      errMsg:"参数错误"
    }
  }
  const db = cloud.database({
    throwOnNotFound:false
  });

  return await db.collection("xlh_advert").doc(event._id).get();
}