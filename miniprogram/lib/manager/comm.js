var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "comm";
const ACT_FIELDFORMAT = "fieldFormat";
const ACT_SHOPFORMAT = "shopFormat";
const ACT_DODELIVERY_FORMAT = "doDeliveryFormat";
const ACT_STATE = "getState";
const ACT_ACTION = "action";
/**
 * 商品信息格式定义
 */
var fieldFormat  = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_FIELDFORMAT;
  return utils.requestEx(SERV_MANAGER, params);
}
/**
 * 商铺信息格式定义
 */
var shopFormat = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_SHOPFORMAT;
  return utils.requestEx(SERV_MANAGER, params);
}
var doDeliveryFormat = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_DODELIVERY_FORMAT;
  return utils.requestEx(SERV_MANAGER, params);
}
var getState = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_STATE;
  return utils.requestEx(SERV_MANAGER, params);
}
var action = (params) => {
  params.transtype = '';
  params.actionname = ACT_ACTION;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  action: action,
  getState: getState,
  shopFormat: shopFormat,
  fieldFormat: fieldFormat,
  doDeliveryFormat: doDeliveryFormat
}