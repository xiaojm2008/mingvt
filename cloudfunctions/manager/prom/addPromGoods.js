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
  prom_id: 1,
  promno: 1,
  promtype: 1,
  promname: 1,
  promfullname: 1,
  marqueeshow: 1,
  prominfo: 1,
  prompic: 1,
  immediatecutamt: 1,
  discount: 1,
  fullcutamt: 1,
  seckilltype: 1,
  promamt: 1,
  promqty: 1,
  thresholdamt: 1,
  maxbuyqty: 1,
  maxbuypromqty: 1,
  limittimeflag: 1,
  preparebegtime: 1,
  begtime: 1,
  endtime: 1,
  shopid: 1,
  status: 1
}
var updGoodsPromInfo = async (prom, goodsno) => {
  var prominfo = {
    prom_id: prom.prom_id,
    promno: prom.promno,
    promtype: prom.promtype,
    promname: prom.promname
  };
  prom.immediatecutamt && prom.immediatecutamt > 0 ? prominfo.immediatecutamt = prom.immediatecutamt : 0;
  prom.discount && prom.discount > 0 ? prominfo.discount = prom.discount : 0;
  prom.fullcutamt && prom.fullcutamt > 0 ? prominfo.fullcutamt = prom.fullcutamt : 0;
  prom.promamt ? prominfo.promamt = prom.promamt : 0;
  prom.limittimeflag ? prominfo.limittimeflag = prom.limittimeflag : 0;
  prom.preparebegtime ? prominfo.preparebegtime = prom.preparebegtime : 0;
  prom.begtime ? prominfo.begtime = prom.begtime : 0;
  prom.endtime ? prominfo.endtime = prom.endtime : 0;
  return await db.collection('xlh_goods').where({
    goodsno: goodsno
  }).update({
    data: {
      prominfo: prominfo
    }
  })
}
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    goods_id,
    goodsprom_id,
    prom_id,
    opertype
  } = event;
  if (!goods_id) {
    return {
      errMsg: '参数错误:商品编号不能空！'
    }
  }
  if (opertype == OPERTYPE_GOODSPROMS && !prom_id) {
    return {
      errMsg: '参数错误:活动ID不能空！'
    }
  } else if (opertype == OPERTYPE_GOODSINPROM && !goodsprom_id) {
    return {
      errMsg: '参数错误:商品活动ID不能空！'
    }
  }
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

  /**
   * {
    promname: 1,
    promfullname: 1,
    promtype: 1,
    limittimeflag: 1,
    begtime: 1,
    endtime: 1,
    status: 1,
    prominfo: 1,
    picpath: 1
  }
   */
  var goods = await db.collection('xlh_goods').doc(goods_id).field({
    goodsno: 1,
    goodsname: 1,
    summary: 1,
    status: 1,
    picpath: 1,
    price: 1
  }).get();
  goods = goods.data;
  if (!goods) {
    return {
      errMsg: '商品不存在不存在'
    }
  }
  goods.settime = db.serverDate();
  if (opertype == OPERTYPE_GOODSPROMS) {
    //添加商品
    var prom = await db.collection('xlh_promotion').doc(prom_id).field(somefield).get();
    prom = prom.data;
    if (!prom) {
      return {
        errMsg: '活动不存在'
      }
    }
    if (prom.status != '1') {
      return {
        errMsg: '活动状态无效'
      }
    }

    var res = await db.collection('xlh_goodsprom').where({
      promno: prom.promno,
      goodsno: goods.goodsno
    }).field({
      goodsno: 1
    }).get();

    if (res.data && res.data.length > 0) {
      return {
        errMsg: '商品在本活动中已经存在了，不能重复添加'
      }
    }

    prom.prom_id = prom._id;
    prom.goods_id = goods._id;
    Object.assign(prom, goods);
    delete prom._id;
    goods.primary = '1';
    prom.goods = [goods];
    prom.settime = db.serverDate();
    prom.updatetime = db.serverDate();
    prom.create_userid = oper_userid;

    var resGoods = await updGoodsPromInfo(prom, goods.goodsno);
    res = await db.collection('xlh_goodsprom').add({
      data: prom
    });
    if (res._id) {
      return {
        _id: res._id,
        prom_id: prom_id,
        success: 1,
        errMsg: "添加商品活动成功，并同步【" + resGoods.stats.updated+"】条商品记录"
      }
    }
    return res;
  }
  //组合商品
  var goodsprom = await db.collection('xlh_goodsprom').doc(goodsprom_id).field({
    goods: 1,
    status: 1
  }).get();
  goodsprom = goodsprom.data;
  if (!goodsprom) {
    return {
      errMsg: '活动不存在'
    }
  }
  var fgoods = goodsprom.goods ? goodsprom.goods.find((v => v._id == goods_id)) : null;
  if (fgoods) {
    return {
      errMsg: "该次活动商品已经加入！"
    }
  }
  goods.primary = '0';
  var cmd = db.command;
  var res = await db.collection('xlh_goodsprom').doc(goodsprom_id).update({
    data: {
      updatetime: db.serverDate(),
      mod_userid: oper_userid,
      goods: cmd.push([goods])
    }
  });
  if (res.stats.updated) {
    return {
      success: 1,
      errMsg: "添加商品成功"
    }
  }
  return res;
}