var utils = require("../utils/rpc.js");
const SERV_MANAGER = "exp";
const TRANSTYPE = "act";

const SERV_EXPENROLLINFO = "expEnrollInfo";


var expEnrollInfo = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_EXPENROLLINFO;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  expEnrollInfo:expEnrollInfo
}