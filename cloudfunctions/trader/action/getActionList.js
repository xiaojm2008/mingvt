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
  /*
  _and.push({
    create_userid:wxContext.OPENID
  })*/
  if(event.status !='9'){
    _and.push({
      status: $.neq("9") //字典:100039,0:"启动",1:"暂停",2:"结束",9:"删除"
    }); 
  }


  //0待报名，1 报名中，2待活动，3 活动中,4结束
  if(event.status=='0'){
    _addField={};
    _addField.matched = aggr.gte(['$enrollbegintime_dt', now]);
  } else if(event.status=='1'){
    //1 报名中
    _addField={};
    _addField.matched = aggr.and([aggr.lte(['$enrollbegintime_dt', now]), aggr.gte(['$enrollendtime_dt', now])]);
  } else if(event.status=='2'){
    //2待活动(报名结束，活动未开始)
    _addField={};
    _addField.matched = aggr.and([aggr.lt(['$enrollendtime_dt', now]), aggr.gt(['$actbegintime_dt', now])]);
  } else if(event.status=='3'){
    //3 活动中,
    /*
    _and.push({
      actbegintime_dt: $.lte(now)
    })
    _and.push({
      actendtime_dt: $.gt(now)
    })*/
    _addField={};
    _addField.matched = aggr.and([aggr.lte(['$actbegintime_dt', now]), aggr.gt(['$actendtime_dt', now])]);
   
    //_and.push({matched: aggr.and([aggr.lte(['$actbegintime_dt', now]), aggr.gt(['$actendtime_dt', now])])});
  } else if(event.status=='4'){
    /*_and.push({
      actendtime_dt: $.lte(now)
    })*/
    _addField={};
    //_addField.matched = aggr.and([aggr.lte(['$actendtime_dt', now])]);
    _addField.matched = aggr.lte(['$actendtime_dt', now]);
  }else if(event.status=='9'){
    _and.push({
      status: $.eq('9')
    })
  }

  if(_addField){
    _and.push({
      matched:true
    })
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
    orderby_field: "settime",
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
    //status:1,
    //matched:1,
    actionstatus:'$status', //as 
    actaddress:1,
    actionid:1,
    actionname:1,
    actiontype:1,
    actlatitude:1,
    actlongitude:1,
    status: aggr.switch({
      branches: [
          { case:'$waiting', then: '0' },
          { case: $.eq(['$enrolling', true]), then: 1 },
          { case: $.eq(['$waitingaction', true]), then: 2 },
          { case: $.eq(['$actioning', true]), then: 3 },
          { case: $.eq(['$end', true]), then: 4},
      ],
      default: '8'
    }),
    statusdesc: aggr.switch({
      branches: [
          { case:'$waiting', then: '待报名' },
          { case: $.eq(['$enrolling', true]), then: '报名中' },
          { case: $.eq(['$waitingaction', true]), then: '待活动' },
          { case: $.eq(['$actioning', true]), then: '活动中' },
          { case: $.eq(['$end', true]), then: '结束'},
      ],
      default: '未知'
    }),
    actbegintime: aggr.concat([aggr.arrayElemAt(['$actbegintime', 0]), ' ', aggr.arrayElemAt(['$actbegintime', 1])]),
    /*actbegintime: aggr.reduce({
      input: '$actbegintime',
      initialValue: '',
      in: aggr.concat(['$$value', '', '$$this']),
    }),*/
    actendtime: aggr.concat([aggr.arrayElemAt(['$actendtime', 0]), ' ', aggr.arrayElemAt(['$actendtime', 1])]),
    enrollbegintime: aggr.concat([aggr.arrayElemAt(['$enrollbegintime', 0]), ' ', aggr.arrayElemAt(['$enrollbegintime', 1])]),
    enrollendtime: aggr.concat([aggr.arrayElemAt(['$enrollendtime', 0]), ' ', aggr.arrayElemAt(['$enrollendtime', 1])]),
    create_phone:1,
    create_userid:1,
    create_username:1,  
    intro:1,
    //description:1,
    //imginfo:1,
    picpath:1,
    num:1,
    dispass_num:1,
    fee:1,
    feechild:1,
    feetype:1,
    apprflag:1,
    siginflag:1,
    total_pay:1,
    maxperson:1,
    minperson:1,
    settime:aggr.dateToString({
      date: '$settime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    }),
    updatetime:aggr.dateToString({
      date: '$updatetime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    })
  };
  return await query('xlh_enrollaction',_and, ctrlParams, projField, null, _addField);
}