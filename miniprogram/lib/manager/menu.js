var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "menu";
const ACT_GETMENULIST = "getMenuList";
const ACT_LISTMENU = "listMenu";
const ACT_ADDMENU = "addMenu";
const ACT_MODMENU = "modMenu";
const ACT_DELMENU = "delMenu";
var getMenuList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETMENULIST;
  return utils.requestEx(SERV_MANAGER, params);
}
var listMenu = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTMENU;
  return utils.requestEx(SERV_MANAGER, params);
}
var addMenu = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDMENU;
  return utils.requestEx(SERV_MANAGER, params);
}
var modMenu = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_MODMENU;
  return utils.requestEx(SERV_MANAGER, params);
}
var delMenu = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_DELMENU;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  delMenu: delMenu,
  modMenu: modMenu,
  addMenu: addMenu,
  getMenuList: getMenuList,
  listMenu: listMenu
}