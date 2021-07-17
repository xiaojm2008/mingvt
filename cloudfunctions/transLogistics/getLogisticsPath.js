// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("./env.js")
})


var getLogisticsPath=async(orderid)=>{
  const result = await cloud.openapi.logistics.getPath({
    openid: cloud.getWXContext().OPENID,
    orderId: '01234567890123456789',
    deliveryId: 'SF',
    waybillId: '123456789'
  });
  return result;
}

module.exports = getLogisticsPath;