const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const utils = require('../comm/utils.js');
const mySeq = require('../comm/mySeq.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const CASHOUT_NONE = "0";//申请提取
const CASHOUT_APPR_SUCC = "1";//申请提取审批成功
const CASHOUT_APPR_FAIL = "2";//申请提取审批失败
const CASHOUT_OK = "3";//已经提取成功
/*
{
  "transtype":"goods",
  "actionname":"getGoodsDetail",
  "goodsno":"S0000201907201424131230b668d6955a9"
}
*/
var _insertCashOutLog = async (cashOutLog) => {
  return await db.collection('xlh_cashoutlog').add({
    data:cashOutLog
  })
}
var _insertCashOutApp = async (cashOutLog) => {
  cashOutLog.status=CASHOUT_NONE;
  const _id = mySeq.S4()+"_"+cashOutLog.shopname+"_"+cashOutLog.drawmonth;
  return  await db.collection('xlh_cashoutapp').doc(_id).set({
    data:cashOutLog
  });
}
var _getCashOutApp = async (event, wxContext, shopinfo) => {
  const cmd = db.command;
  return await db.collection('xlh_cashoutapp').where({
    shopid: shopinfo.shopid,
    status:cmd.neq(CASHOUT_APPR_FAIL),
    drawmonth:event.drawmonth
  }).field({
    drawamt:1,
    status:1
  }).get();
}
var _getPaymentDetail = async (event, wxContext, shopinfo) => {
  const $ = db.command.aggregate;
  //cmd.and([cmd.gte(event.appmonth + "01"), cmd.lte(event.appmonth + "31")])
  var res = await db.collection("xlh_paymentdetail").aggregate().project({
    shopid: 1,    
    paymonth: $.substr(['$paydate', 0, 6]),
    goods_num:1,
    payamt:1
  }).match({
    shopid:shopinfo.shopid,
    paymonth: event.drawmonth
  }).group({
    _id:"$paymonth",
    payamt:$.sum("$payamt"),
    goods_num:$.sum("$goods_num"),
    count:$.sum(1) //订单笔数
  }).end();
  if(res.list.length ===0){
    return null;
  }
  return res.list[0];
}
var _getStatisIncomeMonth = async (event, wxContext, shopinfo) => {
  return await db.collection("statis_incomemonth").doc(shopinfo.shopid+"_"+event.drawmonth).get();
}
module.exports = async (event, wxContext) => {
  var {
    amt,
    drawmonth
  } = event;
  const userid = wxContext.OPENID;

  if (!amt || amt <= 0) {
    return {
      errMsg: '申请金额不能空或者小于等于0'
    }
  }
  /*
  if (!drawmonth || !drawmonth.trim()) {
    return {
      errMsg: '申请提现月份不能空'
    }
  }
  var now = new Date();
  const cur = now.getFullYear() + "" + (now.getMonth() + 1);
  drawmonth = drawmonth.replace("-");
  if (parseInt(drawmonth) >= parseInt(cur)) {
    return {
      errMsg: '只能提取上一个月的'
    }
  }
*/
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
  var cashOutLog = {
    shopid: userInfo.shopinfo.shopid,
    shopname:userInfo.shopinfo.shopname,
    amt:event.amt,
    drawyear:event.drawmonth?event.drawmonth.substr(0,4):null,
    drawmonth:event.drawmonth||"",
    openid:wxContext.OPENID,
    settime:db.serverDate()
  },res=null;
  var cashOut = await _getCashOutApp(event,wxContext,userInfo.shopinfo);
  if(cashOut.data && cashOut.data.length>0){
    if(cashOut.data[0].status!==CASHOUT_APP_FAIL){
      cashOutLog.errcode = "9999";
      cashOutLog.errmsg = '提取申请失败，请确认您是否已经提交提现申请，或已经提取成功';
      res = await _insertCashOutLog(cashOutLog);
      return {
        errMsg: cashOutLog.errmsg
      }
    }
  }

  var incomeMonth = await _getStatisIncomeMonth(event,wxContext,userInfo.shopinfo);
  if(!incomeMonth.data){
    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '提取申请失败，申请月的支付明细不存在，请确认您有剩余提取金额';
    res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }
  if(parseInt((event.amt * 100).toFixed()) > parseInt((incomeMonth.income_amt * 100).toFixed())){
    return {
      errMsg: "提取金额大于可提现金额"
    }
  }
  if(event.amt.toFixed(2) != incomeMonth.income_amt.toFixed(2)){
    return {
      errMsg: "必须全部提取："+incomeMonth.income_amt
    }
  }
  if(event.amt.toFixed(2) != incomeMonth.income_amt.toFixed(2)){
    return {
      errMsg: "必须全部提取："+incomeMonth.income_amt
    }
  }
  cashOutLog.income_id = incomeMonth._id;
  cashOutLog.amt=incomeMonth.income_amt;
  cashOutLog.order_num=incomeMonth.order_num;
  cashOutLog.goods_num=incomeMonth.goods_num;
  cashOutLog.errcode = "0000";
  cashOutLog.errmsg = "申请成功,我们会尽快帮您审批";
  var res = await _insertCashOutLog(cashOutLog);
  res = await _insertCashOutApp(cashOutLog);
  if(res._id){
    return {
      success:1,
      errMsg:cashOutLog.errmsg,
      _id:res._id
    }
  }
  return res;
}