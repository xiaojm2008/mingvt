const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

var genDealByMonth = async (shopid, statismonth) => {
  if (!shopid || !shopid.trim()) {
    return null;
  }
  var $ = db.command.aggregate;

  return await db.collection('xlh_orderdetail').aggregate()
    .project({
      shopid: 1,
      dealdate: $.dateToString({
        date: '$dealtime',
        format: '%Y%m'
      }), 
      total_pay: 1,
      goods_num: 1,
      status: 1
    }).match(
      $.and([
         {
          shopid: {
            $eq: shopid
          }
        },
        {
          dealdate: {
            $eq: statismonth
          }
        },
        $.or([{
          status: $.eq('3')
        }, {
          status: $.eq('6')
        }, {
          status: $.eq('7')
        }, {
          status: $.eq('8')
        }])
      ])
    ).group({
      _id: '$dealdate',
      total_pay: $.sum("$total_pay"),
      goods_num: $.sum("$goods_num"),
      count: $.sum(1)     
    }).end();
}


var genDealByYear = async (shopid, statisyear) => {
  if (!shopid || !shopid.trim()) {
    return null;
  }
  return await db.collection('xlh_orderdetail').aggregate()
    .project({
      shopid:1,
      dealdate: $.dateToString({
        date: '$dealtime',
        format: '%Y%m'
      }),
      dealyear: $.dateToString({
        date: '$dealtime',
        format: '%Y'
      }),
      goods_num: 1,
      total_pay: 1,
      status: 1
      //status: $.or([$.eq(['$status', '1']), $.eq(['$status', '0'])])
    }).match(
      $.and([      
        {
          shopid: $.eq(shopid)
        },
        {
          dealyear: $.eq(statisyear)
        },
        $.or([{
          status: $.eq('3')
        }, {
          status: $.eq('6')
        }, {
          status: $.eq('7')
        }, {
          status: $.eq('8')
        }])
      ])
    ).group({
      _id: '$dealdate',
      total_pay: $.sum("$total_pay"),
      goods_num:$.sum("goods_num"),
      count: $.sum(1),
    }).sort({
      _id: 1 //升序
    })
    .end();
}
/**
 * 订单统计结算
 * @param {}} shopid 
 * @param {*} beginmonth 开始结算月份（不包括）
 * @param {*} endmonth 结算结算月份（不包括）
 */
var settleOrderByRange = async (shopid, beginmonth, endmonth) => {
  if (!shopid || !shopid.trim()) {
    return null;
  }
  var $ = db.command.aggregate,
  where = [],dateConid=null;
  /*where.push({
    shopid: $.eq(shopid)
  });*/

  if(beginmonth){
    //大于等于
    dateConid = {};
    dateConid.dealdate =  {
      $gt: beginmonth
    }
  }
  if(endmonth){
    if(!dateConid){
      dateConid={};
      dateConid.dealdate = {}
    }
    //小于
    dateConid.dealdate.$lt=endmonth;
  }
  if(dateConid){
    where.push(dateConid);
  }
  where.push($.or([{
    status: $.eq('3')
  }, {
    status: $.eq('6')
  }, {
    status: $.eq('7')
  }, {
    status: $.eq('8')
  }]));

  return await db.collection('xlh_orderdetail').aggregate()
    .project({
      shopid:1,
      dealdate: $.dateToString({
        date: '$dealtime',
        format: '%Y%m'
      }),
      goods_num: 1,
      total_pay: 1,
      status: 1
    }).match(
      $.and(where)
    ).group({
      _id: '$dealdate',
      total_pay: $.sum("$total_pay"),
      goods_num:$.sum("goods_num"),
      count: $.sum(1),
    }).sort({
      _id: 1 //升序
    })
    .end();
}

var genDealAll = async (shopid) => {
  if (!shopid || !shopid.trim()) {
    return null;
  }
  return await db.collection('xlh_orderdetail').aggregate()
    .project({
      shopid:1,
      dealdate: $.dateToString({
        date: '$dealtime',
        format: '%Y%m'
      }),
      status: 1,
      goods_num: 1,
      total_pay: 1 
    }).match(
      $.and([
        {
          shopid: $.eq(shopid)
        },
        $.or([{
          status: $.eq('3')
        }, {
          status: $.eq('6')
        }, {
          status: $.eq('7')
        }, {
          status: $.eq('8')
        }])
      ])
    ).group({
      _id: '$dealdate',
      total_pay: $.sum("$total_pay"),
      goods_num:$.sum("goods_num"),
      count: $.sum(1),
    }).sort({
      _id: 1 //升序
    })
    .end();
}

var getBalShop = async (shopid)=>{
  var res =  await db.collection('bal_shop')
  .doc(shopid)
  .field({
    shopid:1,
    totalamt:1,
    available:1,
    frozen:1,
    goods_num:1,
    order_num:1,
    settlemonth:1 //最近结算月份
  }).get();
  return res.data ? res.data:null;
}
var getSettleCtrl = async (shopid)=>{
  const $ = db.command.aggregate
  var res = await db.collection('sys_shopsettlectrl')
  .aggregate()
  .match({
    shopid:$.eq(shopid)
  })
  .project({
    shopid:1,
    order:1,//订单结算完成标志
    settlemonth:1,
    begmonth:1,
    endmonth:1
  })
  .group({
    _id: '$shopid',
    begmonth: $.min('$begmonth'),
    endmonth: $.max('$endmonth'),
    settlemonth: $.max('$settlemonth') //结算月份
  })
  .end();
  if(res.list && res.list.length>0){
    return res.list[0];
  }
  return null;
}

module.exports = {
  getSettleCtrl:getSettleCtrl,
  getBalShop:getBalShop,
  genDealAll:genDealAll,
  settleOrderByRange:settleOrderByRange,
  genDealByYear: genDealByYear,
  genDealByMonth: genDealByMonth
}