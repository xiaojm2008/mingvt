/*
须知少日拿云志，曾许人间第一流
*/
const cloud = require('wx-server-sdk')
cloud.init({
  env: require('./env.js')
})

exports.main = async(event, context) => {
  const {
    transtype,
    actionname,
  } = event;
  const wxContext = cloud.getWXContext();
  
  try {
    return await require(`./${transtype}/${actionname}`)(event, wxContext);
  } catch (err) {
    return {
      errMsg: err.errMsg || err.message
    }
  }
}