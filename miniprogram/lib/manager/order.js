var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "order";
const ACT_GETORDERLIST = "getOrderList";
const ACT_GETORDERDETAIL = "getOrderDetail";
const ACT_SETORDERSTATUS = "setOrderStatus";

var getOrderList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETORDERLIST;
  return utils.requestEx(SERV_MANAGER, params);
}

var getOrderDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETORDERDETAIL;
  return utils.requestEx(SERV_MANAGER, params);
}
var setOrderStatus = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_SETORDERSTATUS;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  getOrderList: getOrderList,
  getOrderDetail: getOrderDetail,
  setOrderStatus: setOrderStatus
}