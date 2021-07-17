// 云函数入口文件
const cloud = require('wx-server-sdk')
const query = require('../comm/query');
const query2 = require('../comm/query2');
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const MAX_LIMIT = 10;
module.exports = async(event, context) => {
  var {
    text
  } = event;
  const wxContext = cloud.getWXContext();

  if (!text || !text.trim()) {
    return {
      data: []
    }
  }
/*
db.collection('xlh_orderdetail')
  .where({
     goods_info:{goodsname: {$regex: ".*规格", $options: "i"}
  }})
  .field({
    goods_info: true,
    order_id: true,
  })
  .orderBy('updatetime', 'desc')
  .skip(0)
  .limit(10)
  .get()
*/
  var whereCondi = {
    openid:wxContext.OPENID
  };
  whereCondi.goods_info = {
    goodsname: {
      $regex: '.*' + text,
      $options: 'i'
    }
  };

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,
    care_total: false,//不考虑查询totalNum（总记录数，增加性能）
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  const $ = db.command.aggregate;
  var projField = {
    _id: 1,
    order_id: 1,
    shopid: 1,
    shopname: 1,
    /*"goods_info.cover": 1,
    "goods_info.goodsname": 1,*/
    cover:$.let({
      vars:{
        goods_info:{$arrayElemAt:['$goods_info',0]}
      },
      in:'$$goods_info.cover'
    }),
    goodsname:$.let({
      vars:{
        goods_info:{$arrayElemAt:['$goods_info',0]}
      },
      in:'$$goods_info.goodsname'
    }),
    total_pay: 1,
    settime: 1
  };
  /*
  var selectField = {
    _id: 1,
    order_id: 1,
    shopid: 1,
    shopname: 1,
    "goods_info.cover": 1,
    "goods_info.goodsname": 1,
    total_pay: 1,
    settime: 1
  };*/
  return await query2('xlh_orderdetail', whereCondi, ctrlParams, projField, null);
  //return await query('xlh_orderdetail', whereCondi, ctrlParams, selectField);
}