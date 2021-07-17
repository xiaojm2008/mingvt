const query = require('../comm/query');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');

module.exports = async (event, wxContext) => {
  const {
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
  /*
  var check = await manageRight.checkUserRight(event.transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }*/

  var ctrlParams = {
    openid: oper_userid,
    page_size: 100,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: -1
  }

  var whereCondi = {
  };
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";

  var selectField = {
    _id: true,
    id: true,
    name: true,
    url: true,
    params: true,
    seq: true,
    children: true,
    icon: true
  };

  return await query('sys_menu', whereCondi, ctrlParams, selectField);

}
