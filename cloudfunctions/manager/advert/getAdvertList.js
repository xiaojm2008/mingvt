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

module.exports = async (event, wxContext) => {
  //const wxContext = cloud.getWXContext();

  const db = cloud.database();
  const $ = db.command;
  const aggr = db.command.aggregate;

  var _and = [],_or=[],_addField=null;

  event.openid && (_and.push({openid:wxContext.openid}));

  if(!event.status || event.status[0] != '9'){
    //不查询已经删除了的
    _and.push({status:"1"});
  } else {
    //只查询删除了的
    _and.push({status:"9"});
  }
  /**
   * 修改为regtime（date 类型)怎样处理？
   */
  if(event.querydate){
    var querydate1 = utils.strToDate(event.querydate+" 00:00:00",-8),
    querydate2 = utils.strToDate(event.querydate+" 23:59:59",-8);
   /* return {
      regdate1:regdate1.toJSON(),
      regdate2:regdate2.toJSON()
    }*/
    querydate1 = aggr.dateFromString({
      dateString: querydate1.toJSON()
    });
    querydate2 = aggr.dateFromString({
      dateString: querydate2.toJSON()
    });
    //1 报名中
    _addField={};
    _addField.matched = aggr.and([aggr.gte(['$settime', querydate1]), aggr.lte(['$settime', querydate2])]);
  } 
  
  if(_addField){
    _and.push({
      matched:true
    })
  }
  /*
  event.gender && event.gender.length>0 &&( _and.push({gender:event.gender[0]})); //["0"],
  event.apprflag && event.apprflag.length>0 &&( _and.push({apprflag:event.apprflag[0]})); //["2"],
  event.paystatus && event.paystatus.length>0 && (_and.push({paystatus:$.in(event.paystatus)})); //["1","2"]
  event.siginstatus && event.siginstatus.length>0 &&(_and.push({siginstatus:$.in(event.siginstatus)})); //["1","2"]
  */

  if(event.text){
    _or.push({
      summary:{
      $regex: '.*' + event.text,
      $options: 'i'
      }
    });
    _or.push({
      advertname:{
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
    advertname:1,
    list:1,
    status:1,
    settime:aggr.dateToString({
      date: '$settime',
      format: '%Y-%m-%d %H:%M:%S'
    }),
    updatetime:aggr.dateToString({
      date: '$updatetime',
      format: '%Y-%m-%d %H:%M:%S'
    }),
    apprtime:aggr.dateToString({
      date: '$apprtime',
      format: '%Y-%m-%d %H:%M:%S'
    })
  };
  return await query2('xlh_advert', _and, ctrlParams, selectField,null,_addField);
}