const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
/*
{
  "transtype":"goods",
  "actionname":"getGoodsDetail",
  "goodsno":"S0000201907201424131230b668d6955a9"
}
*/
module.exports = async (event, wxContext) => {
  const {
    goodsno,
    transtype,
    actionname
  } = event;
  const oper_userid = wxContext.OPENID;

  if (!goodsno) {
    return {
      errMsg: '商品编号不能空'
    }
  }
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

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  var goods =  await db.collection('xlh_goods').doc(goodsno).get();
  if(goods.data){
    var stock = await db.collection("xlh_goodsstock").doc(goodsno).field({
      "goods_type":1, //100002
      "stockflag": 1,
      "delivery": 1,
      "quantity": 1,
      "price": 1,
      "modelitems": 1,
      "models": 1,
      "models_mainkey": 1,
      "models_mainkey_idx": 1,
      "support_drawback": 1
    }).get();

    if(stock.data){
      goods.data = Object.assign(goods.data,stock.data);
    } 
    return goods;
  }
  return {
    data:null,
    errMsg:"商品信息不存在"
  }
}