// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const query = require('../comm/query.js');

module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const db = cloud.database();
  const $ = db.command;

  var whereCondi = [];
  
  whereCondi.push({
    openid: wxContext.OPENID
  })

  var _or = [];

  event.text && _or.push({
    favor_name: {
      $regex: '.*' + event.text,
      $options: 'i'
    }
  });

  event.text && _or.push({
    favor_desc:{
    $regex: '.*' + event.text,
    $options: 'i'
    }
  });

  if(_or.length>0){
    whereCondi.push($.or(_or));
  }

  whereCondi = whereCondi.length>0?$.and(whereCondi):{}

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }

  var selectField = {
    _id:1,
    cover:1,
    favor_id:1,
    favor_tp:1,
    favor_name:1,
    favor_desc:1,
    favor_number:1,
    favor_number_desc:1,
    updatetime:1
  };

  return await query('xlh_favor',whereCondi, ctrlParams, selectField);
  
}