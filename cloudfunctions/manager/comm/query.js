// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database();
const MAX_PAGE_SIZE = 10;
const MAX_SERV_PAGE_SIZE = 100;
/*ctrlParams:
page_size,batch_time,orderby_field, orderby_type
collection:xlh_orderdetail
*/
var query = async (collection, whereCondi, ctrlParams, outField) => {
  var res = null, total = 0, batchTimes=0;
  ctrlParams.page_size = ctrlParams.page_size ? ctrlParams.page_size : MAX_PAGE_SIZE;
  // 如果需要关系总记录数的话，先要获取总记录数
  if (ctrlParams.care_total || ctrlParams.batch_time < 0){
    if (ctrlParams.total&&ctrlParams.total>0){
      total = ctrlParams.total;
    } else{
      var countResult = await db.collection(collection).where(whereCondi).count();
      total = countResult.total
      if (total == 0) {
        return {
          data: [],
          totalNum: 0,
          errMsg: "没有匹配的结果"
        };
      }
    }
    // 计算需分几次取
    batchTimes = Math.ceil(total / ctrlParams.page_size)
    if (ctrlParams.batch_time >= 0 && ctrlParams.batch_time >= batchTimes) {
      return {
        data: [],
        totalNum:0,
        errMsg:"没有数据了"
      };
    }
  }

  ctrlParams.orderby_field = ctrlParams.orderby_field ? ctrlParams.orderby_field : 'updatetime';
  ctrlParams.orderby_type = ctrlParams.orderby_type ? ctrlParams.orderby_type : 'desc';
  var collection = db.collection(collection);
  if (typeof ctrlParams.orderby_field == 'object' && Array.isArray(ctrlParams.orderby_field)) {
    for (var j = 0; j < ctrlParams.orderby_field.length; j++) {
      collection = collection.orderBy(ctrlParams.orderby_field[j], ctrlParams.orderby_type[j]);
    }
  } else {
    collection = collection.orderBy(ctrlParams.orderby_field, ctrlParams.orderby_type);
  }
  if (ctrlParams.batch_time < 0) {
    // 承载所有读操作的 promise 的数组
    ctrlParams.page_size = MAX_SERV_PAGE_SIZE; 
    const tasks = []

    for (let i = 0; i < batchTimes; i++) {
      const promise = !outField ? collection.where(whereCondi).skip(i * ctrlParams.page_size).limit(ctrlParams.page_size).get() :
        collection.where(whereCondi).field(outField).skip(i * ctrlParams.page_size).limit(ctrlParams.page_size).get();
      tasks.push(promise)
    }
    if (tasks.length == 0) {
      return {
        data: [],
        totalNum: 0,
        errMsg: "没有数据"
      };
    }
    // 等待所有
    res = (await Promise.all(tasks)).reduce((acc, cur) => ({
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }));
    res.totalNum = total;
  } else {
    res = await (!outField ? collection.where(whereCondi).skip(ctrlParams.batch_time * ctrlParams.page_size).limit(ctrlParams.page_size).get() :
      collection.where(whereCondi).field(outField).skip(ctrlParams.batch_time * ctrlParams.page_size).limit(ctrlParams.page_size).get());
  }
  res.totalNum = total||(res.data?res.data.length:0);
  return res;
}

module.exports = query;