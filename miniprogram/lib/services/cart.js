var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "cart";

const SERV_GET_CARTLIST = "getCartList";
const SERV_ADD_CART = "addCart";
const SERV_DEL_CART = "delCart";
const SERV_GET_CARTNUM = "getCartNum";
const SERV_UPD_CARTNUM = "updCart";
const SERV_UPD_CARTITEM_ACTIVE = "updCartItemActive"
var getCartNum = (params) => {
  if(!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_CARTNUM;

  return utils.requestEx(SERV_MANAGER, params);
};
var getCartList = (params) => {
  if (!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_CARTLIST;

  return utils.requestEx(SERV_MANAGER, params);
};
var addCart = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADD_CART;

  return utils.requestEx(SERV_MANAGER, params);
};
var delCart = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DEL_CART;

  return utils.requestEx(SERV_MANAGER, params);
};
var updCart = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_UPD_CARTNUM;

  return utils.requestEx(SERV_MANAGER, params);
};
var updCartItemActive =(params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_UPD_CARTITEM_ACTIVE;

  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  addCart: addCart,
  delCart: delCart,
  updCart, updCart,
  updCartItemActive: updCartItemActive,
  getCartNum, getCartNum,
  getCartList: getCartList
}