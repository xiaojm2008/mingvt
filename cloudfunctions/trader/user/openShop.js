const mySeq = require('../comm/mySeq.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var addOrder = (base) => {
  var orderInfo = {
    order_id: base.order_id,
    openid: base.openid,
    additional_info: null,
    address_info: null,
    can_use_benefit: null,
    discount_cut_price: 0,
    additional_info:[{type:'text',value:'开店保证金（可退）'}],
    goods_info: [{
      goodsno: base.goodsno,
      goodsname: base.goodsname,
      price: base.price,
      original_pay: base.price,
      num: 1,
      goods_type: '',
      cover: ''
    }],
    selected_benefit: {
      discount_type: null
    },
    tostore_data: {},
    original_pay: base.price,
    total_pay: base.price,
    goods_type: '',
    status: '0',
    settime: new Date().getTime(),
    updatetime: new Date().getTime()
  };
  return await db.collection('xlh_orderdetail').add({data:orderInfo});
}

module.exports = async(event, context) => {
  const {
    shoptype,
    /* 个人/企业 */
    shopname,
    profession,
    introduction,
    logo
  }
  const wxContext = cloud.getWXContext();

  var user = await db.collection('xlh_userinfo').where({
    openid: wxContext.OPENID
  }).field({
    _id: true,
    shopinfo: true
  }).get();
  user = user.data && user.data.length > 0 ? user.data[0] : null;
  if (!user) {
    return {
      errMsg: `用户信息不存在`
    }
  }
  if (user.phone || user.username || user.province || user.city) {
    return {
      errMsg: `请完善您的手机号码，真实姓名，省份，城市信息`
    }
  }
  if (user.shopinfo && user.shopinfo.shopid) {
    if (user.shopinfo.status == '0'){
      return {
        errMsg: `您已经有店铺了，只需要支付相应保证金即可`
      }
    } else if(user.shopinfo.status!= '1') {
      return {
        errMsg: `您店铺状态异常，请与客服联系！`
      }
    } else {
      return {
        errMsg: `您已经有店铺了，暂时一个用户限制只能开一个`
      }
    }
  }

  var myshop = {
    openid: wxContext.OPENID,
    shopid: 'S' + mySeq.S4().toUpperCase(),
    shopname: shopname,
    profession: profession,
    introduction: introduction,
    logo: logo,
    status: '0',
    settime: new Date().getTime(),
    updatetime: new Date().getTime()
  };
  
  var shop = await db.collection('xlh_usershop').where({
    shopid: myshop.shopid
  }).field({
    _id: true
  }).get();

  if (shop && shop.data && shop.data.length > 0) {
    myshop.shopid = 'S' + mySeq.S4().toUpperCase();
    shop = await db.collection('xlh_usershop').where({
      shopid: myshop.shopid
    }).field({
      _id: true
    }).get();
    if (shop && shop.data && shop.data.length > 0) {
      return {
        errMsg: `后台错误：商品编号重复，请稍后重试或者与客服取得联系！`
      }
    }
  }
  var order_id = mySeq.mySeq('SECUR');
  myshop.order_id = order_id;
  shop = await db.collection('xlh_usershop').add({
    data: myshop
  });

  if (shop._id) {
    var fee = 500;
    var config = db.collection('sys_config').get();
    config = config && config.data && config.data.length > 0 ? config.data[0] : null;
    if (config && !isNaN(config.FEE_SECUR_OPENSHOP)) {
      if (typeof config.FEE_SECUR_OPENSHOP == 'string') {
        config.FEE_SECUR_OPENSHOP = parseInt(config.FEE_SECUR_OPENSHOP);
      }
      fee = config.FEE_SECUR_OPENSHOP || 500;
    }
    var base = {
      shopid: shopid,
      openid: wxContext.OPENID,
      order_id: order_id,
      goodsno: 'FEE_SECUR_OPENSHOP',
      goodsname: '消费者权益保证金',
      price: fee
    };
    var res = await addOrder(base);
    if(res &&res._id){
      base._id = res._id;
      return base;
    } else {
      return { errMsg: `后台错误：${res.errMsg},请稍后重试！`};
    }
  }
  return {
    errMsg: `后台错误：${shop.errMsg},请稍后重试！`
  }
}