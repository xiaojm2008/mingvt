// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const query = require('../query.js');


module.exports = async (event, context) => {

  const wxContext = cloud.getWXContext();

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: 100,
    orderby_field: "py",
    orderby_type: "asc",//event.orderby_type,
    batch_time: -1
  }
  var _and={};
  event.prov&&(_and.prov=event.prov);
  return await query('sys_city',_and, ctrlParams, {_id:1,coordi:1,prov:1,city:1,name:1,py:1});
}