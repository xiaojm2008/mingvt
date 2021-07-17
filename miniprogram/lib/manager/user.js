var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "user";
const ACT_GETUSERRIGHT = "getUserRight";
const ACT_GETUSERGRANTRIGHT = "getUserGrantRight";
const ACT_ADDUSERBENEFIT = "addUserBenefit";
const ACT_LISTUSER = "listUser";
const ACT_GETUSERINFO = "getUserInfo";
const ACT_ADDUSER = "addUser";
const ACT_UPDUSER = "updUser";
const ACT_ADDUSERRIGHT = "addUserRight";
const ACT_ADDUSERGRANTRIGHT ="addUserGrantRight";
const ACT_GETUSERROLES = "getUserRole";

const ACT_GETUSERMENU = "getUserMenu";
const ADD_FOUNDER = "addFounder";
const ACT_ADDUSERROLES = "addUserRole";
const ACT_INSERTUSERROLE = "insertUserRole";


//20190724
var getUserRight = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETUSERRIGHT;
  return utils.requestEx(SERV_MANAGER, params);
}
var addUserRight = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDUSERRIGHT;
  return utils.requestEx(SERV_MANAGER, params);
}
var getUserGrantRight = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETUSERGRANTRIGHT;
  return utils.requestEx(SERV_MANAGER, params);
}
var addUserGrantRight = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDUSERGRANTRIGHT;
  return utils.requestEx(SERV_MANAGER, params);
}
var addUserBenefit = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDUSERBENEFIT;
  return utils.requestEx(SERV_MANAGER, params);
}
var listUser = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_LISTUSER;
  return utils.requestEx(SERV_MANAGER, params);
}
var getUserInfo = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETUSERINFO;
  return utils.requestEx(SERV_MANAGER, params);
}
var addUser = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDUSER;
  return utils.requestEx(SERV_MANAGER, params);
}
var updUser = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_UPDUSER;
  return utils.requestEx(SERV_MANAGER, params);
}
var getUserRole = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETUSERROLES;
  return utils.requestEx(SERV_MANAGER, params);
}
var addUserRole = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDUSERROLES;
  return utils.requestEx(SERV_MANAGER, params);
}
var insertUserRole = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = ACT_INSERTUSERROLE;
  return utils.requestEx(SERV_MANAGER, params);
}
var getUserMenu = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETUSERMENU;
  return utils.requestEx(SERV_MANAGER, params);
}
const ADD_SYS_USERINFO = 'addSysUserInfo';

var addFounder = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ADD_FOUNDER;
  return utils.requestEx(SERV_MANAGER, params);
}

module.exports = {
  addFounder: addFounder,
  updUser: updUser,
  getUserMenu:getUserMenu,
  addUser: addUser,
  getUserInfo: getUserInfo,
  listUser: listUser,
  addUserRight: addUserRight,
  getUserRight: getUserRight,
  getUserGrantRight: getUserGrantRight,
  addUserGrantRight: addUserGrantRight,
  getUserRole:getUserRole,
  addUserRole: addUserRole,
  addUserBenefit: addUserBenefit,
  insertUserRole: insertUserRole
}