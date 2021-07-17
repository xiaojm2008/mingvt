var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "action";

const SERV_ACTFORMAT = "actFormat";
const SERV_CREATEACTION = "createAction";
const SERV_GETACTIONIMGINFO = "getActionImgInfo";
const SERV_GETACTIONDETAIL = "getActionDetail";
const SERV_GETACTIONLIST= "getActionList";
const SERV_MODACTION = "modAction";
const SERV_SETACTIONSTATUS="setActionStatus";

const SERV_ENROLLFORM = "getEnrollForm";
const SERV_ADDENROLLINFO = "addEnrollInfo";
const SERV_GETENROLLINFODETAIL="getEnrollInfoDetail";
const SERV_GETENROLLINFONUM="getAdditional";
const SERV_GETENROLLPERSON="getEnrollPerson";

const SERV_SIGININ = "siginIn";

const SERV_GETENROLLINFOLIST = "getEnrollInfoList";

const SERV_GETMYENROLLINFOLIST = "getMyEnrollInfoList";
const SERV_DOENROLLCHECK = "doEnrollCheck";
const SERV_SETENROLLSTATUS = "doEnrollStatus";

var actFormat = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ACTFORMAT;
  return utils.requestEx(SERV_MANAGER, params);
}
var doEnrollStatus = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname =  SERV_SETENROLLSTATUS;
  return utils.requestEx(SERV_MANAGER, params);
}
var doEnrollCheck = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DOENROLLCHECK;
  return utils.requestEx(SERV_MANAGER, params);
}
var getEnrollPerson = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETENROLLPERSON;
  return utils.requestEx(SERV_MANAGER, params);
}
var setActionStatus = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SETACTIONSTATUS;
  return utils.requestEx(SERV_MANAGER, params);
}
var createAction = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_CREATEACTION;
  return utils.requestEx(SERV_MANAGER, params);
}
var getActionImgInfo=(params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETACTIONIMGINFO;
  return utils.requestEx(SERV_MANAGER, params);
}
var getActionDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETACTIONDETAIL;
  return utils.requestEx(SERV_MANAGER, params);
}
var getActionList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETACTIONLIST;
  return utils.requestEx(SERV_MANAGER, params);
}
var getEnrollForm = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ENROLLFORM;
  return utils.requestEx(SERV_MANAGER, params);
}
var modAction = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_MODACTION;
  return utils.requestEx(SERV_MANAGER, params);
}
var getMyEnrollInfoList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETMYENROLLINFOLIST;
  return utils.requestEx(SERV_MANAGER, params);
}
var getEnrollInfoList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETENROLLINFOLIST;
  return utils.requestEx(SERV_MANAGER, params);
}
//getEnrollInfoNum
var getAdditional=(params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETENROLLINFONUM;
  return utils.requestEx(SERV_MANAGER, params);
}
var getEnrollInfoDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETENROLLINFODETAIL;
  return utils.requestEx(SERV_MANAGER, params);
}
var addEnrollInfo = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADDENROLLINFO;
  return utils.requestEx(SERV_MANAGER, params);
}
var siginIn = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SIGININ;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  actFormat:actFormat,
  modAction: modAction,
  createAction: createAction,
  getActionImgInfo: getActionImgInfo,
  getActionDetail: getActionDetail,
  getActionList: getActionList,
  setActionStatus:setActionStatus,
  getEnrollForm: getEnrollForm,
  getMyEnrollInfoList:getMyEnrollInfoList,/**获取我的报名信息 */
  getEnrollInfoList: getEnrollInfoList,
  getEnrollInfoDetail: getEnrollInfoDetail,
  getAdditional:getAdditional,
  getEnrollPerson:getEnrollPerson,
  doEnrollStatus:doEnrollStatus,
  siginIn:siginIn,
  doEnrollCheck:doEnrollCheck,
  addEnrollInfo: addEnrollInfo
}