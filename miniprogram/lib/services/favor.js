var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "favor";

const SERV_CLEARFAVOR = "clearFavor";
const SERV_ADDFAVOR = "addFavor";
const SERV_DEL_FAVOR = "delFavor";
const SERV_GET_FAVORLIST = "getFavorList";

var addFavor = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADDFAVOR;
  return utils.requestEx(SERV_MANAGER, params);
}

var delFavor = (params) => {
  if(!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DEL_FAVOR;
  return utils.requestEx(SERV_MANAGER, params);
}
var clearFavor = (params)=>{
  if(!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_CLEARFAVOR;
  return utils.requestEx(SERV_MANAGER, params);
}
var getFavorList = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_FAVORLIST;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  addFavor: addFavor,
  clearFavor:clearFavor,
  getFavorList: getFavorList,
  delFavor: delFavor
}