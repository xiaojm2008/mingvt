// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const exceptionId = {
  "ounQF5gNI1fojHjR6JnyBekJpowQ":1,
  "ounQF5hN9pkVmg4FoCojd0JLH7hA":1,
 // "ounQF5tRpBxK1gFBYvE5rlQ7A7oI":1,
  "ounQF5v24v2kowKenQWvKkoZYkoM":1
}
// 云函数入口函数
module.exports = async(event, context) => {
  //const wxContext = cloud.getWXContext();
  const openid = context.OPENID;
  const db = cloud.database();
  if(exceptionId[openid]){
    return await db.collection('sys_memmenu').where({}).field({
      "_id": 1,
      "name": 1,
      "url": 1,
      "icon": 1,
      "status": 1,
      "seq": 1,
      "id": 1
    }).orderBy('seq', 'asc').get();
  } else {
    return await db.collection('sys_memmenu').where({status:'1'}).field({
      "_id": 1,
      "name": 1,
      "url": 1,
      "icon": 1,
      "status": 1,
      "seq": 1,
      "id": 1
    }).orderBy('seq', 'asc').get();
    
  }
}