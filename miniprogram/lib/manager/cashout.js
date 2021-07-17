var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "cashout";
const ACT_CASHOUT = "cashout"; //提现申请
const ACT_GENDEAL = "gendeal"; //提现金额数据生成
const ACT_CASHOUTAPPR = "cashoutAppr";//提现审批（系统管理员权限）
const ACT_GENDEALMONTH = "gendealMonth";//生成月提现金额数据
const ACT_GENPAYMENTMONTH = "genPaymentMonth";//生成月订单支付数据
const ACT_LISTCASHOUTAPP = "listCashoutApp";//提现申请列表

var cashout = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_CASHOUT;
  return utils.requestEx(SERV_MANAGER, params);
}
var cashoutAppr = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_CASHOUTAPPR;
  return utils.requestEx(SERV_MANAGER, params);
}
var gendeal = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GENDEAL;
  return utils.requestEx(SERV_MANAGER, params);
}
var gendealMonth = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GENDEALMONTH;
  return utils.requestEx(SERV_MANAGER, params);
}

var genPaymentMonth = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GENPAYMENTMONTH;
  return utils.requestEx(SERV_MANAGER, params);
}
var listCashoutApp = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTCASHOUTAPP;
  return utils.requestEx(SERV_MANAGER, params);
}

module.exports = {
  cashout:cashout,
  cashoutAppr:cashoutAppr,
  gendeal:gendeal,
  gendealMonth:gendealMonth,
  genPaymentMonth:genPaymentMonth,
  listCashoutApp:listCashoutApp
}