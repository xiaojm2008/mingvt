// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
/*
"100006": [
    {
      "code": "c",
      "name": "取消"
    },
    {
      "code": "0",
      "name": "待付款"
    },
    {
      "code": "1",
      "name": "待发货"
    },
    {
      "code": "2",
      "name": "待收货"
    },
    {
      "code": "3",
      "name": "待评价"
    },
    {
      "code": "4",
      "name": "退款审核中"
    },
    {
      "code": "5",
      "name": "退款中"
    },
    {
      "code": "6",
      "name": "已完成"
    },
    {
      "code": "7",
      "name": "已关闭"
    },
    {
      "code": "8",
      "name": "已删除"
    }
  ],
*/
//字典：100006
const status_map = {
  '0': '待付款',
  '1': '待发货',
  '2': '待收货',
  '3': '待评价',
  '4': '退款审核中',
  '5': '退款中',
  '6': '已完成',
  '7': '已关闭',
  '8': '已删除',
  'c': '已经取消'
};
// 云函数入口函数
module.exports = async (event, context) => {
  const {
    _id,
    status
  } = event;

  //const wxContext = cloud.getWXContext();

  const db = cloud.database();

  if (!status_map[status]) {
    return { errMsg: "订单状态非法" };
  }
  if(!_id || !_id.trim()){
    return { errMsg: "订单ID异常" };
  }

  var res = await db.collection('xlh_orderdetail').doc(_id).update({
    data: {
      status: status,
      updatetime:db.serverDate(),
      receivingtime:db.serverDate()
    }
  });
  if(res.stats.updated===1){
    return {
      success:1,
      errMsg:"确认成功"
    }
  }
  return res;
}