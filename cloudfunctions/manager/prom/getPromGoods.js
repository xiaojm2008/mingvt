const query = require('../comm/query.js');
const query2 = require('../comm/query2.js');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const OPERTYPE_GOODSPROMS = "A"; //活动主商品，
const OPERTYPE_GOODSINPROM = "I"; //活动从属商品
const somefield = {
  immediatecutamt: 1,
  discount: 1,
  fullcutamt: 1,
  seckilltype: 1,
  promamt: 1,
  promqty: 1,
  preparebegtime: 1,
  thresholdamt: 1,
  maxbuyqty: 1,
  maxbuypromqty: 1,
  preparebegtime: 1,
  limittimeflag:1,
  begtime: 1,
  endtime: 1
}
const fieldout = {
  1: {
    immediatecutamt: 1,
    thresholdamt: 1,
    maxbuyqty: 1,
    maxbuypromqty: 1
  },
  2: {
    discount: 1,
    thresholdamt: 1,
    maxbuyqty: 1,
    maxbuypromqty: 1
  },
  4: {
    fullcutamt: 1,
    thresholdamt: 1,
    maxbuyqty: 1,
    maxbuypromqty: 1
  },
  5: {
    seckilltype: 1,
    promamt: 1,
    promqty: 1,
    preparebegtime: 1,
    begtime: 1,
    endtime: 1,
    maxbuyqty: 1,
    maxbuypromqty: 1
  },
  6: {
    promamt: 1,
    promqty: 1,
    preparebegtime: 1,
    begtime: 1,
    endtime: 1,
    maxbuyqty: 1,
    maxbuypromqty: 1
  },
  8: {
    bargaintype: 1,
    personqty: 1,
    minbargainamt: 1,
    maxbargainamt: 1,
    promqty: 1,
    maxbuyqty: 1,
    maxbuypromqty: 1
  },
  9: {
    promamt: 1,
    thresholdamt: 1,
    maxbuyqty: 1,
    maxbuypromqty: 1
  }
}
/**
 * 假设加个小于等于 10 的打 8 折，大于 10 的打 5 折，让数据库查询返回打折后价格小于等于 8 的记录：
const _ = db.command
const $ = _.aggregate
db.collection('items').where(_.expr(
  $.lt(
    $.cond({
      if: $.gte('$price', 10),
      then: $.multiply(['$price', '0.5']),
      else: $.multiply(['$price', '0.8']),
    })
    ,
    8
  )
).get()
 * 
 */
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    batch_time,
    page_size,
    opertype,
    goods_id,
    goodsno,
    goodsname,
    prom_id,
    promtype,
    promfullname,
    status
  } = event;
  /*
  if (!promtype){
    return {
      errMsg: '活动类型不能为空'
    }
  }*/
  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  const oper_shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
  if (!oper_shopid) {
    return {
      errMsg: '您还未开店，信息不存在'
    }
  }

  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var ctrlParams = {
    openid: oper_userid,
    page_size: page_size,
    orderby_field: ["status", "updatetime"],
    orderby_type: ["desc", "desc"],
    batch_time: batch_time
  }
  var outField = Object.assign({
    prom_id: 1,
    promno: 1,
    promtype: 1,
    promname: 1,
    promfullname: 1,
    prominfo: 1,
    marqueeshow: 1,
    prompic: 1,
    goodsname:1,
    goods: 1,
    status: 1
  }, somefield);
  if (opertype === OPERTYPE_GOODSPROMS) {
    var whereCondi = {
      shopid: oper_shopid
    };
    promtype && promtype != "" ? (whereCondi.promtype = promtype) : "";
    prom_id && prom_id != "" ? (whereCondi.prom_id = prom_id) : "";
    goods_id && goods_id != "" ? (whereCondi.goods_id = goods_id) : "";
    goodsno && goodsno != "" ? (whereCondi.goodsno = goodsno) : "";

    status && status != "" ? (whereCondi.status = status) : "";
    if (promfullname) {
      whereCondi.promfullname = {
        $regex: '.*' + promfullname,
        $options: 'i'
      }
    }
    if (goodsname) {
      whereCondi.goodsname = {
        $regex: '.*' + goodsname,
        $options: 'i'
      }
    }
    return await query('xlh_goodsprom', whereCondi, ctrlParams, outField);
  } else {
    const cmd = db.command;
    const $ = db.command.aggregate;
    var matchParams = {
        shopid: cmd.eq(oper_shopid)
      },
      projectParams = Object.assign({}, outField),
      groupBy = null;
    promtype && promtype != "" ? (matchParams.promtype = cmd.eq(promtype)) : "";
    prom_id && prom_id != "" ? (matchParams.prom_id = cmd.eq(prom_id)) : "";
    if (promfullname) {
      matchParams.promfullname = {
        $regex: '.*' + promfullname,
        $options: 'i'
      }
    }
    goods_id && goods_id != "" ? (projectParams.goods_id = $.filter({
      input: '$goods_id',
      as: 'item',
      cond: $.eq(['$$item.goods_id', goods_id])
    })) : "";
    goodsno && goodsno != "" ? (projectParams.goodsno = $.filter({
      input: '$goodsno',
      as: 'item',
      cond: $.eq(['$$item.goodsno', goodsno])
    })) : "";
    if (goodsname) {
      projectParams.goodsname = $.filter({
        input: '$goodsname',
        as: 'item',
        cond: $.eq(['$$item.goodsname', {
          $regex: '.*' + goodsname,
          $options: 'i'
        }])
      })
    }
    return await query2('xlh_goodsprom', matchParams, ctrlParams, projectParams, groupBy);
  }
}