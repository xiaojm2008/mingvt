var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "comment";

const SERV_ADDCOMMENT = "addComment";
const SERV_GET_COMMENTLIST = "getCommentList";
const SERV_DEL_COMMENT = "delComment";

var addComment = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_ADDCOMMENT;

  return utils.requestEx(SERV_MANAGER,params);
}
var getCommentList = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_COMMENTLIST;

  return utils.requestEx(SERV_MANAGER,params);
}
var delComment = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_DEL_COMMENT;

  return utils.requestEx(SERV_MANAGER, params);
}

module.exports = {
  addComment: addComment,
  getCommentList: getCommentList,
  delComment: delComment
}