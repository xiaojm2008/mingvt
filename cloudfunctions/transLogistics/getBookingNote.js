// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("./env.js")
})

const db = cloud.database();
/*
const _ = db.command
const $ = db.command.aggregate
db.collection('fruits').aggregate()
  .project({
    stock: $.filter({
      input: '$stock',
      as: 'item',
      cond: $.gte(['$$item.price', 15])
    })
  })
  .end()
*/
var qry = async(params)=>{
  var pageSize = !!params.page_size ? params.page_size : MAX_LIMIT;
  var whereCondi = {};
  params.status && params.status != "" ? (whereCondi.status = params.status) : "";
  //params.goods_name && params.goods_name != "" ? (whereCondi.status = params.goods_name) : "";

  const countResult = 0;
  if(params.status){
    countResult = await db.collection('xlh_bookingnote').where(whereCondi).count();
  } else if(params.goods_name){
    const cmd = db.command;
    const $ = db.command.aggregate;
    return await db.collection('xlh_bookingnote').aggregate()
      .project({
        goodslist: $.filter({
          input: '$goodslist',
          as: 'item',
          cond: $.let({
            var:{
              idx: $.indexOfCP(['$$item.goods_name', params.goods_name])
            },
            in:$.gt(['$$idx',-1])
          })
        })
      }).end();
  }
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / pageSize)
  if (batch_time >= batchTimes) {
    return {
      data: [],
      errMsg: 'xlh_myteam ok'
    };
  }
  var result = null;
  if (batch_time < 0) {
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('xlh_bookingnote').orderBy(!orderby_field ? "settime" : orderby_field, !orderby_type ? "desc" : orderby_type).where(whereCondi).skip(i * pageSize).limit(pageSize).get();
      tasks.push(promise);
    }
    if (tasks.length == 0) {
      return {
        data: [],
        errMsg: "没有数据"
      };
    }
    // 等待所有
    result = (await Promise.all(tasks)).reduce((acc, cur) => ({
      data: acc && acc.data.length > 0 ? acc.data.concat(cur.data) : [],
      errMsg: acc ? acc.errMsg : "",
    }));
  } else {
    result = await db.collection('xlh_bookingnote').orderBy(!orderby_field ? "settime" : orderby_field, !orderby_type ? "desc" : orderby_type).where(whereCondi).skip(batch_time * pageSize).limit(pageSize).get();
  }
  return result;
}

var getBookingNote = async(params) => {
  /*
  var {
    batch_time,
    page_size,
    order_id,
    goods_name,
    status,
    orderby_field,
    orderby_type
  } = params;
  */
  if (params.order_id){
    return await db.collection('xlh_bookingnote').where({
      order_id: params.order_id
    }).get();
  } else {
    return await qry(params);
  }
}

module.exports = getBookingNote;