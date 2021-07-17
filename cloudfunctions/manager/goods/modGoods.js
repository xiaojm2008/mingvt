const manageRight = require('../comm/manageRight.js');
const comm = require("./comm.js");
const fieldCheck = require('./fieldCheck.js');
const getUserInfo = require('../comm/getUserInfo.js');
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});

module.exports = async (event, wxContext) => {

  var goodsInfo = event.goodsinfo;
  if (!goodsInfo.goodsno) {
    return {
      errMsg: `商品编号为空`
    }
  } else if (!goodsInfo._id) {
    return {
      errMsg: `商品ID为空`
    }
  }
  const _id = goodsInfo._id;
  delete goodsInfo._id;
  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.shopinfo.shopid != goodsInfo.shopid) {
    return {
      errMsg: `您没有该店铺操作权限`
    }
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


  var goods = comm.getGoods(goodsInfo, shopcfg, userInfo, false);

  var stock = comm.getStock(goodsInfo, goods, shopcfg, userInfo, false);

  const transaction = await db.startTransaction();

  var res1 = await transaction.collection('xlh_goods').doc(_id).set({
    data: goods
  });

  var res2 = await transaction.collection('xlh_goodsstock').doc(_id).set({
    data: stock
  });

  await transaction.commit();

  if (res1.stats.updated == 1 || res1.stats.created == 1 ||
    res2.stats.updated == 1 || res2.stats.created == 1) {
    return {
      success: 1,
      res1:res1,
      res2:res2,
      errMsg: '商品修改成功'
    }
  } else if (res1.stats.updated == 0 && res1.stats.created == 0 &&
    res2.stats.updated == 0 && res2.stats.created == 0) {
    return {
      success: 0,
      errMsg: '商品未做更新'
    }
  }
  return {
    errMsg: '错误提示:' + res1.result.errMsg
  }
}