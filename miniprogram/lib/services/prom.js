var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "prom";
const ACT_GETPROMLIST = "getPromList";
const ACT_GETPROMDETAIL = "getPromDetail";
const SERV_SEARCH = "search";
var getPromList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETPROMLIST;
  return utils.requestEx(SERV_MANAGER, params);
}
var getPromDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETPROMDETAIL;
  return utils.requestEx(SERV_MANAGER, params);
}
var search = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SEARCH;
  return utils.requestEx(SERV_MANAGER, params);
};
module.exports = {
  search: search,
  getPromDetail: getPromDetail,
  getPromList: getPromList
}