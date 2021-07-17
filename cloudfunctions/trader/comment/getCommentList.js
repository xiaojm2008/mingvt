// 云函数入口文件
const cloud = require('wx-server-sdk');
const query = require('../comm/query');
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const MAX_LIMIT = 10;

var statisComment = async (goodsno) => {
  var tasks = [],
    totalNums = [];

  const commentTypes = ['0', '1', '2', '3', '4'];
  for (let i = 0; i < commentTypes.length; i++) {
    var whereCondi = {
      goodsno: goodsno
    };
    var commenttype = commentTypes[i];
    if (commenttype != '0' && commenttype != '4') {
      whereCondi.commenttype = commenttype;
    } else if (commenttype == '4') {
      whereCondi.has_img = true;
    }
    const promise = db.collection('xlh_comment').where(whereCondi).count();
    tasks.push(promise);
  }
  var cntArr = (await Promise.all(tasks)).forEach((item, idx, arr) => {
    totalNums.push(item.total);
  });
  return totalNums;
}
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    batch_time,
    page_size,
    goodsno,
    commenttype,
    has_img,
    orderby_field,
    orderby_type
  } = event;
  
  const whereCondi = {
    goodsno:goodsno
  };

  // 先取出集合记录总数
  var totalNums = [0, 0, 0, 0, 0];
  if (batch_time <= 0) {
    totalNums = await statisComment(goodsno);
  }
  if (commenttype === '4') {
    whereCondi.has_img = true;
  } else{
    commenttype?whereCondi.commenttype = commenttype:null;
  }
  var ctrlParams = {
    page_size: event.page_size,
    care_total: false,//不考虑查询totalNum（总记录数，增加性能）
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  var result = await query('xlh_comment', whereCondi, ctrlParams, null);
  result.totalNums = totalNums;
  return result;
}