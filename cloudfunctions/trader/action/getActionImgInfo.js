// 云函数入口文件
const formatter = require('../comm/detlaformater.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const db = cloud.database();

  var res = await db.collection('xlh_enrollaction').where({
    actionid: event.actionid
  }).field({imginfo:true}).get();

  return res;
}