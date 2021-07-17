var utils = require("../utils/rpc.js");
const SERV_MANAGER = "pay";
const TRANSTYPE_WX = "wx";
const TRANSTYPE_ACTION = "action";

const TRANSTYPE_QUERY = "query";
const TRANSTYPE_OPER = "oper";
const SERV_UNIFIED_ORDER = "unifiedOrder";
const SERV_QUERY_ORDER = "queryOrder";
const SERV_GETSIGN_KEY = "getSignKey";
const SERV_GETPAYMENT = "getPayment";
const SERV_GETPAYMENTBYID = "getPaymentById";
const SERV_ROLLBACKSTOCK = "rollBackStock";
const SERV_CASHOUT = "cashout";

const SERV_ACT_PRE_PAY = "prePay";
const SERV_ACT_QUERY_PAY_RESULT = "queryResult";
const SERV_ACT_ACTREFUND = "reFund";
/**
 * query out array
 * */
var getPayment = (params) => {
  params.transtype = TRANSTYPE_QUERY;
  params.actionname = SERV_GETPAYMENT;
  return utils.requestEx(SERV_MANAGER, params);
};
var getPaymentById = (params) => {
  params.transtype = TRANSTYPE_QUERY;
  params.actionname = SERV_GETPAYMENTBYID;
  return utils.requestEx(SERV_MANAGER, params);
};
var rollBackStock = (params) => {
  params.transtype = TRANSTYPE_OPER;
  params.actionname = SERV_ROLLBACKSTOCK;
  return utils.requestEx(SERV_MANAGER, params);
};
/**
 * pay
 * */
var unifiedOrder = (params) => {
  params.transtype = TRANSTYPE_WX;
  params.actionname = SERV_UNIFIED_ORDER;
  return utils.requestEx(SERV_MANAGER, params);
};
var queryOrder = (params) => {
  params.transtype = TRANSTYPE_WX;
  params.actionname = SERV_QUERY_ORDER;
  return utils.requestEx(SERV_MANAGER, params);
};
var getSignKey = (params) => {
  params.transtype = TRANSTYPE_WX;
  params.actionname = SERV_GETSIGN_KEY;
  return utils.requestEx(SERV_MANAGER, params);
};
var cashout = (params) => {
  params.transtype = TRANSTYPE_WX;
  params.actionname = SERV_CASHOUT;
  return utils.requestEx(SERV_MANAGER, params);
};
/**
 * pay action
 */

var actReFund = (params) => {
  params.transtype = TRANSTYPE_ACTION;
  params.actionname = SERV_ACT_ACTREFUND;
  return utils.requestEx(SERV_MANAGER, params);
};
var actPrePay = (params)=>{
  params.transtype = TRANSTYPE_ACTION;
  params.actionname = SERV_ACT_PRE_PAY;
  return utils.requestEx(SERV_MANAGER, params);
}
var actQueryPayResult = (params) => {
  params.transtype = TRANSTYPE_ACTION;
  params.actionname = SERV_ACT_QUERY_PAY_RESULT;
  return utils.requestEx(SERV_MANAGER, params);
};
module.exports = {
  cashout: cashout,
  getPaymentById:getPaymentById,
  getPayment:getPayment,
  rollBackStock: rollBackStock,
  unifiedOrder: unifiedOrder,
  queryOrder: queryOrder,
  getSignKey: getSignKey,
  actPrePay:actPrePay,
  actReFund:actReFund,
  actQueryPayResult:actQueryPayResult
}