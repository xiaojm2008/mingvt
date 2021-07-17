const query = require('../comm/query');
const cloud = require('wx-server-sdk');
cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,
    care_total: false,//不考虑查询totalNum（总记录数，增加性能）
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  var whereCondi = {
    openid: wxContext.OPENID,
    status:'0'
  };
  if (event.goodsname) {
    whereCondi.goodsname = {
      $regex: '.*' + event.goodsname,
      $options: 'i'
    }
  }
  const outField = {
    "active": true,
    "openid": true,
    "cover": true,
    "shopid":true,
    "shopname":true,
    "goodsno": true,
    "goodsname": true,
    "model_id": true,
    "model_value": true,
    "models_mainkey":true,
    "models_mainkey_idx": true,
    "num": true,
    "original_pay": true,
    "price": true,
    "status": true, //未处理的，待支付
    "settime": true,
    "updatetime": true
  }
  return await query('xlh_cart', whereCondi, ctrlParams, outField);
}