var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "settle";
const ACT_SETTLE = "settle"; //订单结算
const ACT_GETBALDETAIL = "getBalDetail"; //订单结算

var settle = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_SETTLE;
  return utils.requestEx(SERV_MANAGER, params);
}
var getBalDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETBALDETAIL;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  getBalDetail:getBalDetail,
  settle:settle
}