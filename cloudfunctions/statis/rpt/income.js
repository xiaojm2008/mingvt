const utils = require("../comm/utils.js");
const constants = require("../comm/constants.js");
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
// 云函数入口函数
/*
{"transtype":"rpt","actionname":"income"}
 
c 取消
0 待付款
1 待发货
2 待收货
3 待评价
4 退款审核中
5 退款中
6 已完成
7 已关闭
8 已删除

未付款:['0']
待收发货:['1','2'],
已成交:['3','6','7','8']
退款:['4','5']
取消:['c']
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
  /*
  statistype:'1','按日' '2','按周' '3','按月','4':'季','5':'年'
  */
  var begindate = null,
    enddate = null,
    statistype = '3';
  if (event.statistype && !event.statistype.trim()) {
    statistype = event.statistype;
  }
  if (statistype === '1') {
    //'1','按日'
    if (!event.begindate || !event.begindate.trim()) {
      begindate = utils.dateFormat(new Date(), "yyyy-MM-dd");
    } else {
      begindate = event.begindate;
    }
    if (!event.enddate || !event.enddate.trim()) {
      enddate = utils.calcDate(begindate, -1);
    } else {
      enddate = event.enddate
    }
  } else {
    if (!event.begindate || !event.begindate.trim()) {
      begindate = utils.dateFormat(new Date(), "yyyy-MM-dd");
    } else {
      begindate = event.begindate;
    }
  }
  //const _ = db.command.aggregate;
  const $ = db.command.aggregate;
  //const db.command.aggregate;
  //dealtime dealtime成交时间等于
  var statisdate = utils.goPreDate(begindate, enddate, statistype);
  //setdate: _.and([_.gte("2019-12-01"), _.lte("2019-12-31")])
  var statis = await db.collection('xlh_orderdetail').aggregate()
    .project({
      setdate: $.dateToString({
        date: '$settime',
        format: '%Y-%m-%d'
      }),
      total_pay: 1,
      status: 1
      //status: $.or([$.eq(['$status', '1']), $.eq(['$status', '0'])])
    }).match(
      $.and([{
        setdate: {
          $gte: statisdate.begdate,
          $lte: statisdate.enddate
        }
      }])
    ).group({
      _id: '$status',
      total_pay: $.sum("$total_pay"),
      count: $.sum(1),
    })
    .end();
  statis.statisdate = statisdate;
  /*
  未付款:['0']
待收发货:['1','2'],
已成交:['3','6','7','8']
退款:['4','5']
取消:['c']
  */
  var out = [{
    name: "未付款",
    total_pay: 0,
    count:0,
    _ids: {
      '0': {}
    }
  }, {
    name: "待收发货",
    total_pay: 0,
    count:0,
    _ids: {
      '1': {},
      '2': {}
    },
  }, {
    name: "已成交",
    total_pay: 0,
    count:0,
    _ids: {
      '3': {},
      '6': {},
      '7': {},
      '8': {}
    },
  }, {
    name: "退款",
    total_pay: 0,
    count:0,
    _ids: {
      '4': {},
      '5': {}
    },
  }, {
    name: "取消",
    total_pay: 0,
    count:0,
    _ids: {
      'c': {}
    },
  }]
  statis.list.forEach(v => {
      for(var v1 in out){
        if(out[v1]._ids[v._id]){
          out[v1]._ids[v._id].total_pay = v.total_pay;
          out[v1]._ids[v._id].count = v.count;
          out[v1].total_pay+=v.total_pay;
          out[v1].count += v.count;
          break;
        }
      }
  })
  statis.list = out;
  return statis;
}