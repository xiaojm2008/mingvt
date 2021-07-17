var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "user";
const SERV_SAVEUSERINFO = "saveUserInfo";
const SERV_GETUSERINFO = "getUserInfo";
const SERV_GETUSERBYID= "getUserById";
const SERV_MEMMENU = "getMemMenu";
const SERV_GETUSERBENEFIT = "getUserBenefit";
//20190724
const SERV_GETKNOWN = "getKnown"; //须知
const SERV_OPENSHOP = "openShop";
const SERV_VERIFYFEE = "verifyFee";//支付保证金额确认
const SERV_SAVELOCATION = "saveLocation";
const SERV_SIGININ = "signin";

var getMemMenu = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_MEMMENU;
  return utils.requestEx(SERV_MANAGER,params);
}
var saveUserInfo = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SAVEUSERINFO;
  return utils.requestEx(SERV_MANAGER,params);
}
var getUserInfo = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETUSERINFO;
  return utils.requestEx(SERV_MANAGER,params);
}
var getUserBenefit = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETUSERBENEFIT;
  return utils.requestEx(SERV_MANAGER,params);
}
var getKnown = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETKNOWN;
  return utils.requestEx(SERV_MANAGER, params);
}
var openShop = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_OPENSHOP;
  return utils.requestEx(SERV_MANAGER, params);
}
var verifyFee = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_VERIFYFEE;
  return utils.requestEx(SERV_MANAGER, params);
}
var getUserById = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETUSERBYID;
  return utils.requestEx(SERV_MANAGER, params);
}
var saveLocation = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SAVELOCATION;
  return utils.requestEx(SERV_MANAGER, params);
}
var signin = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SIGININ;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  signin: signin,
  getMemMenu:getMemMenu,
  saveLocation: saveLocation,
  getUserById: getUserById,
  openShop: openShop,
  getKnown: getKnown,
  verifyFee: verifyFee,
  //setDefaultShop: setDefaultShop,移到manager/shop对应目录
  //addSysUserInfo: addSysUserInfo,修改为addFounder了，在manager/user目录
  saveUserInfo : saveUserInfo,
  getUserInfo: getUserInfo,
  getUserBenefit: getUserBenefit
}