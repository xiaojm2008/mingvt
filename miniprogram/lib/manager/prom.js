var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "prom";
const ACT_LISTPROM = "listProm";
const ACT_GETPROMINFO = "getPromInfo";
const ACT_ADDPROM = "addProm";
const ACT_MODPROM = "modProm";
const ACT_DELPROM = "delProm";
const ACT_DELPROMGOODS = "delPromGoods";
const ACT_ADDPROMGOODS = "addPromGoods";
const ACT_GETPROMGOODS = "getPromGoods";
const ACT_GETPROMGSHOP = "getPromShop";
const ACT_GETPROMBYID = "getPromById";
//20190724
var modProm = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_MODPROM;
  return utils.requestEx(SERV_MANAGER, params);
}
var addProm = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDPROM;
  return utils.requestEx(SERV_MANAGER, params);
}
var delProm= (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_DELPROM;
  return utils.requestEx(SERV_MANAGER, params);
}
var delPromGoods = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_DELPROMGOODS;
  return utils.requestEx(SERV_MANAGER, params);
}
var getPromInfo = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETPROMINFO;
  return utils.requestEx(SERV_MANAGER, params);
}
var listProm= (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTPROM;
  return utils.requestEx(SERV_MANAGER, params);
}
var getPromGoods = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETPROMGOODS;
  return utils.requestEx(SERV_MANAGER, params);
}
var addPromGoods = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDPROMGOODS;
  return utils.requestEx(SERV_MANAGER, params);
}
var getPromShop = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETPROMGSHOP;
  return utils.requestEx(SERV_MANAGER, params);
}
var getPromById = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETPROMBYID;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  delProm: delProm,
  delPromGoods: delPromGoods,
  modProm: modProm,
  addProm: addProm,
  getPromInfo: getPromInfo,
  listProm: listProm,
  getPromShop: getPromShop,
  addPromGoods: addPromGoods,
  getPromGoods: getPromGoods,
  getPromById: getPromById
}