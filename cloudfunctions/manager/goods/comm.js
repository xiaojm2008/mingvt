// 云函数入口文件
const mySeq = require('../comm/mySeq.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})

var getSalePrice = (goods) => {
  //多型号情况
  var model = null,
    minsaleprice = 9999999999999999,
    maxsaleprice = 0,
    stock=0,
    models_num=0;
  for (var k in goods.modelitems) {
    model = goods.modelitems[k];
    if (model.price > maxsaleprice) {
      maxsaleprice = model.price;
    }
    if (model.price < minsaleprice) {
      minsaleprice = model.price;
    }
    stock += (model.stock||0);
    models_num++;
  }
  return [minsaleprice, maxsaleprice,stock,models_num];
}
var getStock =  (goodsInfo, goods, shopcfg, userInfo,isAdd) => {
  var stock = {
    //"_id":goods._id,
    "goodsno": goods.goodsno,
    "shopid": goods.shopid,
    "shopname": goods.shopname, 
    "goodsname": goods.goodsname,
    "picpath": goods.picpath.map(v=>{return {fileID:v.fileID,height:v.height,width:v.width}}),
    "goods_type":goodsInfo.goods_type, //100002
    "stockflag": goodsInfo.stockflag,
    "delivery": goodsInfo.delivery,
    "quantity": goodsInfo.quantity ? {
      "minqty": goodsInfo.quantity.minqty||1,/**起点购买量 */
      "stockqty": goodsInfo.quantity.stockqty
    } : {},
    "price": goodsInfo.price ? {
      "presaleprice": goodsInfo.price.presaleprice,
      "originalprice": goodsInfo.price.originalprice,
      "taxprice": goodsInfo.price.taxprice,
      //"saleprice": goodsInfo.price.saleprice,
      "stockprice": goodsInfo.price.stockprice,
      "memberprice": goodsInfo.price.memberprice,
      "groupprice": goodsInfo.price.groupprice,
      //"lowprice": goodsInfo.price.lowprice,
      //"highprice": goodsInfo.price.highprice,
    } : {},
    "modelitems": goodsInfo.modelitems,
    "models": goodsInfo.models,
    "models_num":goods.models_num,
    "models_mainkey": goodsInfo.models_mainkey,
    "models_mainkey_idx": goodsInfo.models_mainkey_idx,
    "support_drawback": goodsInfo.support_drawback
  }
  /**计算过的值 */
  stock.price.saleprice = goods.price.saleprice;
  stock.price.lowprice = goods.price.lowprice;
  stock.price.highprice =goods.price.highprice;
  stock.quantity.stockqty = goods.quantity.stockqty;
  stock.updatetime = new Date();

  if(isAdd){
    stock.settime = new Date();
    stock._id = goods._id;
    stock.goodsno = goods.goodsno;
    stock.quantity.buycount = goods.quantity.buycount;
    stock.quantity.availableqty = goods.quantity.stockqty;
    stock.quantity.frozenqty = 0;
    stock.quantity.totalqty = goods.quantity.stockqty;
  }
  return stock;
}
var getGoods = (goodsInfo, shopcfg, userInfo,isAdd) => {
  var goods = {  
    "shopid": goodsInfo.shopid,
    "shopname": goodsInfo.shopname,
    "goodsno": goodsInfo.goodsno,
    "goodsname": goodsInfo.goodsname,
    "category": goodsInfo.category,
    "category_codes": goodsInfo.category_codes,
    "subid": goodsInfo.subid,
    "subid_codes": goodsInfo.subid_codes,
    "topic": goodsInfo.topic,
    "theme": goodsInfo.theme,
    "busmodel": goodsInfo.busmodel,
    "delivery": goodsInfo.delivery,
    "supply": goodsInfo.supply,
    "spec": goodsInfo.spec,
    "unit": goodsInfo.unit,
    "checksums": goodsInfo.checksums,
    "productionplace": goodsInfo.productionplace,
    "brandinfo": goodsInfo.brandinfo,
    "expressfee": goodsInfo.expressfee,
    "maxcanuseintegral": goodsInfo.maxcanuseintegral,
    "hotsell": goodsInfo.hotsell,
    "goods_flag": goodsInfo.goods_flag,
    "goods_type": goodsInfo.goods_type,
    "stockflag": goodsInfo.stockflag,
    "quantity": {
      "stockqty":0,
      "availableqty":0,
      "frozenqty":0
    },
    "price":{
      "lowprice":0,
      "highprice":0,
      "saleprice":0
    }, 
    /*goodsInfo.quantity ? {
      "minqty": goodsInfo.quantity.minqty,
      "stockqty": goodsInfo.quantity.stockqty,
      "totalqty": goodsInfo.quantity.totalqty,
      "availableqty": goodsInfo.quantity.availableqty,
      "frozenqty": goodsInfo.quantity.frozenqty,
      
    } : {},goodsInfo.price ? {
      "presaleprice": goodsInfo.price.presaleprice,
      "originalprice": goodsInfo.price.originalprice,
      "taxprice": goodsInfo.price.taxprice,
      "saleprice": goodsInfo.price.saleprice,
      "stockprice": goodsInfo.price.stockprice,
      "memberprice": goodsInfo.price.memberprice,
      "groupprice": goodsInfo.price.groupprice,
      "lowprice": goodsInfo.price.lowprice,
      "highprice": goodsInfo.price.highprice,
    } : {},
    /modelitems": goodsInfo.modelitems,
    "models": goodsInfo.models,
    "models_mainkey": goodsInfo.models_mainkey,
    "models_mainkey_idx": goodsInfo.models_mainkey_idx,
    */
    "description": goodsInfo.description,
    "importflag": goodsInfo.importflag,
    "importstate": goodsInfo.importstate,  
    "infopath": goodsInfo.infopath,
    "packlistpath": goodsInfo.packlistpath,
    "specpath": goodsInfo.specpath,
    "imginfo": goodsInfo.imginfo.map(v=>{return {fileID:v.fileID,height:v.height,width:v.width,status:v.status}}),/**滚动 */
    "picpath": goodsInfo.picpath.map(v=>{return {fileID:v.fileID,height:v.height,width:v.width,status:v.status}}),
    //"models_imgkey": goodsInfo.models_imgkey,
    "support_drawback": goodsInfo.support_drawback,
    "parameter": goodsInfo.parameter,
    "ensure": goodsInfo.ensure,
    
    "keywords": goodsInfo.keywords,
    "summary": goodsInfo.summary
  };

  if (goodsInfo.modelitems) {
    var temp = getSalePrice(goodsInfo);
    goods.price.lowprice = temp[0];
    goods.price.highprice = temp[1];
    goods.price.saleprice = goods.price.lowprice;
    goods.quantity.stockqty = temp[2];
    goods.models_num = temp[3];
  } else {
    goods.price.saleprice = goodsInfo.price.saleprice;
    goods.price.lowprice = goodsInfo.price.saleprice;
    goods.price.highprice = goodsInfo.price.saleprice;
    goods.models_num = 1;
    goods.quantity.stockqty = (goodsInfo.quantity.stockqty||0);
  }
  if(isAdd){
    goods.settime = new Date();
    goods._id = mySeq.mySeq32("GOO");
    goods.quantity.buycount = 0;
    goods.goodsno =  goods._id;
  }
  //商品信息存储配置目录：userInfo.basedir=P350000/350700/ounQF5gNI1fojHjR6JnyBekJpowQ/
  //shopinfo.basedir = userinfo.basedir+"shop/"+shopinfo.shopid+"/";
  goods.basedir = userInfo.shopinfo.basedir + "goods/" + goods.goodsno + "/";

  goods.updatetime = new Date();
  goods.status = shopcfg.APPR_ADDGOODS == '1' ? 'P' : '1'; //P:待审核,1正常
  return goods;

}

module.exports = {
  getSalePrice:getSalePrice,
  getStock:getStock,
  getGoods:getGoods
}