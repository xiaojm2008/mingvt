//获取报名人员清单信息
//管理台功能
const utils = require("../comm/utils.js");
const cloud = require('wx-server-sdk')
const query2 = require('../comm/query2.js');
cloud.init({
  env: require("../env.js")
})
//const query = require('../comm/query.js');

const MAX_LIMIT = 10;

module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  if(!event.actionid || !event.actionid.trim()){
    /*return {
      errMsg:"参数错误"
    }*/
  }
  const db = cloud.database();
  const $ = db.command;
  const aggr = db.command.aggregate;

  var _and = [],_or=[],_addField=null;

  event.actionid && (_and.push({actionid:event.actionid}));
  event.phone && (_and.push({phone:event.phone}));

  if(!event.enrollstatus || event.enrollstatus[0] != '9'){
    //不查询已经删除了的
    _and.push({enrollstatus:"1"});
  } else {
    //只查询删除了的
    _and.push({enrollstatus:"9"});
  }
  /**
   * 修改为regtime（date 类型)怎样处理？
   */
  if(event.regdate){
    /*var regdate1 = utils.strToDate(event.regdate+" 00:00:00",-8),
    regdate2 = utils.strToDate(event.regdate+" 23:59:59",-8);*/
    var regdate1 = utils.strToDate(event.regdate+" 00:00:00",-8),
    regdate2 = utils.strToDate(event.regdate+" 23:59:59",-8);
    /*return {
      now:new Date(),
      regdate1:regdate1.toJSON(),
      regdate2:regdate2.toJSON()
    }*/
    regdate1 = aggr.dateFromString({
      dateString: regdate1.toJSON(),      
      //timezone: 'Asia/Shanghai'timezone: '-08:00'
    });
    regdate2 = aggr.dateFromString({
      dateString: regdate2.toJSON(),     
      //timezone: 'Asia/Shanghai' timezone: '-08:00'
    });
    //1 报名中
    _addField={};
    _addField.matched = aggr.and([aggr.gte(['$settime', regdate1]), aggr.lte(['$settime', regdate2])]);
    
  } 
  
  if(_addField){
    _and.push({
      matched:true
    })
  }
  event.gender && event.gender.length>0 &&( _and.push({gender:event.gender[0]})); //["0"],
  event.apprstatus && event.apprstatus.length>0 &&( _and.push({apprstatus:event.apprstatus[0]})); //["2"],
  event.paystatus && event.paystatus.length>0 && (_and.push({paystatus:$.in(event.paystatus)})); //["1","2"]
  event.siginstatus && event.siginstatus.length>0 &&(_and.push({siginstatus:$.in(event.siginstatus)})); //["1","2"]

  if(event.text){
    _or.push({
      username:{
      $regex: '.*' + event.text,
      $options: 'i'
      }
    });
    _or.push({
      x_username:{
        $regex: '.*' + event.text,
        $options: 'i'
      }
    });
    _or.push({
      nickname:{
        $regex: '.*' + event.text,
        $options: 'i'
      }
    });
  }

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
    page_size: event.page_size,
    orderby_field: ["settime"],
    orderby_type: ["desc"],
    batch_time: event.batch_time
  }


  var selectField = {
    matched:1,
    actionname:1,
    actionstatus:1,
    actionid:1,
    cover:1,
    imginfo:1,
    x_username:1,
    nickname:1,
    username:1,
    phone:1,
    gender:1,
    avatarurl:1,
    /*
    launch_avatarurl:1,
    launch_name:1, //发起人，赞助人
    launch_id:1,
    launch_phone:1,*/
    feetype:1,
    apprflag:1,
    siginflag:1,
    apprstatus:1,
    siginstatus:1,
    paystatus:1,
    refundstatus:1,  
    enrollstatus:1,  
    total_pay:1,
    //status:1,
    enrollbegintime:aggr.dateToString({
      date: '$enrollbegintime',
      format: '%Y-%m-%d %H:%M',
      timezone: 'Asia/Shanghai' /**活动报名开始时间 */
    }), 
    enrollendtime:aggr.dateToString({
      date: '$enrollendtime',
      format: '%Y-%m-%d %H:%M',
      timezone: 'Asia/Shanghai'
    }),
    actbegintime:aggr.dateToString({
      date: '$actbegintime',
      format: '%Y-%m-%d %H:%M',/**活动开始时间 */
      timezone: 'Asia/Shanghai'
    }), 
    actendtime:aggr.dateToString({
      date: '$actendtime',
      format: '%Y-%m-%d %H:%M',
      timezone: 'Asia/Shanghai'
    }),
    settime:aggr.dateToString({
      date: '$settime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    }),
    updatetime:aggr.dateToString({
      date: '$updatetime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    }),
    apprtime:aggr.dateToString({
      date: '$apprtime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    }),
    sigintime:aggr.dateToString({
      date: '$sigintime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    }),
    paytime:aggr.dateToString({
      date: '$paytime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    }),
    repaytime:aggr.dateToString({
      date: '$repaytime',
      format: '%Y-%m-%d %H:%M:%S',
      timezone: 'Asia/Shanghai'
    }),
    errmsg:1,
    remark:1
  };
  return await query2('xlh_enrollinfo', _and, ctrlParams, selectField,null,_addField);
}