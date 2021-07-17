var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "advert";

const SERV_GETAVERTLIST = "getAdvertList";
const SERV_ADDADVERT = "addAdvert";
const SERV_GETADVERTDETAIL = "getAdvertDetail";

var getAdvertList = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETAVERTLIST;
  return utils.requestEx(SERV_MANAGER, params);
}
var addAdvert = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADDADVERT;
  return utils.requestEx(SERV_MANAGER, params);
}
var getAdvertDetail = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETADVERTDETAIL;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  getAdvertList:getAdvertList,
  getAdvertDetail:getAdvertDetail,
  addAdvert: addAdvert
}