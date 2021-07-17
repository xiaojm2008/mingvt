var getUser = require('../comm/getUser.js');
var stockHelper = require('../comm/stockHelper.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
const PAY_FAIL = "0";
const PAY_PEN = "2"; //待支付
const DEBUG = false;
module.exports = async (event, wxContext) => {
  const {
    _id
  } = event;
  
  if (!_id || !_id.trim()) {
    return {
      errMsg: '参数异常：支付流水不能空'
    }
  }
  var userinfo = await getUser(wxContext.OPENID);

  if(!userinfo || userinfo.sysadmin !='1'){
    return {
      errMsg: "权限拒绝"
    }
  }
  var payment = {
    pay_id:_id
  }
  return await stockHelper.handleStock(payment);
}