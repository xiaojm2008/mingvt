//获取报名人员清单信息
const utils = require("../comm/utils.js");
const cloud = require('wx-server-sdk')
const query = require('../comm/query.js');
const query2 = require('../comm/query2.js');

cloud.init({
  env: require("../env.js")
})


const MAX_LIMIT = 10;

module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  if(!event.actionid || !event.actionid.trim()){
    return {
      errMsg:"参数错误"
    }
  }
  const db = cloud.database();
  const $ = db.command;

  var _and = [],_or=[];

  _and.push({actionid:event.actionid});

  if(_or.length>0){
    if(_and.length>0){
      _and.push($.or(_or));
      _and = $.and(_and);
    } else {
      _and = $.or(_or);
    }
  } else {
    _and = _and.length>0?$.and(_and):{};
  }
  
  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: event.page_size||10,
    orderby_field: "settime",
    orderby_type: "desc",
    batch_time: event.batch_time || 0
  }
  
  //const aggr = db.command.aggregate;
  
  var selectField = {
    settime:1,/**这个是排序字段，需要输出，要不不能排序 */
    openid:1,
    x_username:1,
    avatarurl:1
  };

  return await query2('xlh_enrollinfo', _and, ctrlParams, selectField);
}