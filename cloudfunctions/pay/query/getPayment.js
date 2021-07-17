const query = require('../comm/query.js');
var getUser = require('../comm/getUser.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
{
  "order_id":"S0000201907201424131230b668d6955a9"
}
*/
module.exports = async(event, wxContext) => {

  var userinfo = await getUser(wxContext.OPENID);

  if(!userinfo || userinfo.sysadmin !='1'){
    return {
      errMsg: "权限拒绝"
    }
  }

  var selectField ={
    shopid:1,
    shopname:1,
    pay_id: 1,
    order_id: 1,
    primary_id: 1, //对应xlh_orderdetail._id
    order_num: 1, //订单数量
    goods_num:1,
    total_pay: 1,
    openid: 1,
    order_openid: 1,
    status: 1,
    stock_rollback:1,
    errmsg: 1,
    updatetime:1,
    settime:1,
    goods_info: 1
  };

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size,
    orderby_field: ["status", "updatetime"],
    orderby_type: ["desc", "desc"],
    batch_time: event.batch_time
  }

  var whereCondi = {

  };
  if(event.stock_rollback =='0'){
    const _ = db.command;
    whereCondi.stock_rollback = _.neq(1);
    whereCondi.status = _.in(event.status);
  }else {
    event.status && event.status != "" ? (whereCondi.status = event.status) : "";
  }
  event.openid && event.openid != "" ? (whereCondi.openid = event.openid) : "";
  if (event.shopname) {
    whereCondi.shopname = {
      $regex: '.*' + shopname,
      $options: 'i'
    }
  }

  return await query('xlh_paymentlog', whereCondi, ctrlParams, selectField);
}