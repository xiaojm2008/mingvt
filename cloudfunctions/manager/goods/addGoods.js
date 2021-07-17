const manageRight = require('../comm/manageRight.js');
const comm = require("./comm.js");
const fieldCheck = require('./fieldCheck.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});

module.exports = async (event, wxContext) => {

  var goodsInfo = event.goodsinfo;

  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.shopinfo.shopid != goodsInfo.shopid) {
    return {
      errMsg: `您没有该店铺操作权限`
    }
  } else if (!userInfo.shopinfo.basedir || !userInfo.shopinfo.basedir.trim()) {
    return {
      regflag: 1,
      errMsg: "用户店铺配置信息错误！"
    };
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var res = fieldCheck(goodsInfo);
  if (res && res.errMsg) {
    return res;
  }
  var shopcfg = null;
  try {
    shopcfg = await db.collection('xlh_shopcfg').doc(userInfo.shopinfo.shopid).field({
      APPR_ADDGOODS: 1
    }).get();
    shopcfg = shopcfg.data ? shopcfg.data : {
      APPR_ADDGOODS: '0'
    };
  } catch (err) {
    shopcfg = {
      APPR_ADDGOODS: '0'
    }
  }

  var goods = comm.getGoods(goodsInfo, shopcfg, userInfo,true);

  var stock = comm.getStock(goodsInfo, goods, shopcfg, userInfo,true);

  const transaction = await db.startTransaction();

  res = await transaction.collection('xlh_goods').add({
    data: goods
  });

  res = await transaction.collection('xlh_goodsstock').add({
    data: stock
  });

  await transaction.commit();

  if (!res._id) {
    return {
      errMsg: '添加商品失败' + res.errMsg || ''
    }
  }
  return {
    _id: res._id,
    success: 1,
    errMsg: '添加商品成功'
  }
}