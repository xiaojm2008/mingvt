// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const {
    _id
  } = event;
  const wxContext = cloud.getWXContext();
  
  const db = cloud.database();

  /*
   '0': '待付款',
          '1': '待发货',
          '2': '待收货',
          '3': '待评价',
          '4': '退款审核中',
          '5': '退款中',
          '6': '已完成',
          '7': '已关闭'
          'c': '已经取消'
  */
  return await db.collection('xlh_orderdetail').doc(_id).update({
    data: {
      status: 'c'
    },
    success: (res) => console.log('cancelOrder', res),
    fail: (err) => console.error('cancelOrder', err)
  });
}