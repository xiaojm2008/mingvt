const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const utils = require('../comm/utils.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
月度订单支付流水汇总
statis_paymentmonth
*/
module.exports = async (event, wxContext) => {
  const {
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
  statismonth = statismonth.replace("-");
  if (parseInt(statismonth) >= parseInt(cur)) {
    return {
      errMsg: '当前您处理上个月的订单支付信息'
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

  const $ = db.command.aggregate
  var res = await db.collection('xlh_paymentlog').aggregate()
  .match(
    $.and([
      {shopids:$.in([userInfo.shopinfo, '$shopids'])},//shopids是商铺ID数组，shopid是字符
      {
         confirmdate: {
          $gte: statismonth+"01",
          $lte: statismonth+"31", //还有一个paytime 14位 ,confirmdate为确认支付成日期，即调用queryOrder服务获取支付结果的日期
        }
      },
      {
        status:$.eq("1") //支付成功
      }
    ])
   )
  .project({
    openid:1,
    shopid:1,
    shopids:1,
    order_num:1,
    goods_num:1,
    primary_id:1,
    order_id:1,
    pay_id:1,
    status:1,
    total_pay:1,
    goods_info: $.filter({
      input: '$goods_info',
      as: 'item',
      cond: $.eq(['$$item.shopid', userInfo.shopinfo.shopid])
    })
  })
  .end();
  if(!res.list || res.list.length===0){
    return res;
  }
  var paymentincome ={
    openid:wxContext.OPENID,
    statismonth:statismonth,    
    shopid:userInfo.shopinfo.shopinfo,
    shopname:userInfo.shopinfo.shopname,
    order_num:0,
    goods_num:0,
    amt:0,
    settime:db.serverDate()
  }
  for(var i in res.list){
    var pay = res.list[i];
    paymentincome.order_num++;
    paymentincome.goods_num+=pay.goods_info.length;
    paymentincome.amt+=pay.goods_info.reduce((p1,c1)=>{
      p1 += c1.total_pay;
      return p1;
    },0)
  }

  const _id = userInfo.shopinfo.shopid + "_"+statismonth;

  res = await db.collection("statis_paymentmonth").doc(_id).set({data:paymentincome});
  if(res._id){
    return {
      success:1,
      errMsg:"处理成功"
    }
  }
  return res;
}