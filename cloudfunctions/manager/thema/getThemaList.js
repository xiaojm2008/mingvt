//获取报名人员清单信息
const utils = require("../comm/utils.js");
const cloud = require('wx-server-sdk')
const query = require('../comm/query2.js');

cloud.init({
  env: require("../env.js")
})

module.exports = async (event, wxContext) => {
  //const wxContext = cloud.getWXContext();

  const db = cloud.database();
  const $ = db.command;
  const aggr = db.command.aggregate;
  
  var _and = [],_or=[],_addField=null;

  _and.push({status:$.eq('1')}); //已经发布的

  event.feetype && event.feetype.length>0 &&( _and.push({feetype:event.feetype[0]})); //["0"],

  if(event.settime){
    var settime1 = utils.strToDate(event.regdate+" 00:00:00",-8),
    settime2 = utils.strToDate(event.regdate+" 23:59:59",-8);
   /* return {
      regdate1:regdate1.toJSON(),
      regdate2:regdate2.toJSON()
    }*/
    settime1 = aggr.dateFromString({
      dateString: settime1.toJSON()
    });
    settime2 = aggr.dateFromString({
      dateString: settime2.toJSON()
    });
    //1 报名中
    _addField={};
    _addField.matched = aggr.and([aggr.gte(['$settime', settime1]), aggr.lte(['$settime', settime2])]);
  }

  if(_addField){
    _and.push({
      matched:true
    })
  }

  if(event.authorname && event.authorname.trim()){
    _and.push({
      authorname:{
      $regex: '.*' + event.authorname,
      $options: 'i'
      }
    })
  }
  if(event.text && event.text.trim()){
    _or.push({
      name:{
      $regex: '.*' + event.text,
      $options: 'i'
      }
    });
    _or.push({
      summary:{
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
    orderby_field: ["updatetime"],
    orderby_type: ["desc"],
    batch_time: event.batch_time
  }

  var selectField = {
    authorid:1,
    authorname:1,
    authorimg:1,
    picpath:aggr.let({
      vars:{
        picpath:{$arrayElemAt:["$picpath", 0]},
      },
      in:"$$picpath.fileID"
    }),
    feetype:1,/**是否收费 */
    price:1,
    name:1,
    content:1,
    summary:1,
    status:1,
    settime:aggr.dateToString({
      date: '$settime',
      format: '%Y-%m-%d %H:%M:%S'
    }),
    updatetime:aggr.dateToString({
      date: '$updatetime',
      format: '%Y-%m-%d %H:%M:%S'
    })
  };
  return await query('xlh_thema', _and, ctrlParams, selectField,null, _addField);
}