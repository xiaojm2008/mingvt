const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const utils = require('../comm/utils.js');
const settleHelper = require("./settleHelper.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

//const db = cloud.database();
const DEBUG = false;
const STATIS_DAY = 15;//必须在当月15号后上月成交信息，考虑到退货问题
/*
{
  throwOnNotFound: false
}
db.createCollection("bal_cashoutlog") //提现申请日志流水
db.createCollection("bal_cashoutapp") //提现申请
db.createCollection("bal_deal") //月成交资金汇总
*/
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
/**
 * 获取上次统计结束月份
 */
var _insertSettleLog = async(loginfo)=>{
  return await db.collection("sys_shopsettlelog").add({data:loginfo});
}
/**
 * bal_shop
 * bal_shopdetail
 * bal_shopsettlectrl
 * bal_shopsettlelog
 */
module.exports = async (event, wxContext) => {

  const userid = wxContext.OPENID;

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
  var now = utils.dateFormat(new Date(),"yyyyMMdd");
  endmonth =now.substr(0,6)

  var settlemonth = utils.goPreDate(now,null,'3');
  settlemonth = settlemonth.enddate.replace("-","").substr(0,6);
  /*
  var curYear = utils.getYear(now),curMonth = now.getMonth()+1,curDay = now.getDay();
  if(statisyear == curYear && curMonth==1 && curDay<STATIS_DAY){
    return {
      errMsg:"年中结算中，请在当月"+STATIS_DAY+"日后在处理"
    }
  }*/
  var balshop =null,
  loginfo={
    shopid:userInfo.shopinfo.shopid,
    DEBUG:DEBUG,
    shopname:userInfo.shopinfo.shopname,
    settlemonth:settlemonth,
    settime:new Date()
  };
  var settleCtrl = await settleHelper.getSettleCtrl(userInfo.shopinfo.shopid);

  if(settleCtrl && settleCtrl.settlemonth === settlemonth){
    //上月订单已经结束完成，不需要重复结算
    balshop = await settleHelper.getBalShop(userInfo.shopinfo.shopid);
    if(!balshop){
      loginfo.msg = "店铺结算信息不存在！，请联系系统管理人员！"
      await _insertSettleLog(loginfo);
      return {
        errMsg:loginfo.msg
      }
    }
    return {
      success:1,
      totalamt:balshop.totalamt,
      available:balshop.available,
      frozen:balshop.frozen,
      goods_num:balshop.goods_num,
      order_num:balshop.order_num,
      begmonth:settleCtrl.begmonth,
      endmonth:settleCtrl.endmonth,
      settlemonth:settlemonth,
      errMsg:"本次已经结算"
    }
  }

  loginfo.endmonth = endmonth;
  loginfo.begmonth = settleCtrl?settleCtrl.settlemonth:null;   

  //结算settleCtrl.settlemonth->endmonth之间的成交订单
  res = await settleHelper.settleOrderByRange(userInfo.shopinfo.shopid,(settleCtrl?settleCtrl.settlemonth:null),endmonth);
  
  if(!res.list || res.list.length===0){
    balshop = await settleHelper.getBalShop(userInfo.shopinfo.shopid);
    if(!balshop){
      //loginfo.endmonth = endmonth;
      //loginfo.begmonth = settleCtrl?settleCtrl.settlemonth:null;
      loginfo.msg = "店铺结算信息不存在！，请联系系统管理人员！"
      await _insertSettleLog(loginfo);
      return {
        errMsg:loginfo.msg
      }
    }
    return {
      success:1,
      totalamt:balshop.totalamt,
      available:balshop.available,
      frozen:balshop.frozen,
      goods_num:balshop.goods_num,
      order_num:balshop.order_num,
      begmonth:loginfo.begmonth,
      endmonth:loginfo.endmonth,
      settlemonth:settlemonth,
      errMsg:"本次结算没有新的更新"
    }
  }

  //为了可以启用事务先初始一条空的记录
  /*
  必须在创建店铺的时候创建一条sys_shopsettlectrl记录
  await db.collection("bal_shopdetail").doc(monthdeal.shopid+"_"+monthdeal.statismonth).set({data:{

  }});
  await transaction.collection('sys_shopsettlectrl').doc(balshop.shopid+"_"+settlemonth).set({
    data:{}
  })
  */
  /**按月统计成交额 */
  const transaction = await db.startTransaction();
  
  if(DEBUG){
    //transaction = db;
  } else {
    //transaction = await db.startTransaction();
  }

 
  /*
   const detail_id = userInfo.shopinfo.shopid+"_0000";
  var dealres2 = await transaction.collection("bal_shopdetail").doc(detail_id).set({data:{
    openid:wxContext.OPENID,
    statisyear:settlemonth.substr(0,4),
    statismonth:null,
    shopid:userInfo.shopinfo.shopid,
    shopname:userInfo.shopinfo.shopname,
    order_num:0,
    goods_num:0
  }});*/

  var firstsettle = false; //商铺首次结算
  try{

    balshop = await transaction.collection("bal_shop").doc(userInfo.shopinfo.shopid)./*field({
      shopid:1,
      totalamt:1,
      available:1,
      frozen:1,
      order_num:1,
      goods_num:1
    }).*/get();

  } catch(err){

    firstsettle = true;
    balshop = null;
  }

  if(!balshop || !balshop.data){
    balshop = {
      shopid:userInfo.shopinfo.shopid,
      shopname:userInfo.shopinfo.shopname,
      totalamt:0,
      available:0,
      frozen:0,
      order_num:0,
      goods_num:0,
      settlemonth:settlemonth,
      settime:!DEBUG?new Date():db.serverDate(),
      updatetime:!DEBUG?new Date():db.serverDate()
    };
  } else{   
    balshop = balshop.data;
   
    delete balshop._id;
    if(balshop.settlemonth === settlemonth){
      !DEBUG ? await transaction.rollback():null;
      //检查店铺的结算月是否与当前结算月相等，如果相等，那么这个情况可能是sys_shopsettlectrl里面的数据存在问题。
      //我们需要检查
      loginfo.balshop = balshop;
      //loginfo.endmonth = endmonth;
      //loginfo.begmonth = settleCtrl?settleCtrl.settlemonth:null;
      loginfo.msg = "结算异常，结算日期已经更新"
      await _insertSettleLog(loginfo);
      return {
        errMsg:loginfo.msg
      }
    }
    balshop.settlemonth=settlemonth;
    balshop.updatetime = !DEBUG?new Date():db.serverDate();
  }
  const _ = db.command;
  var totalamt = balshop.totalamt,
  goods_num = balshop.goods_num,
  order_num = balshop.order_num,
  available = balshop.available,
  frozen = balshop.frozen||0,
  amtChange = false,
  settleamt=0,
  settle_order_num=0,
  settle_goods_num=0,
  realbegmonth = res.list[0]._id,
  realendmonth = res.list[res.list.length-1]._id;

  for(var i in res.list){

    var v = res.list[i];
    var monthdeal ={
      openid:wxContext.OPENID,
      regyear:v._id.substr(0,4),
      regmonth:v._id, //statismonth
      shopid:userInfo.shopinfo.shopid,
      shopname:userInfo.shopinfo.shopname,
      order_num:v.count,
      goods_num:v.goods_num,
      amt:v.total_pay, //amt 为正表示收入,为负数表示支出（提现）
      available:v.total_pay, //可用金额
      frozen:0,
      settime:!DEBUG?new Date():db.serverDate()
    }
    if(!amtChange && monthdeal.amt>0){
      amtChange = true;
    }
    balshop.totalamt  = firstsettle?monthdeal.amt: _.inc(monthdeal.amt); //
    balshop.available  = firstsettle?monthdeal.amt:_.inc(monthdeal.amt); //
    balshop.goods_num = firstsettle?monthdeal.goods_num:_.inc(monthdeal.goods_num);
    balshop.order_num = firstsettle?monthdeal.order_num:_.inc(monthdeal.order_num);

    settleamt += monthdeal.amt; //
    settle_order_num += monthdeal.order_num;
    settle_goods_num += monthdeal.goods_num;

    totalamt  += monthdeal.amt; //
    available += monthdeal.amt; //
    goods_num += monthdeal.goods_num;
    order_num += monthdeal.order_num;

    monthdeal.settleamt = settleamt;
    monthdeal.settle_order_num = settle_order_num;
    monthdeal.settle_goods_num = settle_goods_num;

    const detail_id = monthdeal.shopid+"_"+monthdeal.regmonth;
    //不知道为啥要执行2次（其实执行一次应该就成功了，可能是因为没有commit,在返回的stats结构（updated,created）中不会体现。
    var dealres = await transaction.collection("bal_shopdetail").doc(detail_id).set({data:monthdeal});
    await transaction.collection("bal_shopdetailchg").doc(detail_id).set({data:{
      shopid:balshop.shopid,
      detailid:detail_id,
      amt:monthdeal.amt,
      regmonth:monthdeal.regmonth,//注册月份
      chgtype:"1", //订单统计变动
      chgdate:utils.dateFormat(new Date(),"yyyyMMdd"),
      chgtime:utils.dateFormat(new Date(),"hhmmss"),
      settime:v.updatetime
    }});
    /*
    if(!dealres._id || (dealres.stats.created===0 && dealres.stats.updated===0)){
      dealres = await transaction.collection("bal_shopdetail").doc(detail_id).set({data:monthdeal});
    }*/
    /*
    if(!dealres._id || (dealres.stats.created===0 && dealres.stats.updated===0)){
      !DEBUG ? await transaction.rollback():null;
     
      loginfo.shopdetail = monthdeal;
      loginfo.shopdetailres = dealres;
      //loginfo.endmonth = endmonth;
      //loginfo.begmonth = settleCtrl?settleCtrl.settlemonth:null;    
      loginfo.msg = "订单清算失败（数据回滚）！请重试"+"("+dealres.errMsg+")"

      await _insertSettleLog(loginfo);

      return {
        DEBUG:DEBUG,
        detail_id:detail_id,
        errMsg:loginfo.msg
      }
    }*/
  }
  var shopsettlectrl = {
    shopid:balshop.shopid,
    order:'1',
    begmonth:realbegmonth, //实际结算的开始月份
    endmonth:realendmonth, //实际结算的结束月份
    month_num:res.list.length,//合计结算了几个月的数据
    settleamt:settleamt,
    settle_order_num:settle_order_num,
    settle_goods_num:settle_goods_num,
    frozen:frozen,
    available:available,
    totalamt:totalamt,
    goods_num:goods_num,
    order_num:order_num,
    settlemonth:settlemonth,
    settime:!DEBUG?new Date():db.serverDate()
  };

  const settle_id = balshop.shopid+"_"+settlemonth;
  //重试二次
  var settleres = await transaction.collection('sys_shopsettlectrl').doc(settle_id).set({
    data:shopsettlectrl
  })
  /*
  if(!settleres._id|| (settleres.stats.created===0 && settleres.stats.updated===0)){
    settleres = await transaction.collection('sys_shopsettlectrl').doc(settle_id).set({
      data:shopsettlectrl
    })
  }
  if(!settleres._id|| (settleres.stats.created===0 && settleres.stats.updated===0)){
    !DEBUG ? await transaction.rollback():null;

    loginfo.shopsettlectrl = shopsettlectrl;
    loginfo.settlectrlres = settleres;
 
    loginfo.msg ="订单清算失败(settle)！请重试"+"("+settleres.errMsg+")"

    await _insertSettleLog(loginfo);

    return {
      errMsg:loginfo.msg
    }
  }
  */
  /*if(firstsettle){
    //首次结算，用shopid作为_id
    var shopres = await transaction.collection("bal_shop").doc(balshop.shopid).set({
      data:balshop
    });
    if(!shopres._id || (shopres.stats.created===0 && shopres.stats.updated===0)){

      !DEBUG ? await transaction.rollback():null;

      loginfo.balshop = balshop;
      loginfo.balshopres = shopres;
 
      loginfo.msg ="订单清算失败！请重试"+"("+shopres.errMsg+")"

      await _insertSettleLog(loginfo);

      return {
        errMsg:loginfo.msg
      }
    }
  } else {*/
    var shopres = await transaction.collection("bal_shop").doc(balshop.shopid).update({
      data:balshop
    });
    if(!shopres.stats || (shopres.stats.updated===0 && amtChange)){
      !DEBUG ? await transaction.rollback():null;
      
      loginfo.balshop = balshop;
      loginfo.balshopres = shopres;
 
      loginfo.msg ="订单清算失败！请重试"+"("+shopres.errMsg+")"

      await _insertSettleLog(loginfo);

      return {
        errMsg:loginfo.msg
      }
    }
  //}

  !DEBUG ?await transaction.commit():null;

  return {
    success:1,
    totalamt:totalamt,
    available:available,
    frozen:frozen,
    begmonth:shopsettlectrl.begmonth,
    endmonth:shopsettlectrl.endmonth,
    settlemonth:settlemonth,
    goods_num:goods_num,
    order_num:order_num,
    errMsg:"处理成功"
  }

}