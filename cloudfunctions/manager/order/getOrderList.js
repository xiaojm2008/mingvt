//const query = require('yutian').query;
const query = require('../comm/query');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');

var getOrderList = async (event, wxContext) => {
  const {
    actionname
  } = event;
  const userid = wxContext.OPENID;
  
  var userInfo = await getUserInfo(userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  const shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid:'';
  if(!shopid){
    return {
      errMsg: '您还未开店，信息不存在'
    }
  }

  var check = await manageRight.checkUserRight(event.transtype, actionname, userid, shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var ctrlParams = {
    openid: userid,
    page_size: event.page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  var selectField = {
    _id: true,
    openid: true,
    order_id: true,
    shopid: true,
    shopname: true,
    status: true,
    goods_info: true,
    total_pay: true,
    total_num: true,
    remark:true,
    //selected_benefit:true,
    updatetime: true
  };
  var whereCondi = {
    shopid: shopid
  };
  /**
   * 
待付款:'0'
待发货:'1'
待收货:'2' 
待评价:'3'
已完成:'6'
   */
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";

  return await query('xlh_orderdetail', whereCondi, ctrlParams, selectField);
}

module.exports = getOrderList;

