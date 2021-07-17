//const mySeq = require('../comm/mySeq.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
/*FEE_SECUR_ADDSHOP*/
module.exports = async(event, context) => {
  const {
    fee,
    shopid,
    order_id
  }
  if (!order_id) {
    return {
      errMsg: `请您确认订单号是否正确！`
    }
  }
  const wxContext = cloud.getWXContext();

  var shopApp = await db.collection('xlh_usershop').where({
    shopid: shopid
  }).field({
    _id: true,
    shopid: true,
    shopname: true,
    profession: true,
    introduction: true,
    logo: true,
    status: true
  }).get();

  shopApp = shopApp && shopApp.data && shopApp.data.length > 0 ? shopApp.data[0] : null;
  if (!shopApp) {
    return {
      errMsg: `请您确认店铺是否申请成功！`
    }
  }

  const db = cloud.database();
  //pay_status = '1'
  var orderdetail = db.collection('xlh_orderdetail').where({
    order_id: order_id
  }).field({
    _id:true,
    openid: true,
    total_pay:true,
    status: true
  }).get();
  orderdetail = orderdetail && orderdetail.data && orderdetail.data.length > 0 ? orderdetail.data[0] : null;
  if (!orderdetail) {
    return {
      errMsg: `请您确认开店申请流程是否完成！`
    }
  }
  if (!orderdetail.status || orderdetail.status == '0') {
    return {
      errMsg: `请您还未成功支付保证金，请往【我的订单】页面完成支付！`
    }
  }

  var fee = 500;
  var config = db.collection('sys_config').get();
  config = config && config.data && config.data.length > 0 ? config.data[0] : null;
  if (config && !isNaN(config.FEE_SECUR_ADDSHOP)) {
    if (typeof config.FEE_SECUR_OPENSHOP == 'string') {
      config.FEE_SECUR_OPENSHOP = parseInt(config.FEE_SECUR_OPENSHOP);
    }
    fee = config.FEE_SECUR_OPENSHOP || 500;
  }
  if (!orderdetail.total_pay || orderdetail.total_pay != fee * 100) {
    return {
      errMsg: `请您确认是否成功支付金额是否正确！`
    }
  }
  //'6': '已完成',    '7': '已关闭'
  db.collection('xlh_orderdetail').doc(orderdetail._id).update({data:{status:'7'}});

  db.collection('xlh_usershop').doc(shopApp._id).update({
    data: {
      status: '1',
      securamount: payresult.total_fee,
      verifytime: new Date().getTime(),
      updatetime: new Date().getTime()
    }
  });

  var stats = await db.collection('xlh_userinfo').doc(user._id).update({
    data: {
      shopinfo: {
        shopid: shopApp.shopid,
        shopname: shopApp.shopname,
        profession: shopApp.profession,
        introduction: shopApp.introduction,
        logo: shopApp.logo,
        status: '1'
      }
    }
  });

  if (stats.stats.updated > 0) {
    return {
      success: '1',
      updated: shop.stats.updated
    };
  } else {
    return {
      errMsg: `后台错误：${shop.errMsg},请稍后重试！`
    }
  }
}