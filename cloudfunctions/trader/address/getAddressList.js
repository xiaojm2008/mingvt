// 云函数入口文件
const cloud = require('wx-server-sdk')
const query = require('../comm/query');
cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: -1
  }
  var whereCondi = {
    openid: wxContext.OPENID
  };
  event._id && event._id.trim() != "" ? (whereCondi._id = event._id) : "";
  event.is_default ? (whereCondi.is_default = event.is_default) : "";
  return await query('xlh_address', whereCondi, ctrlParams, null);
}