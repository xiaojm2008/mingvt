//approve
//const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const utils = require("../comm/utils.js");
const myNum = require("../comm/myNum.js");
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

const FORCE_AMT = 10000;

var _insertCashOutLog = async (cashOutLog) => {
  if(cashOutLog.errcode!="0000"){
    var apprinfo = {
      prestatus: cashOutLog.prestatus,
      status: CASHOUT_APPR_FAIL,
      appr_openid: cashOutLog.openid,
      appr_time: new Date(),
      appr_errcode:  cashOutLog.errcode,
      appr_errmsg: cashOutLog.errmsg,
      updatetime: new Date()
    }
    //提现失败处理
    var res = await db.collection('bal_cashoutapp').doc(cashOutLog.cashoutid).update({
      data: apprinfo
    })
  }
  return await db.collection('bal_cashoutlog').add({
    data: cashOutLog
  })
}

module.exports = async (event, wxContext) => {
  const {
    _id,
    status,
    force,
  } = event;

  const userid = wxContext.OPENID;
  if (!_id || !_id.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var userInfo = await getUserInfo(userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  if (userInfo.sysadmin != '1') {
    return {
      errMsg: "权限拒绝"
    }
  }
  var apprinfo = {
    prestatus: '',
    status: event.status,
    appr_openid: wxContext.OPENID,
    appr_time: new Date(),
    appr_errcode: "0000",
    appr_errmsg: "审批成功",
    updatetime: new Date()
  }

  var cashOutLog = {
    openid: wxContext.OPENID,
    shopid:null,
    shopname:null,
    cashoutid:event._id,
    amt: event.amt||0,
    logtype:"1", //提现审核日志
    prestatus:null,
    operstatus:event.status,
    updatetime: new Date(),
    settime: new Date()
  };
  //if(userInfo.shopinfo.shopid+)
  const transaction = await db.startTransaction();

  var cashoutapp = null;
  try {
    cashoutapp = await transaction.collection("bal_cashoutapp").doc(_id).
    /*field({
        shopid: 1,
        cashoutid: 1,
        amt: 1,
        drawmonth: 1,
        openid: 1,       
        errcode: 1,
        errmsg: 1,
        status: 1
      }).*/
    get();
  } catch (err) {
    
    await transaction.rollback();

    //已经申请了，并且没有审核失败，那么不能再次申请
    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = `申请流水不存在:${_id}`;
    cashOutLog.message = err;
    await _insertCashOutLog(cashOutLog);
    cashOutLog.message = null;
    return {
      errMsg:cashOutLog.errmsg
    }
  }

  cashoutapp = cashoutapp.data;

  if (cashoutapp.status === CASHOUT_OK) {
    await transaction.rollback();
    return {
      errMsg: "申请已经提取现金成功"
    }
  } else if (cashoutapp.status === CASHOUT_APPR_SUCC) {
    await transaction.rollback();
    return {
      errMsg: "申请已经审批成功"
    }
  } else if (cashoutapp.status === CASHOUT_APPR_FAIL) {
    await transaction.rollback();
    return {
      errMsg: "申请已经被审批失败"
    }
  }
  cashOutLog.shopid = cashoutapp.shopid;
  cashOutLog.shopname = cashoutapp.shopname;
  cashOutLog.prestatus = cashoutapp.status;
  cashOutLog.cashoutamt = cashoutapp.amt;

  apprinfo.prestatus = cashoutapp.status;

  if(event.status ===CASHOUT_APPR_FAIL){
    
    await transaction.rollback();
    
    cashOutLog.errcode = "8888";
    cashOutLog.errmsg = '提取申请失败，申请被拒绝';
    cashOutLog.cashoutapp = cashoutapp;
    await _insertCashOutLog(cashOutLog);

    return {
      errMsg:"拒绝提现成功"
    }
  }

  var balshop = await transaction.collection("bal_shop").doc(cashoutapp.shopid).get();

  balshop = balshop ? balshop.data : null;
  if (parseInt((balshop.available * 100).toFixed()) < parseInt((cashoutapp.amt * 100).toFixed())
  || parseInt((balshop.frozen * 100).toFixed()) < parseInt(((0-cashoutapp.amt) * 100).toFixed())) {

    await transaction.rollback();

    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '提取申请失败，可用金额不足,当前可用余额：' + balshop.available;
    cashOutLog.balshop = balshop;
    await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }

  const _ = db.command;

  var shopdetail = await db.collection("bal_shopdetail").where({
    shopid:cashoutapp.shopid,
    available:_.gt(0.0)
  }).field({
    order_num:1,
    goods_num:1,
    available:1,
    amt:1
  }).orderBy("regmonth","asc").get();

  shopdetail = shopdetail.data && shopdetail.data.length>0 ? shopdetail.data:null;

  if(!shopdetail){

    await transaction.rollback();

    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '收入明细检验失败';

    await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }
  var willChgDetail = [],remainsamt =  cashoutapp.amt;
  for(var i in shopdetail){
    if(myNum.eq(remainsamt,0)){
      break;
    }
    var detail = shopdetail[i],now = new Date(),
    chg={
      _id:detail._id,
      available:0,
      chgtype:"0", //提现变动      
      chgamt:0,
      chgdate:utils.dateFormat(now,"yyyyMMdd"),
      chgtime:utils.dateFormat(now,"hhmmss"),
      updatetime:now
    };
    if(myNum.lte(remainsamt,detail.available)){
      //申请小于等于可用
      chg.available = detail.available-remainsamt;
      chg.chgamt = remainsamt;

      remainsamt = 0;

      if(myNum.eq(chg.available,0)){
        chg.available = 0;
      }
      willChgDetail.push(chg);
      break;

    } else if(myNum.gt(remainsamt,detail.available)){
      
      chg.chgamt = chg.available;
      chg.available = 0;

      remainsamt = remainsamt-chg.chgamt;
      willChgDetail.push(chg);
    }
  }
  if(myNum.gt(remainsamt,0)){
    await transaction.rollback();

    cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '明细清算失败,申请提现金额大于可用明细汇总金额：'+remainsamt;
    cashOutLog.willchgdetail = willChgDetail;
    res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }
  var updDetailTasks = [],insertDetailChg=[];

  var chgSeq = await transaction.collection("seq_shopdetailchg").doc(balshop.shopid).get();
  if(!chgSeq.data){
    await transaction.rollback();
    //cashOutLog.errcode = "9999";
    cashOutLog.errmsg = '获取明细变动序列号信息失败';
    //cashOutLog.message = chgSeq;
    //res = await _insertCashOutLog(cashOutLog);
    return {
      errMsg: cashOutLog.errmsg
    }
  }

  for(var i in willChgDetail){

    var v = willChgDetail[i];
    const detailid = v._id;
    delete v._id;
    await transaction.collection('bal_shopdetail').doc(detailid).update({
      data:v
    })
    /*
    updDetailTasks.push(transaction.collection('bal_shopdetail').doc(detailid).update({
      data:v
    }));
    */
    chgSeq.data.seq++;
    const chg_id = detailid+"_"+mySeq.prefixZero(chgSeq.data.seq,6);
    await transaction.collection('bal_shopdetailchg').doc(chg_id).set({
      data:{
        shopid:balshop.shopid,
        detailid:detailid,
        amt:0-v.chgamt,
        chgtype:"0", //提现变动      
        chgdate:v.chgdate,
        chgtime:v.chgtime,
        settime:v.updatetime
      }
    });
    /*
    insertDetailChg.push(transaction.collection('bal_shopdetailchg').doc(chg_id).set({
      data:{
        shopid:balshop.shopid,
        detailid:detailid,
        amt:0-v.chgamt,
        chgtype:"0", //提现变动      
        chgdate:v.chgdate,
        chgtime:v.chgtime,
        settime:v.updatetime
      }
    }));*/
  }
  /*
  return {
    errMsg:"************",
    willChgDetail:willChgDetail
  }*/
  if(updDetailTasks.length>0){
    try{
      var resChg = await Promise.all(updDetailTasks);
      resChg = await Promise.all(insertDetailChg);

    }catch(err){
      await transaction.rollback();

      cashOutLog.errcode = "9999";
      cashOutLog.errmsg = '批量更新明细清算失败:'+updDetailTasks.length;
      cashOutLog.willchgdetail = willChgDetail;
      await _insertCashOutLog(cashOutLog);
      return {
        errMsg: cashOutLog.errmsg
      }
    }
  }
  //frozen记录的是负数
  //balshop.frozen = balshop.frozen+cashoutapp.amt;
  //balshop.available = balshop.available-cashoutapp.amt;
  //balshop.updatetime = new Date();
  //balshop.oper_openid = wxContext.OPENID;
  
  var resBalShop = await transaction.collection('bal_shop').doc(balshop.shopid).update({
    data: {
      frozen:_.inc(cashoutapp.amt),
      available:_.inc(0-cashoutapp.amt),//成功必须可用减去，失败只用处理冻结
      oper_openid:wxContext.OPENID,
      updatetime: new Date()
    }
  })

   res = await transaction.collection('bal_cashoutapp').doc(cashoutapp._id).update({
    data: apprinfo
  })
  await transaction.collection("seq_shopdetailchg").doc(balshop.shopid).update({
    data:{
      seq:chgSeq.data.seq
  }});
  await transaction.commit();

  cashOutLog.errcode = "0000";
  cashOutLog.errmsg = '提现清算返回成功';
  cashOutLog.message = res;

  await _insertCashOutLog(cashOutLog);

  if (res.stats.updated > 0) {
    return {
      success: 1,
      errMsg: apprinfo.appr_errmsg
    }
  } else if (res.stats.updated === 0) {
    return {
      errMsg: "更新审批状态失败，请重试"
    }
  }
  return res;
}