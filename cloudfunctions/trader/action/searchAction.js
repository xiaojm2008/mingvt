// 云函数入口文件
const cloud = require('wx-server-sdk')
const utils = require("../comm/utils.js");
cloud.init({
  env: require("../env.js")
})
const query = require('../comm/query2.js');

const MAX_LIMIT = 10;
/**
 * 无效参数，字段为date类型，不能直接与new Date的对象进行比较，聚合阶段使用 $.and
var d = new Date('2019-10-01'), d2 = new Date('2019-11-01 12:00:00')
var a = $.dateFromString({
    dateString: d.toJSON()
}), a2 = $.dateFromString({
    dateString: d2.toJSON() //2020-02-12T08:44:11.421Z
})
db.collection('table2').aggregate()
.addFields({
    matched: $.and([$.gte(['$cTime', a]), $.lte(['$cTime', a2])]),//_and.push([aggr.lte(['$actbegintime_dt', now]), aggr.gt(['$actendtime_dt', now])])
})
.match({
    matched:!0
})
.project({
    _id:1,
    cTime:1
})
.end()
 */
module.exports = async (event, context) => {

  const wxContext = cloud.getWXContext();
  const db = cloud.database();

  const $ = db.command;
  const aggr = db.command.aggregate;

  var now = new Date();//.toJSON();//utils.dateFormat(new Date(),'yyyy-MM-dd hh:mm');
  now = aggr.dateFromString({
    dateString: now.toJSON()
  });

  var _addField=null;
  var _and = [];
  
  if(event.status !='9'){
    _and.push({
      status: $.neq("9") //字典:100039,0:"启动",1:"暂停",2:"结束",9:"删除"
    }); 
  }

  //if(!event.status || !event.status.trim()){
    _addField = _addField||{};
    _addField.waiting = aggr.gte(['$enrollbegintime_dt', now]);
    _addField.enrolling = aggr.and([aggr.lte(['$enrollbegintime_dt', now]), aggr.gte(['$enrollendtime_dt', now])]);
    _addField.waitingaction = aggr.and([aggr.lt(['$enrollendtime_dt', now]), aggr.gt(['$actbegintime_dt', now])]);
    _addField.actioning =  aggr.and([aggr.lte(['$actbegintime_dt', now]), aggr.gt(['$actendtime_dt', now])]);
    _addField.end = aggr.lte(['$actendtime_dt', now]);
  
  //}

  var _or = [];
  event.text && _or.push({
    actionname:{
    $regex: '.*' + event.text,
    $options: 'i'
    }
  });
  event.text && _or.push({
    intro:{
      $regex: '.*' + event.text,
      $options: 'i'
    }
  });

  if(_or.length>0 ){
    //_and.push($.or(_or));    
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
    page_size: event.page_size,
    orderby_field: "updatetime",
    orderby_type: "desc",//event.orderby_type,
    batch_time: event.batch_time
  }

  /** $.arrayElemAt 方法在addEnrollInfo.js 获取actioninfo中用到
   *    cover:$.let({
        vars:{
          picpath:{$arrayElemAt:["$picpath", 0]},
        },
        in:"$$picpath.fileID"
      }),
   */
  var projField = {
    actionid:1,
    actionname:1,
    /*
    statusdesc: aggr.switch({
      branches: [
          { case:'$waiting', then: '待报名' },
          { case: $.eq(['$enrolling', true]), then: '报名中' },
          { case: $.eq(['$waitingaction', true]), then: '待活动' },
          { case: $.eq(['$actioning', true]), then: '活动中' },
          { case: $.eq(['$end', true]), then: '结束'},
      ],
      default: '未知'
    }),*/
    intro: aggr.concat([aggr.switch({
      branches: [
          { case:'$waiting', then: '待报名' },
          { case: $.eq(['$enrolling', true]), then: '报名中' },
          { case: $.eq(['$waitingaction', true]), then: '待活动' },
          { case: $.eq(['$actioning', true]), then: '活动中' },
          { case: $.eq(['$end', true]), then: '结束'},
      ],
      default: '未知'
    }), ':', '$intro']),    
    picpath:aggr.let({
      vars:{
        picpath:{$arrayElemAt:["$picpath", 0]},
      },
      in:"$$picpath.fileID"
    }), 
    updatetime:aggr.dateToString({
      date: '$updatetime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    })
  };
  return await query('xlh_enrollaction',_and, ctrlParams, projField, null, _addField);
}