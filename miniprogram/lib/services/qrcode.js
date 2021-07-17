var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "user";

const SERV_GET_QRCODE = "getQrCode";

var getQrCode = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_QRCODE;

  return utils.requestEx(SERV_MANAGER, params);
};

module.exports = {
  getQrCode: getQrCode
}