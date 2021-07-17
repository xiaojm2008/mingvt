var utils = require("../utils/rpc.js");
const SERV_MANAGER = "comm";
const TRANSTYPE = "";
const SERV_GET_AREALIST = "getAreaList";
const SERV_GET_DICTVALUELIST = "getDictValueList";

const TRADER_TRANSTYPE = "comm";
const SERV_TRADER_COMM = "trader";
const DECRYPT_WX_DATA = "decryptWXData";

var getAreaList = (params) => {
  if (!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_AREALIST;

  return utils.requestEx(SERV_MANAGER, params);
};
var getDictValueList = (params)=>{ 
  if (!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_DICTVALUELIST;

  return utils.requestEx(SERV_MANAGER,params);
}
var decryptWXData = (params)=>{
  if (!params) params = {};
  params.transtype = TRADER_TRANSTYPE;
  params.actionname = DECRYPT_WX_DATA;
  return utils.requestEx(SERV_TRADER_COMM, params);
}
module.exports={
  decryptWXData: decryptWXData,
  getAreaList: getAreaList,
  getDictValueList: getDictValueList
}