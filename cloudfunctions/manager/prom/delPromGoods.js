const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    goods_index,
    goodsprom_id
  } = event;

  if (goodsprom_id === undefined || null === goodsprom_id) {
    return {
      errMsg: '参数错误：商品活动ID空异常'
    }
  }
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

  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
 /*
  const outField = {
    "goodsno": 1,
    "goodsname": 1,
    "price": 1,
    "picpath": 1,
    "summary": 1,
    "status": 1
  }
  var cmd = db.command;
  var ctrlParams = {
    openid: oper_userid,
    page_size: null,
    orderby_field: 'goodsname',
    orderby_type: 'desc',
    batch_time:-1
  }
  var goods = await query('xlh_goods', {_id:cmd.in(goods_ids)}, ctrlParams, outField);
  */
  var res = null;
  if (goods_index === null || goods_index === undefined) {
    res = await db.collection('xlh_goodsprom').doc(goodsprom_id).remove();
    if (res.stats.removed) {
      return {
        success: 1,
        errMsg:  "删除商品活动成功"
      }
    }
    return res;
  }
  res = await db.collection('xlh_goodsprom').doc(goodsprom_id).field({goods:1}).get();
  res = res.data;
  if(!res){
    return {
      errMsg: '商品活动信息不存在'
    }
  }

  var goods = res.goods && res.goods.length > 0 ? res.goods.splice(goods_index,1):null;
  if (goods && goods[0].primary == '1' && res.goods.length>0){
    return {
      errMsg: '主活动商品只有删除从属商品后才能删除！'
    }
  }
  goods = res.goods && res.goods.length > 0 ? res.goods:null;
  if (!goods || goods.length === 0){
    res = await db.collection('xlh_goodsprom').doc(goodsprom_id).remove();
    if (res.stats.removed) {
      return {
        success: 1,
        errMsg: goods? "删除商品成功": '需要删除的信息不存在'
      }
    }
    return res;
  }

  res = await db.collection('xlh_goodsprom').doc(goodsprom_id).update({
    data: {
      updatetime: db.serverDate(),
      mod_userid: oper_userid,
      goods: goods
    }
  });
  if (res.stats.updated) {
    return {
      success: 1,
      errMsg: "删除商品成功"
    }
  }
  return res;
}