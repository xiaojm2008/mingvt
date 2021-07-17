const formatter = require('../comm/deltafor/detlaformater.js');
const cloud = require('wx-server-sdk')
const UN_USED = "1";
cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    goodsno
  } = event;

  const db = cloud.database({
    throwOnNotFound: false
  });

  var couponList = await db.collection("xlh_coupontaken").where({ openid: wxContext.OPENID, status: UN_USED }).get();

  var goods = await db.collection('xlh_goods').where({
    goodsno: goodsno
  }).get();
  goods = goods.data && goods.data.length > 0 ? goods.data[0] : null;
  if (goods) {
    goods.couponList = couponList.data;
  } else {
    return {
      errMsg:"商品不存在"
    }
  }

  var stock = await db.collection("xlh_goodsstock").doc(goodsno).field({
      "goods_type":1, //100002
      "stockflag": 1,
      "delivery": 1,
      "quantity": 1,
      "price": 1,
      "modelitems": 1,
      "models": 1,
      "models_num":1,
      "models_mainkey": 1,
      "models_mainkey_idx": 1,
      "support_drawback": 1
  }).get();

  if(!stock.data){
    return {
      errMsg:"商品已经下架！"
    }
  }

  var nodes = {};
  if (!goods.formatterflag) {
    nodes = formatter.transform(goods.description);
    goods.description2 = [nodes];
  }
  if (formatter.isWillRefresh(goods.imgurlupdatetime)) {
    await formatter.refreshImgNodes(nodes, 'xlh_goods', goods._id);
  }
  return {
    data: Object.assign(goods,stock.data)
  };
}