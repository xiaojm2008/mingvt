const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const promFormat = require("../comm/promFormat.js");
const query = require('../comm/query.js');
const V = require("../comm/validate.js").V;
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var updGoodsPromInfo = async(prom, prom_id) => {
  var res = await db.collection('xlh_goodsprom').where({
    prom_id: prom_id
  }).field({
    goodsno: 1
  }).get();
  if (res.data && res.data.length > 0) {
    var prominfo = {
      prom_id: prom_id,
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
    const cmd = db.command;
    return await db.collection('xlh_goods').where({
      goodsno: cmd.in(res.data.map(v => v.goodsno))
    }).update({
      data: {
        prominfo: prominfo
      }
    })
  }
  return {
    stats:{
      updated:0
    }
  }
}

module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    prom
  } = event;
  var err = V(promFormat, prom, 'baseinfo', prom, prom, null);
  if (err && err.errMsg) {
    return err;
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

  var docid = prom._id;
  delete prom._id;
  prom.mod_userid = oper_userid;
  prom.updatetime = db.serverDate();
  var res = await db.collection('xlh_promotion').doc(docid).update({
    data: prom
  });
  if (res.stats.updated === 1) {

    res = await db.collection('xlh_goodsprom').where({
      prom_id: docid
    }).update({
      data: prom
    });
    if (res.stats.updated >= 0) {
      //更新商品
      var resGoods = await updGoodsPromInfo(prom,docid);
      
      return {
        updated: res.stats.updated,
        success: 1,
        errMsg: '更新成功，并' + "成功同步【" + resGoods.stats.updated+"】条商品活动信息!"
      }
    } else {
      return {
        success: 0,
        errMsg: '更新失败，请重试'
      }
    }
  }

  return res;
}