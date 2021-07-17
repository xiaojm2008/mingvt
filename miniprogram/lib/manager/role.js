var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "role";
const ACT_LISTROLE = "listRole";
const ACT_GETROLEINFO= "getRoleInfo";
const ACT_ADDROLE = "addRole";
const ACT_UPDROLE = "updRole";
const ACT_ADDROLERIGHT = "addRoleRight";
const ACT_GETROLERIGHT = "getRoleRight";
const ACT_GETROLEUSER = "getRoleUser";
const ACT_DELROLE = "delRole";
const ACT_GETROLEMENU = "getRoleMenu";
const ACT_ADDROLEMENU = "addRoleMenu";
//20190724
var updRole = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_UPDROLE;
  return utils.requestEx(SERV_MANAGER, params);
}
var addRole = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDROLE;
  return utils.requestEx(SERV_MANAGER, params);
}
var delRole = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_DELROLE;
  return utils.requestEx(SERV_MANAGER, params);
}
var getRoleInfo = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETROLEINFO;
  return utils.requestEx(SERV_MANAGER, params);
}
var listRole = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTROLE;
  return utils.requestEx(SERV_MANAGER, params);
}
var getRoleRight = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETROLERIGHT;
  return utils.requestEx(SERV_MANAGER, params);
}
var addRoleRight = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDROLERIGHT;
  return utils.requestEx(SERV_MANAGER, params);
}
var getRoleUser = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETROLEUSER;
  return utils.requestEx(SERV_MANAGER, params);
}
var getRoleMenu = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETROLEMENU;
  return utils.requestEx(SERV_MANAGER, params);
}
var addRoleMenu = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDROLEMENU;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  delRole: delRole,
  updRole: updRole,
  addRole: addRole,
  getRoleInfo: getRoleInfo,
  listRole: listRole,
  getRoleRight: getRoleRight,
  getRoleUser: getRoleUser,
  addRoleRight: addRoleRight,
  addRoleMenu: addRoleMenu,
  getRoleMenu: getRoleMenu
}