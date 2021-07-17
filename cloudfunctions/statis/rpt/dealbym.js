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
{"transtype":"rpt","actionname":"dealbym","beginmonth":"2019-01","endmonth":"2019-12"}

c 取消
0 待付款
1 待发货
2 待收货
3 待评价
4 退款审核中
5 退款中
6 已完成
7 已关闭 :所谓已经关闭的定义：提现后就表示已经关闭了可否？还是移交到历史库就意味着已经关闭。
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

  var beginmonth = null,
    endmonth = null;
  if (!event.beginmonth || !event.beginmonth.trim()) {
    var now = new Date();
    beginmonth = now.getFullYear() + "" + "01";
  } else {
    beginmonth = event.beginmonth;
  }
  if (!event.endmonth || !event.endmonth.trim()) {
    var now = new Date();
    endmonth = now.getFullYear() + "" + (now.getMonth() + 1);
  } else {
    endmonth = event.endmonth;
  }
  if(endmonth.substr(0,4) != beginmonth.substr(0,4)){
    return {
      errMsg:"不能跨年统计"
    }
  }
  //const _ = db.command.aggregate;
  const $ = db.command;
  //dealtime dealtime成交时间等于 
  //setdate: _.and([_.gte("2019-12-01"), _.lte("2019-12-31")])
  var statis = await db.collection('statis_incomemonth').where(
    $.and([{
      statismonth: $.gte(beginmonth)
    }, {
      statismonth: $.lte(endmonth)
    }])
  ).field({
    statismonth:1,
    total_pay: 1,
    goods_num: 1,
    order_num: 1
  }).get();

  statis.statisdate = {
    beginmonth: beginmonth,
    endmonth:beginmonth
  };

  var month = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

  month = month.map(v => {
    return {
      name: v,
      total_pay: 200,
      remains_amt: 150,
      cash_out: -50,
      count: 0,
      _ids: {
        '3': {},
        '6': {},
        '7': {},
        '8': {}
      }
    }
  })
  statis.data.forEach(v => {
    var m = parseInt(v.statismonth.substr(-2)) - 1;
    month[m].total_pay = v.total_pay;
    month[m].goods_num = v.goods_num;
    month[m].count = v.order_num;
  });
  statis.list = month;
  return statis;
}