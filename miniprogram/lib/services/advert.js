var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "advert";

const SERV_GETAVERT = "getAdvert";


var getAdvert = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETAVERT;
  return utils.requestEx(SERV_MANAGER, params);
}

module.exports = {
  getAdvert:getAdvert
}