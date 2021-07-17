var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "address";

const SERV_ADDADDRESS = "addAddress";
const SERV_GET_ADDRESSLIST = "getAddressList";
const SERV_DEL_ADDRESS = "deleteAddress";

var addAddress = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADDADDRESS;
  return utils.requestEx(SERV_MANAGER, params);
}

var getAddressList = (params) => {
  if(!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_ADDRESSLIST;
  return utils.requestEx(SERV_MANAGER, params);
}

var deleteAddress = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DEL_ADDRESS;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  addAddress: addAddress,
  getAddressList: getAddressList,
  deleteAddress: deleteAddress
}