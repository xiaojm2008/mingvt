var utils = require("../utils/rpc.js");
const SERV_MANAGER = "manager";
const TRANSTYPE = "logistics";
const ACT_CANCELLOGISTICS = "cancelLogistics";
const ACT_CREATELOGISTICS = "createLogistics";
const ACT_CETLOGISTICS_DETAIL = "getLogisticsDetail";
const ACT_GETORDERDETAILBYLOGISID = "getOrderDetailByLogisId";
const ACT_GETEXPINFO = "getExpInfo";
const ACT_ADDBN = "addBN";
//******************************** */
const SERV_NAME = "transLogistics";

const TRANSCODE_GET_PATH = "GET_PATH";
const TRANSCODE_GET_BN = "GET_BN";
const TRANSCODE_ADD_BN = "ADD_BN";

var getLogisticsPath = (params) => {
  params.transcode = TRANSCODE_GET_PATH;
  return utils.requestEx(SERV_NAME, params);
};
var getBN = (params) => {
  params.transcode = TRANSCODE_GET_BN;
  return utils.requestEx(SERV_NAME, params);
};

var addBN_ = (params) => {
  params.transcode = TRANSCODE_ADD_BN;
  return utils.requestEx(SERV_NAME, params);
};
/********************************************* */
//indexlist 页面 rpc.doAtion 方式调用了 logistics.getExpInfo
var addBN = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_ADDBN;
  return utils.requestEx(SERV_MANAGER, params);
};
var getExpInfo = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETEXPINFO;
  return utils.requestEx(SERV_MANAGER, params);
};
var getLogisticsDetail = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_CETLOGISTICS_DETAIL;
  return utils.requestEx(SERV_MANAGER, params);
};
var createLogistics = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_CREATELOGISTICS;
  return utils.requestEx(SERV_MANAGER, params);
};
var cancelLogistics = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = ACT_CANCELLOGISTICS;
  return utils.requestEx(SERV_MANAGER, params);
};
var getOrderDetailByLogisId=(params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = ACT_GETORDERDETAILBYLOGISID;
  return utils.requestEx(SERV_MANAGER, params);
}
module.exports = {
  getOrderDetailByLogisId: getOrderDetailByLogisId,
  getLogisticsDetail: getLogisticsDetail,
  getLogisticsPath: getLogisticsPath,
  createLogistics: createLogistics,
  cancelLogistics: cancelLogistics,
  getExpInfo: getExpInfo,
  getBN: getBN,
  addBN:addBN
}