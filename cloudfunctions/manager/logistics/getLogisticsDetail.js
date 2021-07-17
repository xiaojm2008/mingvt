const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

module.exports = async(event, wxContext) => {

  if ((!event.order_id || !event.order_id.trim()) &&
    (!event.logis_id || !event.logis_id.trim())) {
    return {
      errMsg: "订单号与预约取件号不能同时为空"
    }
  }
  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  const outField = {
    request_type: 1,
    logis_id: 1,
    shopid: 1,
    shopname: 1,
    order_id: 1,
    exp_code: 1,
    exp_name: 1, //
    exp_no: 1,
    "logisticsinfo.Receiver": 1,
    "logisticsinfo.Sender": 1,
    BN: 1,
    logisticcode: 1,
    resultcode: 1,
    reason: 1,
    uniquerrequestnumber: 1,
    retcode: 1,
    retmsg: 1,
    status: 1, //'0':待揽件，'1':已经揽件,2：'已达到'，'3':对方已经确认收件
    cancelflag: 1,
    updatetime: 1
  }
  var tasks = [];
  tasks.push(db.collection('xlh_logistics').where(event.logis_id ? {
    logis_id: event.logis_id
  } : {
    order_id: event.order_id,
    shopid: userInfo.shopinfo.shopid,
    retcode: "0000",
    cancelflag: '0',
  }).field(outField).get());

  tasks.push(
    db.collection('xlh_orderdetail').where(event.logis_id ? {
      logis_id: event.logis_id
    } : {
      shopid: userInfo.shopinfo.shopid,
      order_id: event.order_id
    }).field({
      "goods_info.goodsname":1,
      "goods_info.cover": 1,
      "goods_info.model_value": 1,
      "goods_info.price": 1,
      "goods_info.num": 1,
      "goods_info.goodsno": 1,
      "remark": 1
    }).get()
  )
  return (await Promise.all(tasks)).reduce((pre,cur,all)=>{
    return {
      data: pre.data.concat(cur.data),
      errMsg: pre.errMsg,
    }
  });
}