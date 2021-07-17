var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "goods";
const ACT_ADDCAROUSEL = "addCarousel";
const ACT_ADDGOODS = "addGoods";
const ACT_MODGOODS = "modGoods";
const ACT_DELGOODS = "delGoods";
const ACT_GETGOODSDETAIL = "getGoodsDetail";
const ACT_LISTGOODS = "listGoods";
const ACT_GETCATEGORY = "getCategory";

var getGoodsDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETGOODSDETAIL;
  return utils.requestEx(SERV_MANAGER, params);
}

var listGoods = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTGOODS;
  return utils.requestEx(SERV_MANAGER, params);
}
var addCarousel = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDCAROUSEL;
  return utils.requestEx(SERV_MANAGER, params);
}
var addGoods = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDGOODS;
  return utils.requestEx(SERV_MANAGER, params);
}
var modGoods = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_MODGOODS;
  return utils.requestEx(SERV_MANAGER, params);
}
var delGoods = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_DELGOODS;
  return utils.requestEx(SERV_MANAGER, params);
}
var getCategory = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETCATEGORY;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  addCarousel:addCarousel,
  getCategory: getCategory,
  listGoods: listGoods,
  getGoodsDetail: getGoodsDetail,
  addGoods: addGoods,
  modGoods: modGoods,
  delGoods: delGoods
}