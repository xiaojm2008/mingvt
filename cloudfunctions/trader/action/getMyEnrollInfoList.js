//获取报名人员清单信息
const utils = require("../comm/utils.js");
const cloud = require('wx-server-sdk')
const query = require('../comm/query.js');
const query2 = require('../comm/query2.js');

cloud.init({
  env: require("../env.js")
})


const MAX_LIMIT = 10;
/**
 *    0:"进行中"
      1:"已结束"
      2:"待评论"
      3:"已完成"
 */
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const db = cloud.database();
  const $ = db.command;
  const aggr = db.command.aggregate;
  
  var _and = [],_or=[],_addField=null;

  _and.push({openid:wxContext.OPENID});
  _and.push({enrollstatus:$.neq('9')});

  event.actionid && (_and.push({actionid:event.actionid}));
  event.phone && (_and.push({phone:event.phone}));

  if(event.regdate){
    var regdate = event.regdate.replace(/-/g,"");
    _and.push({regdate:regdate});
  } 
  event.gender && event.gender.length>0 &&( _and.push({gender:event.gender[0]})); //["0"],
  event.apprstatus && event.apprstatus.length>0 &&( _and.push({apprstatus:event.apprstatus[0]})); //["2"],
  event.paystatus && event.paystatus.length>0 && (_and.push({paystatus:$.in(event.paystatus)})); //["1","2"]
  event.siginstatus && event.siginstatus.length>0 &&(_and.push({siginstatus:$.in(event.siginstatus)})); //["1","2"]

  /**
  0:"活动进行中"
  1:"活动已结束"
  2:"活动待评论"
  3:"活动已完成"
 */
  //actioninfo.actionstatus(status) = 100039 0:"启动",1:"暂停",2:"结束",9:"删除" 
  //enrollinfo.enrollstatus= 记录状态 100040 1:有效,9:删除 
  //ernollinfo.commentflag="0" 待评论 1：已经评论

  var now = new Date();//.toJSON();//utils.dateFormat(new Date(),'yyyy-MM-dd hh:mm');
  now = aggr.dateFromString({
    dateString: now.toJSON()
  });

  if(event.status==='0'){
    //0:"活动进行中"
    /*_and.push({
      actendtime: $.gte(now)
    });*/
    _addField={};
    //_addField.matched = aggr.gte(['$actendtime', now]);
    _addField.matched = aggr.and([aggr.gte(['$actendtime', now]), aggr.neq(['$actionstatus', "9"])]); 
  } else if (event.status ==='1'){
    //1:"活动已结束"
    /*_and.push({
      actendtime: $.lt(now)
    });*/
    _addField={};
    _addField.matched = aggr.lt(['$actendtime', now]);

  } else if(event.status==="2"){
    //2:"活动已结束等待您的评论"
    /*_or.push({
      actendtime: $.lt(now)
    });
    _or.push({
      commentflag:$.neq("1") //待评论
    })*/
    _addField={};
    _addField.matched = aggr.and([aggr.lt(['$actendtime', now]), aggr.neq(['$commentflag', "1"])]);
  } else if(event.status==='3'){
    //3:活动已完成,即活动已结束并且已经评论了
    /*_and.push({
      actendtime: $.lt(now)
    });
    _and.push({
      commentflag: $.eq("1")
    });*/
    _addField={};
    _addField.matched = aggr.and([aggr.lt(['$actendtime', now]), aggr.eq(['$commentflag', "1"])]);
  }

  if(_addField){
    _and.push({
      matched:true
    })
  }

  //actioninfo.actionstatus(status) = 100039 0:"启动",1:"暂停",2:"结束",9:"删除" 
  _addField = _addField||{};

  // _addField.actioning = aggr.gte(['$actendtime', now]); //0:"活动进行中"
  _addField.actioning = aggr.and([aggr.gte(['$actendtime', now]), aggr.neq(['$actionstatus', "9"])]); //0:"活动进行中"
  _addField.end = aggr.lt(['$actendtime', now]);//1:"活动已结束"
  _addField.waitcommment = aggr.and([aggr.lt(['$actendtime', now]), aggr.neq(['$commentflag', "1"])]);//2:"活动已结束等待您的评论"
  _addField.commented = aggr.and([aggr.lt(['$actendtime', now]), aggr.eq(['$commentflag', "1"])]);//3:活动已完成,即活动已结束并且已经评论了

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
    actionname:1,
    actionstatus:1,
    actiontype:1,
    actionid:1,
    pay_id:1,
    num:1,
    cover:1,
    imginfo:1,
    launch_avatarurl:1,
    launch_name:1, //发起人，赞助人
    launch_id:1,
    launch_phone:1,
    enrollstatus:1,//记录状态 100040 1:有效,9:删除 
    apprflag:1,
    feetype:1,
    siginflag:1,
    apprstatus:1,
    siginstatus:1,
    paystatus:1,
    refundstatus:1,    
    errmsg:1,
    remark:1,
    total_pay:1,
    statusdesc: aggr.switch({
      branches: [
          { case:'$actioning', then: '进行中' },
          { case: $.eq(['$end', true]), then: '已结束' },
          { case: $.eq(['$waitcommment', true]), then: '待评论' },
          { case: $.eq(['$commented', true]), then: '已完成' }
      ],
      default: '未知'
    }),
    enrollbegintime:aggr.dateToString({
      date: '$enrollbegintime',
      format: '%Y-%m-%d %H:%M',
      timezone: 'Asia/Shanghai'
    }), 
    enrollendtime:aggr.dateToString({
      date: '$enrollendtime',
      format: '%Y-%m-%d %H:%M',
      timezone: 'Asia/Shanghai'
    }),
    actbegintime:aggr.dateToString({
      date: '$actbegintime',
      format: '%Y-%m-%d %H:%M',
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
    })
  };
  return await query2('xlh_enrollinfo', _and, ctrlParams, selectField,null, _addField);
}