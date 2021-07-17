// 云函数入口文件
const cloud = require('wx-server-sdk')
const query = require('../comm/query');
cloud.init({
  env: require("../env.js")
})
const MAX_LIMIT = 10;
module.exports = async (event, context) => {
  var {
    text
  } = event;
  const wxContext = cloud.getWXContext();

  if (!text || !text.trim()) {
    return {
      data: []
    }
  }

  var whereCondi = {
  };

  whereCondi.shopname = {
    $regex: '.*' + text,
    $options: 'i'
  };

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,
    care_total: false,//不考虑查询totalNum（总记录数，增加性能）
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }

  var selectField = {
    shopid: true,
    shopname: true,
    "picpath.fileID":true
  };
  return await query('xlh_shopinfo', whereCondi, ctrlParams, selectField);
}