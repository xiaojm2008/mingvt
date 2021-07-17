var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "thema";

const SERV_ADD_THEMA = "addThema"
const SERV_GET_THEMA = "getThemaDetail";

var addThema = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADD_THEMA;
  return utils.requestEx(SERV_MANAGER, params);
}
var getThemaDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_THEMA;
  return utils.requestEx(SERV_MANAGER, params);
}

module.exports = {
  addThema: addThema,
  getThemaDetail: getThemaDetail,
}