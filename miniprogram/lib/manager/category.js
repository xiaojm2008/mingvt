var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "category";
const ACT_ADDDATA = "addCategory";
const ACT_LISTDATA = "listCategory";
const ACT_MODDATA = "modCategory";
const ACT_DELDATA = "delCategory";
var listCategory = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTDATA;
  return utils.requestEx(SERV_MANAGER, params);
}
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

module.exports = {
  delCategory: delCategory,
  modCategory: modCategory,
  addCategory: addCategory,
  listCategory: listCategory
}