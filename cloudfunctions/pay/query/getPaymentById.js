const query = require('../comm/query.js');
var getUser = require('../comm/getUser.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
{
  "pay_id":"S0000201907201424131230b668d6955a9"
}
*/
module.exports = async(event, wxContext) => {

  var userinfo = await getUser(wxContext.OPENID);

  if(!userinfo){
    return {
      errMsg: "用户未注册"
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
    settime:1
    //goods_info: 1
  };

  return await db.collection('xlh_paymentlog').where({pay_id:event.pay_id}).field(selectField).get();

}