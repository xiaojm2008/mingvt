const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const query = require('../comm/query');
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

module.exports = async (event, wxContext) => {

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
  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  var whereCondi = {
    shopid: userInfo.shopinfo.shopid
  };
  //'0':待揽件，'1':已经揽件,2：'已达到'，'3':对方已经确认收件
  event.status && (whereCondi.status = event.status); 
  if (event.receivername) {
    whereCondi.logisticsinfo.Receiver.Name = {
      $regex: '.*' + event.receivername,
      $options: 'i'
    }
  }

  event.order_id&&(whereCondi.order_id = event.order_id); 
  event.cancelflag && (whereCondi.cancelflag = event.cancelflag); 
  event.fail && (whereCondi.retcode != "0000"); 
  event.exp_code && (whereCondi.exp_code = event.exp_code); 
  //event.exp_name && (whereCondi.exp_code = event.exp_code); 
  if (event.exp_name) {
    whereCondi.exp_name = {
      $regex: '.*' + event.exp_name,
      $options: 'i'
    }
  }

  const outField = {
    request_type: 1,
    logis_id: 1,
    shopid: 1,
    //shopname: 1,
    order_id: 1,
    exp_code: 1,
    exp_name: 1, //
    exp_no: 1,
    "logisticsinfo.Receiver":1,
    BN: 1,
    //logisticsinfo: logisticsOrder,
    //logisticcode: 1,
    //resultcode: 1,
    //reason: 1,
    //uniquerrequestnumber: 1,  
    retcode: 1,
    retmsg: 1,
    cancelflag:1,
    cancel_retmsg:1,
    cancel_retcode: 1,
    status: 1,//'0':待揽件，'1':已经揽件,2：'已达到'，'3':对方已经确认收件
    updatetime:1
  }
  return await query('xlh_logistics', whereCondi, ctrlParams, outField);
}
