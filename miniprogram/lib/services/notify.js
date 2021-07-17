var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "user";

const SERV_GET_NOTIFYNUM = "getNotifyNum";
const SERV_GET_NOTIFYLIST = "getNotifyList";

var getNotifyNum = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_NOTIFYNUM;

  return utils.requestEx(SERV_MANAGER, params);
};
var getNotifyList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_NOTIFYLIST;
  return utils.requestEx(SERV_MANAGER, params);
};

module.exports = {
  getNotifyNum: getNotifyNum,
  getNotifyList: getNotifyList
}