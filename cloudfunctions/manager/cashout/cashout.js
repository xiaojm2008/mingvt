const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const utils = require('../comm/utils.js');
const mySeq = require('../comm/mySeq.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

const CASHOUT_NONE = "0"; //申请提取
const CASHOUT_APPR_SUCC = "1"; //申请提取审批成功
const CASHOUT_APPR_FAIL = "2"; //申请提取审批失败
const CASHOUT_OK = "3"; //已经提取成功
const CASHOUT_FAIL = "4"; //提取失败
/*
{
  "transtype":"goods",
  "actionname":"getGoodsDetail",
  "goodsno":"S0000201907201424131230b668d6955a9"
}
*/
var _insertCashOutLog = async (cashOutLog) => {
  return await db.collection('bal_cashoutlog').add({
    data: cashOutLog
  })
}

module.exports = async (event, wxContext) => {
  var {
    amt
  } = event;
  const userid = wxContext.OPENID;

  if (!amt || amt <= 0) {
    return {
      errMsg: '申请金额不能空或者小于等于0'
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

  var cashOutLog = {
      shopid: userInfo.shopinfo.shopid,
      shopname: userInfo.shopinfo.shopname,
      amt: event.amt,
      logtype:"0", //提现申请日志
      //drawyear:event.drawmonth?event.drawmonth.substr(0,4):null,
      //drawmonth:event.drawmonth||"",
      openid: wxContext.OPENID,
      username:userInfo.username,
      summary:event.summary||'',
      updatetime: new Date(),
      settime: new Date()
    },
    res = null;

  const transaction = await db.startTransaction();

  var now = new Date(),
    month = now.getMonth() + 1,
    drawmonth = now.getFullYear() + "" + (month > 9 ? month : ("0" + month));

  const cashoutid = userInfo.shopinfo.shopid + "_" + drawmonth;

  cashOutLog.cashoutid = cashoutid;
  cashOutLog.drawmonth = drawmonth;

  var existcashoutapp = null;
  try {
    existcashoutapp = await transaction.collection('bal_cashoutapp').doc(cashoutid).
    /*field({
          amt:1,
          status:1
        })*/
    get();
  } catch (err) {
    //已经申请了，并且没有审核失败，那么不能再次申请
    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = `当月还未申请提现，可申请一次:${cashoutid}`;
    cashOutLog.message = err;
    await _insertCashOutLog(cashOutLog);
    cashOutLog.message = null;
  }

  if (existcashoutapp && existcashoutapp.data && existcashoutapp.data != CASHOUT_APPR_FAIL) {

    await transaction.rollback();

    //已经申请了，并且没有审核失败，那么不能再次申请
    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '一月只能提现一次，您这个月已申请，不能再次申请';
    cashOutLog.balshop = balshop;
    res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }
  /**
   * .field({
      available:1,
      frozen:1,
      totalamt:1
    })
   */
  var balshop = await transaction.collection("bal_shop").doc(userInfo.shopinfo.shopid).get();

  balshop = balshop ? balshop.data : null;
  if (parseInt(((balshop.available+balshop.frozen) * 100).toFixed()) < parseInt((event.amt * 100).toFixed())) {

    await transaction.rollback();

    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '提取申请失败，可用金额不足,当前可用余额：' + (balshop.available+balshop.frozen);
    cashOutLog.balshop = balshop;
    res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }

  if ((balshop.available+balshop.frozen) >= 100 && event.amt < 100) {

    await transaction.rollback();

    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '提取申请失败，申请金额必须大于100';
    cashOutLog.balshop = balshop;
    res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }

  const _ = db.command;
  var updbal = await transaction.collection("bal_shop").doc(userInfo.shopinfo.shopid).update({
    data: {
      frozen: _.inc(0-cashOutLog.amt) //记录负数
      //available: _.inc(0-cashOutLog.amt) 不减去，只是冻结
    }
  });
  if (!updbal.stats || updbal.stats.updated === 0) {

    await transaction.rollback();

    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '提取申请失败，冻结申请金额失败';
    cashOutLog.message = updbal;
    res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }

  //await transaction.rollback();

  cashOutLog.errcode = "0000";
  cashOutLog.errmsg = "申请成功,我们会尽快帮您审批";

  var res = await _insertCashOutLog(cashOutLog);

  cashOutLog.status = CASHOUT_NONE;

  res = await transaction.collection('bal_cashoutapp').doc(cashoutid).set({
    data: cashOutLog
  });
  /*
  执行完set后并不能获取正确的stats结构信息。所以不能根据这样的方式判断是否成功set
  不过可以执行两次，一般就会返回正确的stats结构。参考settle.js
  或者COMMIT后就能获取正确的stats
  if(!res._id|| (res.stats.created===0 && res.stats.updated===0)){
    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '写提取申请信息失败';
    cashOutLog.message = res;
    //await transaction.commit();
    res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }
  */
  //await transaction.rollback();
  await transaction.commit();
  
  if (res._id) {
    return {
      success: 1,
      totalamt:balshop.totalamt,
      frozen:balshop.frozen-cashOutLog.amt,
      available:balshop.available/*+balshop.frozen-cashOutLog.amt*/,
      errMsg: cashOutLog.errmsg,
      _id: res._id
    }
  }
  return res;
}