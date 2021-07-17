// 云函数入口文件
const defaultFieldGet = require('./defaultFieldGet.js')


module.exports = async function (event, context) {
  return await defaultFieldGet(event, context);
}
