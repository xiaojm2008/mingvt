var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "share";

const SERV_ADDSHAREINFO = "addShareInfo";

var addShareInfo = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADDSHAREINFO;

  return utils.requestEx(SERV_MANAGER, params);
};

module.exports = {
  addShareInfo: addShareInfo
}