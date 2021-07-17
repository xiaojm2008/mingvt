var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "order";
const SERV_SEARCH = "search";
const SERV_ORDERPENDING = "addOrderPending";
const SERV_ADDORDER = "addOrder";
const SERV_GET_ORDERDETAIL="getOrderDetail";
const SERV_CANCEL_ORDER="cancelOrder";
const SERV_GET_ORDERLIST = "getOrderList";
const SERV_SET_ORDERST = "setOrderStatus";

//const SERV_PAY_ORDER = "payOrder";

var search = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SEARCH;
  return utils.requestEx(SERV_MANAGER, params);
};
var addOrderPending = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ORDERPENDING;

  return utils.requestEx(SERV_MANAGER, params);
}

var addOrder = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADDORDER;

  return utils.requestEx(SERV_MANAGER, params);
}

var getOrderDetail = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_ORDERDETAIL;

  return utils.requestEx(SERV_MANAGER, params);
}
var cancelOrder = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_CANCEL_ORDER;

  return utils.requestEx(SERV_MANAGER,params);
}
var getOrderList = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_ORDERLIST;

  return utils.requestEx(SERV_MANAGER, params);
}
var setOrderStatus = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SET_ORDERST;

  return utils.requestEx(SERV_MANAGER, params);
}
/*
var payOrder = (params)=>{
  return utils.requestEx(SERV_PAY_ORDER, params);
}*/
module.exports = {
  search: search,
  addOrderPending: addOrderPending,
  addOrder: addOrder,
  getOrderDetail: getOrderDetail,
  getOrderList:getOrderList,
  cancelOrder:cancelOrder,
  setOrderStatus: setOrderStatus
  //payOrder: payOrder
}