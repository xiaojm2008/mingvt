const query = require('../comm/query');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname
  } = event;

  var res = await db.collection("sys_user").where({
    userid: wxContext.OPENID
  }).field({
    "shopinfo.shopid": 1
  }).get();

  if (!res.data || res.data.length === 0) {
    return res;
  }

  const cmd = db.command;
  var whereCondi = {
    shopid: cmd.in(res.data.map(v => v.shopinfo.shopid))
  }

  var ctrlParams = {
    openid: wxContext.OPENID,
    page_size: 100,
    care_total: false, //不考虑查询totalNum（总记录数，增加性能）
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: 0
  }

  var selectField = {
    shopid: 1,
    address: 1,
    shopname: 1,
    userid: 1,
    phone: 1,
    averagecost: 1,
    summary: 1,
    highopinion: 1,
    basedir:1,
    //"parameter.services": 1,
    "picpath.fileID": 1
  };
  return await query('xlh_shopinfo', whereCondi, ctrlParams, selectField);
}