var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "shop";

const SERV_SEARCH = "search";
const SERV_GET_SHOPIMG = "getShopImg";
const SERV_GET_SHOPTHEMA = "getShopThema";
const ACT_LISTDATA = "listCategory";
const SERV_GET_SHOPDETAIL = "getShopDetail";
/*
const SERV_ADD_SHOPIMG = "addShopImg";
const ACT_ADDDATA = "addCategory";

const ACT_MODDATA = "modCategory";
const ACT_DELDATA = "delCategory";
const SERV_ADD_SHOPTHEMA="addShopThema"
const SERV_CREATESHOP = "createShop";
const SERV_MODSHOP = "modShop";
const SERV_GET_SHOPBYUSERID = "getShopByUserId";
const SERV_SET_DEFAULTSHOP = "setDefaultShop";
*/


var search = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SEARCH;
  return utils.requestEx(SERV_MANAGER, params);
};

var getShopImg = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_SHOPIMG;
  return utils.requestEx(SERV_MANAGER, params);
};
var getShopThema = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_SHOPTHEMA;
  return utils.requestEx(SERV_MANAGER, params);
}
/** 店铺内产品分类操作 */
var listCategory = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTDATA;
  return utils.requestEx(SERV_MANAGER, params);
}
var getShopDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_SHOPDETAIL;

  return utils.requestEx(SERV_MANAGER, params);
};
/*
var createShop = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_CREATESHOP;
  return utils.requestEx(SERV_MANAGER, params);
};
var addShopImg = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADD_SHOPIMG;
  return utils.requestEx(SERV_MANAGER, params);
};
var modShop = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_MODSHOP;

  return utils.requestEx(SERV_MANAGER, params);
};
var getShopByUserId = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_SHOPBYUSERID;

  return utils.requestEx(SERV_MANAGER, params);
};

var getShopid = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_SHOPID;

  return utils.requestEx(SERV_MANAGER, params);
};

var addCategory = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDDATA;
  return utils.requestEx(SERV_MANAGER, params);
}
var modCategory = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_MODDATA;
  return utils.requestEx(SERV_MANAGER, params);
}

var delCategory = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_DELDATA;
  return utils.requestEx(SERV_MANAGER, params);
}
var addShopThema=(params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADD_SHOPTHEMA;
  return utils.requestEx(SERV_MANAGER, params);
}
*/



module.exports = {
  search: search,  
  getShopDetail: getShopDetail,
  getShopImg: getShopImg,  
  listCategory: listCategory,
  getShopThema: getShopThema,
  /*
  getShopByUserId: getShopByUserId,
  modShop: modShop,
  createShop: createShop,
  getShopid: getShopid,
  addShopImg: addShopImg,
  delCategory: delCategory,
  modCategory: modCategory,
  addCategory: addCategory,
  addShopThema: addShopThema*/
}