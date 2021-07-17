var utils = require("../utils/rpc.js");

const SERV_MANAGER = "trader";
const TRANSTYPE = "user";

const SERV_GET_MYTEAM_LIST = "getMyTeamList";
const SERV_JOIN_TEAM = "joinTeam";

var getMyTeamList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_MYTEAM_LIST;

  return utils.requestEx(SERV_MANAGER, params);
};
var joinTeam = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_JOIN_TEAM;

  return utils.requestEx(SERV_MANAGER, params);
};

module.exports = {
  getMyTeamList: getMyTeamList,
  joinTeam: joinTeam
}