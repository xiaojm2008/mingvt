var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "mixed";

const SERV_DEFAULTFIELD = "defaultField";
const SERV_DEFAULTFIELD_ADD = "defaultFieldAdd";
const SERV_DEFAULTFIELD_DEL = "defaultFieldDel";
const SERV_LISTFIELDTEMPLATE = "listFieldTemplate";
const SERV_DICT = "dict";
const SERV_CLIENTCFG = "clientcfg";
const SERV_MIXED = "mixed";
const SERV_GETCATEGORY="getCategory";
var defaultField = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DEFAULTFIELD;
  return utils.requestEx(SERV_MANAGER, params);
}
var defaultFieldAdd = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DEFAULTFIELD_ADD;
  return utils.requestEx(SERV_MANAGER, params);
}
var listFieldTemplate = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_LISTFIELDTEMPLATE;
  return utils.requestEx(SERV_MANAGER, params);
}
var defaultFieldDel = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DEFAULTFIELD_DEL;
  return utils.requestEx(SERV_MANAGER, params);
}
var dict = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DICT;
  return utils.requestEx(SERV_MANAGER, params);
}
var clientCfg = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_CLIENTCFG;
  return utils.requestEx(SERV_MANAGER, params);
}
var mixed = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_MIXED;
  return utils.requestEx(SERV_MANAGER, params);
}
var getCategory = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETCATEGORY;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  defaultField: defaultField,
  defaultFieldAdd: defaultFieldAdd,
  defaultFieldDel: defaultFieldDel,
  listFieldTemplate: listFieldTemplate,
  getCategory: getCategory,
  dict:dict,
  clientCfg: clientCfg,
  mixed: mixed
}