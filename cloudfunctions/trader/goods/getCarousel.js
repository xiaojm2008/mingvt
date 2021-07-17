// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => new Promise((resolve, reject) => {
  console.log("carousel:" + event);
  const {
    shopid
  } = event;
  const db = cloud.database();
  db.collection('xlh_carousel').where({
    shopid: shopid
  }).get().then(res => resolve({ data: res.data, event })).catch(res => reject(res));
})