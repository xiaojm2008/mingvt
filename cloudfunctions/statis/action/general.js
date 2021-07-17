const utils = require("../comm/utils.js");
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
const transfer = require("../comm/transfer.js");
const func = require("../cfg/actionfunc.js");
cloud.init({
  env: require("../env.js")
})
/*
{
  "actionid": "ACT1581180536044697e4cdd430b719b",
  "funcid": "general",
  "params": {
    "begindate": {
      "value": "2020-03-13",
      "name": "开始日期"
    },
    "enddate": {
      "value": "2020-03-14",
      "name": "结束日期"
    },
    "groupby": [{
      "value": "gender",
      "name": "性别(单选)",
      "checktype":"0",
      "options": [{
        "code": "0",
        "desc": "性别",
        "name": "男"
      }, {
        "code": "1",
        "name": "女"
      }]
    }, {
      "value": "960ed3cb09df0df7",
       "name": "多选",
       "checktype":"1",
      "options": [{
        "code": 0,
        "name": "选一"
      }, {
        "code": 1,
        "name": "选二"
      }, {
        "code": 2,
        "name": "选三"
      }, {
        "code": 3,
        "name": "选择四"
      }, {
        "code": 4,
        "name": "选择五"
      }]
    }]
  },
  "transtype": "action",
  "actionname": "general"
}
*/
module.exports = async (event, wxContext) => {

  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  var {
    params
  } = event;


  const db = cloud.database();
  const $ = db.command;
  const aggr = db.command.aggregate;

  var _and = [],
    _or = [],
    _addField = null;

  if (!event.actionid || !event.actionid.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
 /* _and.push({
    actionid: event.actionid
  });*/

  if (params.begindate&&params.begindate.value) {
    var begindate = utils.strToDate(params.begindate.value + " 00:00:00", -8);
    begindate = aggr.dateFromString({
      dateString: begindate.toJSON()
    });
    _addField = {
     };
    _addField.matched = aggr.gte(['$settime', begindate]);
    if (params.enddate&&params.enddate.value) {
      var enddate = utils.strToDate(params.enddate.value + " 23:59:59", -8);
      enddate = aggr.dateFromString({
        dateString: enddate.toJSON()
      });
      //_and.push({settime:aggr.lte(enddate)});
      _addField.matched = aggr.and([aggr.gte(['$settime', begindate]), aggr.lte(['$settime', enddate])]);
    }
    //_and.push({settime:$.lte(begindate)});
  } else if (params.enddate&&params.enddate.value) {
    var enddate = utils.strToDate(params.enddate.value + " 23:59:59", -8);
    enddate = aggr.dateFromString({
      dateString: enddate.toJSON()
    });
    _addField = {};
    //_and.push({settime:aggr.lte(enddate)});
    _addField.matched = aggr.lte(['$settime', enddate]);
  }

  if (!params.enrollstatus || !params.enrollstatus.value || params.enrollstatus.value[0] != '9') {
    //不查询已经删除了的
    _and.push({
      enrollstatus: '1'
    });
  } else {
    //只查询删除了的
    _and.push({
      enrollstatus: "9"
    });
  }
  /*
  if (_addField) {
    _and.push({
      matched: true
    })
  }*/
  params.gender&&params.gender.value && params.gender.value.length > 0 && (_and.push({
    gender: params.gender.value[0]
  })); //["0"],
  params.apprstatus&&params.apprstatus.value && params.apprstatus.value.length > 0 && (_and.push({
    apprstatus: params.apprstatus.value[0]
  })); //["2"],
  params.paystatus&&params.paystatus.value && params.paystatus.value.length > 0 && (_and.push({
    paystatus: $.in(params.paystatus.value)
  })); //["1","2"]
  params.siginstatus&&params.siginstatus.value && params.siginstatus.value.length > 0 && (_and.push({
    siginstatus: $.in(params.siginstatus.value)
  })); //["1","2"]

  if (params.text&&params.text.value) {
    _or.push({
      username: {
        $regex: '.*' + params.text.value,
        $options: 'i'
      }
    });
    _or.push({
      x_username: {
        $regex: '.*' + params.text.value,
        $options: 'i'
      }
    });
    _or.push({
      nickname: {
        $regex: '.*' + params.text.value,
        $options: 'i'
      }
    });
  }

  if (_or.length > 0) {
    if (_and.length > 0) {
      _and.push($.or(_or));
      _and = $.and(_and);
    } else {
      _and = $.or(_or);
    }
  } else {
    _and = _and.length > 0 ? $.and(_and) : {};
  }
  if(params.groupby.length===0){
    return {
      errMsg:"指定统计字段"
    }
  } else if(params.groupby.length>2){
    return {
      errMsg:"指定统计字段不能大于2个"
    }
  }
  var groupby = params.groupby.reduce((p, c, a) => {
    p[c.value] = `$${c.value}`;
    return p;
  }, {});

  var statis = null;
  if (_addField) {
    statis = await db.collection('xlh_enrollinfo').aggregate()
      .match(
        _and
        //$.and([{ enrollstatus: '1' }, { gender: '0' }])
      )
      .addFields(_addField)
      .match({
        matched:true
      })
      .group({
        _id: groupby,
        count: aggr.sum(1),
      })
      .end();
  } else {
    statis = await db.collection('xlh_enrollinfo').aggregate()
      .match(
        _and
      )
      .group({
        _id: groupby,
        count: aggr.sum(1),
      })
      .end();
  }
  /**
   * "groupby":[{"value":"gender","options":[{"code":"0","desc":"性别","name":"男"},{"code":"1","name":"女"}]
   */
  var out = statis.list.map(v=>{
    return {
      _id:transfer.toArray(v._id,params.groupby),
      count:v.count
    }
  })
  var data = transfer.transfer(out,func.transfer[event.funcid]);
  option = JSON.parse(JSON.stringify(func.options[event.funcid]));
  var extdata = params;
  option = transfer.merge(data,option,extdata);
  return {
    success:1,
    option:option,
    data:out
  };
}