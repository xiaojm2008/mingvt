// 云函数入口文件
const cloud = require('wx-server-sdk')
const query = require('../comm/query');

cloud.init({
  env: require("../env.js")
})

const MAX_LIMIT = 10;

module.exports = async(event, context) => {
  const wxContext = cloud.getWXContext();

  var whereCondi = {
    openid: wxContext.OPENID
  };
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,  
    care_total: event.care_total||false,//不考虑查询totalNum（总记录数，增加性能）
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  var selectField = {
    _id: true,
    openid:true,
    order_id: true,
    logis_id:true,
    BN:true,
    exp_code:true,
    shopid: true,
    shopname: true,
    status: true,
    goods_info: true,
    total_pay: true,
    total_num: true,
    remark: true,
    //selected_benefit:true,
    updatetime:true
  };
  return await query('xlh_orderdetail', whereCondi, ctrlParams, selectField);
  /*
  if (query_type == "manager") {
    var whereCondi = { openid: wxContext.OPENID };
    status && status != "" ? (whereCondi.status = status) : "";
    return await require('./manager.js')('xlh_orderdetail', whereCondi, ctrlParams);
  } else {
    var whereCondi = { shopid: event.shopid };
    status && status != "" ? (whereCondi.status = status) : "";
    return await require('./trans.js')('xlh_orderdetail', whereCondi, ctrlParams);
  }*/
}