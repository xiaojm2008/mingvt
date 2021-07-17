const query = require('../comm/query2');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
module.exports = async(event, context) => {
  /*
  hotsell:是否热销
  deptid:分类
  goods_type:'0'现售，'1':预售
  batch_time:批次
  */
  const {
    goodsname,
    hotsell,
    deptid,
    category,
    subid,
    goods_type
  } = event;
  const db = cloud.database();
  const aggr = db.command.aggregate;

  var whereCondi = {};
  goodsname ? whereCondi.goodsname = {
    $regex: '.*' +event.goodsname,
    $options: 'i'
  } : "";

  event.shopid&&(whereCondi.shopid = event.shopid);
  //hotsell ? whereCondi.hotsell = hotsell : "";
  //deptid ? whereCondi.deptid = deptid : "";
  goods_type ? whereCondi.goods_type = goods_type : "";
  //subid_codes: /\;103/
  //subid ? whereCondi.subid_codes = /;10100/;
  subid ? whereCondi.subid_codes = {
    $regex: ";"+subid
  }:'';
  category ? whereCondi.category_codes = {
    $regex: ";" + category
  } : '';
  var ctrlParams = {
    page_size: event.page_size,
    care_total: false,//不考虑查询totalNum（总记录数，增加性能）
    orderby_field: ["updatetime"],//event.orderby_field||
    orderby_type: ["desc"],//event.orderby_type||
    batch_time: event.batch_time
  }
  var selectField = {
    _id: 1,
    //shopid: 1,
    //shopname: 1,
    spec: 1,// "0.5-1kg",
    unit: 1,
    goodsno: 1,
    goodsname: 1,
    //picpath: true,  
    picpath:aggr.let({
      vars:{
        picpath:{$arrayElemAt:["$picpath", 0]},
      },
      in:"$$picpath.fileID"
    }),
    price: 1,
    lowprice:'$price.lowprice',
    highprice:'$price.highprice',
    quantity:1,
    prominfo:1,
    updatetime: 1
  };
  return await query('xlh_goods', whereCondi, ctrlParams, selectField);
}