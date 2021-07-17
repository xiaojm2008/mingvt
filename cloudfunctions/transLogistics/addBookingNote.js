// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("./env.js")
})
const db = cloud.database();
var getOrderDetail = async(orderid)=>{
  return db.collection('xlh_orderdetail').where({order_id,orderid}).field({
    goods_info:true,
    express_fee:true,
    status:true
  }).get();
}
var addBookingNote = async (orderid,expcode,expno) => {
  var orders = await getOrderDetail(orderid);
  orders = orders && orders.data && orders.data.length < 0 ? orders.data[0]:null;
  if(!orders){
    return {
      errMsg:"订单不存在"
    }
  }
  return await db.collection('xlh_bookingnote').add({
    order_id: order_id,
    exp_code:expcode,
    exp_no:expno,
    express_fee: orders.express_fee,
    goodslist: orders.goods_info.map((v,n,a)=>{return {goodsno:v.goodsno,goodsname:v.goodsname,num:v.num,price:v.price}}),
    status:'0',
    settime:new Date().getTime(),
    updatetime:new Date().getTime()
  }).get();
}

module.exports = getBookingNote;