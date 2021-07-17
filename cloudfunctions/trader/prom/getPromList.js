const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
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
  preparebegtime_dt: 1,
  limittimeflag: 1,
  begtime: 1,
  endtime: 1,
  begtime_dt: 1,
  endtime_dt: 1
}
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    batch_time,
    page_size,
    shopid,
    promtype,
    goodsname,
    promname
  } = event;

  var ctrlParams = {
    page_size: page_size,  
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: batch_time
  }

  var whereCondi = {
  };
  shopid && shopid.trim() != "" ? (whereCondi.shopid = shopid) : "";
  promtype && promtype.trim() != "" ? (whereCondi.promtype = promtype) : "";
  if (promname && promname.trim()) {
    whereCondi.promname = {
      $regex: '.*' + promname,
      $options: 'i'
    }
    whereCondi.promfullname = {
      $regex: '.*' + promname,
      $options: 'i'
    }
  }
  if (goodsname && goodsname.trim()) {
    whereCondi.goodsname = {
      $regex: '.*' + goodsname,
      $options: 'i'
    }
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
    goodsname: 1,
    goods: 1,
    status: 1
  }, somefield);
  return await query('xlh_goodsprom', whereCondi, ctrlParams, outField);
}