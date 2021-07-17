// 云函数入口文件
const cloud = require('wx-server-sdk')
const query = require('../comm/query');
const query2 = require('../comm/query2');
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

  whereCondi.goodsname = {
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
  const db = cloud.database();
  const $ = db.command.aggregate;

  var selectField = {   
    goodsno:1,
    goodsname: 1,
    shopname:1,
    "quantity.buycount": 1,
    "prominfo.promname": 1,
    /*
    "picpath.fileID": 1*/
    cover:$.let({
      vars:{
        picpath:{$arrayElemAt:['$picpath',0]}
      },
      in:'$$picpath.fileID'
    })
  };
  //return await query('xlh_goods', whereCondi, ctrlParams, selectField);
  return await query2('xlh_goods', whereCondi, ctrlParams, selectField, null);
}