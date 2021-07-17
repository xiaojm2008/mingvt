const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const utils = require('../comm/utils.js');
const dealList = require("./dealList.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const STATIS_DAY = 15;//必须在当月15号后上月成交信息，考虑到退货问题
/**
 *
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
 */
module.exports = async (event, wxContext) => {
  var {
    statismonth
  } = event;
  const userid = wxContext.OPENID;

  if (!statismonth || !statismonth.trim()) {
    return {
      errMsg: '统计月份不能空'
    }
  }

  var now = new Date();
  const cur = now.getFullYear() + "" + (now.getMonth() + 1);
  //statismonth = statismonth.replace("-");
  if (parseInt(statismonth) >= parseInt(cur)) {
    return {
      errMsg: '当前您只能处理上个月或上月之前的订单成交信息'
    }
  }
  //获取当前now上个月日期段譬如：2020-01-01，上个月就是begdate:20191201,enddate:20191230
  var preMonth = utils.goPreDate(utils.dateFormat(now,'yyyyMMdd'),null,'3');
  if(preMonth.begdate.substr(0,6)===statismonth 
    && now.getDay()<STATIS_DAY){
      return {
        errMsg: '您只能在15号后处理上月的订单成交数据'
      }
  }

  var userInfo = await getUserInfo(userid);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, userid, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  const _id = userInfo.shopinfo.shopid + "_"+statismonth;

  var res = await db.collection("statis_incomemonth").doc(_id).field({
    amt:1
  }).get();

  if(res.data && res.data.length>0){
    return {
      success:1,
      remains:res.data[0].amt
    }
  }

  const $ = db.command.aggregate;

  res = await dealList.genDealByMonth(userInfo.shopinfo.shopinfo,statismonth);

  if(!res.list || res.list.length===0){
    return res;
  }
  /**月成交额 */
  var monthdeal ={
    openid:wxContext.OPENID,
    statismonth:statismonth,    
    shopid:userInfo.shopinfo.shopinfo,
    shopname:userInfo.shopinfo.shopname,
    order_num:0,
    goods_num:0,
    amt:0,
    settime:db.serverDate()
  }
  var deal = res.list[0];    
  monthdeal.order_num = deal.count;
  monthdeal.goods_num = deal.goods_num;
  monthdeal.amt = deal.total_pay;

 

  res = await db.collection("statis_incomemonth").doc(_id).set({data:monthdeal});
  if(res._id){
    return {
      success:1,
      remains:monthdeal.amt,
      errMsg:"处理成功"
    }
  }
  return res;
}