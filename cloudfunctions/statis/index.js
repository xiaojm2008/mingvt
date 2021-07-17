/*
须知少日拿云志，曾许人间第一流
*/
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("./env.js")
})
// 云函数入口函数
exports.main = async (event, context) => {
  /*
  const db = cloud.database({ env: require("./env.js").database});
  const wxContext = cloud.getWXContext();
  */
  const {
    transtype,
    actionname,
  } = event;
  try {
    return await require(`./${transtype}/${actionname}`)(event, cloud.getWXContext());
  } catch (err) {
    return {
      errMsg: err.errMsg || err.message
    }
  }
}