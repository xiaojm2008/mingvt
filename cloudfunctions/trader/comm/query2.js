// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require('../env.js')
});
const db = cloud.database();
const MAX_PAGE_SIZE = 10;
const MAX_SERV_PAGE_SIZE = 100;
/*ctrlParams batch_time,page_size
onst _ = db.command
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
var query2 = async(collection, matchCondi, ctrlParams, projectParams, groupBy, addFields) => {
  
  var res = null,
    sortParams = null;
  ctrlParams.page_size = ctrlParams.page_size ? ctrlParams.page_size : MAX_PAGE_SIZE;

  if(Array.isArray(ctrlParams.orderby_field) && ctrlParams.orderby_field.length > 0){
    sortParams = ctrlParams.orderby_field.reduce((result, fieldname, index) => {
      result[fieldname] = ctrlParams.orderby_type && ctrlParams.orderby_type[index] ? (ctrlParams.orderby_type[index] == 'desc' ? -1 : 1) : -1; //1 代表升序排列（从小到大）；
      return result;
    }, {}) 
  } else {
    sortParams = {};
    sortParams[ctrlParams.orderby_field] = (typeof ctrlParams.orderby_field === 'string' ? (ctrlParams.orderby_type == 'desc' ? -1 : 1) : {
      'updatetime': -1
    });
  }

  var aggregate = addFields?db.collection(collection).aggregate().addFields(addFields):db.collection(collection).aggregate();

  if (ctrlParams.batch_time === undefined || ctrlParams.batch_time === null || ctrlParams.batch_time < 0) {
    ctrlParams.page_size = MAX_SERV_PAGE_SIZE;
    res = groupBy ? await aggregate.match(matchCondi).project(projectParams).group(groupBy).limit(ctrlParams.page_size).sort(sortParams).end() :
      await aggregate.match(matchCondi).project(projectParams).limit(ctrlParams.page_size).sort(sortParams).end();
  } else {
    res = groupBy ? await aggregate.match(matchCondi).project(projectParams).group(groupBy).skip(ctrlParams.batch_time * ctrlParams.page_size).limit(ctrlParams.page_size).sort(sortParams).end() : await aggregate.match(matchCondi).project(projectParams).skip(ctrlParams.batch_time * ctrlParams.page_size).limit(ctrlParams.page_size).sort(sortParams).end();
  }
  var out = {
    data: res.list,
    totalNum: res.list ? res.list.length : 0
  }

  return out;
}

module.exports = query2;