/*
须知少日拿云志，曾许人间第一流
*/
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("./env.js")
})

exports.main = async(event, context) => {
  const {
    transtype,
    actionname,
  } = event;
  const wxContext = cloud.getWXContext();
  try {
    /*
    if (transtype == 'order') {
      var ctrlParams = {
        openid: wxContext.OPENID,
        page_size: event.page_size,
        orderby_field: event.orderby_field,
        orderby_type: event.orderby_type,
        batch_time: event.batch_time
      }
      return await require(`./${transtype}/${actionname}`)(event, wxContext);
    } else if (transtype == 'logistics') {
      return await require(`./${transtype}/${actionname}`)(event, wxContext);
    } else {
      return {
        errMsg: `${transtype} 不支持`
      }
    }*/
    return await typeof require(`./${transtype}/${actionname}`) == 'function' ? require(`./${transtype}/${actionname}`)(event, wxContext): require(`./${transtype}/${actionname}`);
  } catch (err) {
    return {
      errMsg: err.errMsg || err.message
    }
  }
}