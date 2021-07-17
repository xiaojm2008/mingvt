const query = require('../comm/query.js');
const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
module.exports = async (event, wxContext) => {
  var {
    actionname,
    transtype,
    shopid
  } = event;
  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  if(!shopid){
    shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
    if (!shopid) {
      return {
        errMsg: '您还未开店，信息不存在'
      }
    }
  }
  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, shopid);
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
    shopid:shopid
  };
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";
  var selectField = {
    _id: true,
    code: true,
    name: true,
    img: true,
    logo:true,
    items: true,
    summary:true,
    url: true,
    seq: true
  };
  return await query('xlh_shopcategory', whereCondi, ctrlParams, selectField);
}
