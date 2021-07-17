const query = require('../comm/query.js');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');

module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname
  } = event;

  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  const oper_shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
  if (!oper_shopid) {
    return {
      errMsg: '您还未开店，信息不存在'
    }
  }

  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var ctrlParams = {
    openid: oper_userid,
    page_size: 100,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: -1
  }

  var whereCondi = {
    "shopinfo.shopid": oper_shopid
  };
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";
  event.phone && event.phone != "" ? (whereCondi.phone = event.phone) : "";
  event.username && event.username != "" ? (whereCondi.username = event.username) : "";
  var selectField = null;
  if(event.roles){
    var users = await query('sys_user', whereCondi, ctrlParams, selectField);
    if(users.data && users.data.length > 0){
      
    } 
    return users;
  } else {
    return await query('sys_user', whereCondi, ctrlParams, selectField);
  }
}
