//const query = require('yutian').query;
const query = require('../comm/query');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
{
  "transtype":"goods",
  "actionname":"getGoods",
  "shopid":"S0000",
  "goodsname":"规格",
  "status":null,
  "page_size":10,
  "batch_time":-1
}
*/
module.exports = async(event, wxContext) => {
  const {
    shopid,
    transtype,
    actionname,
    saleprice
  } = event;

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

  if (!await manageRight.checkUserRight(actionname, oper_userid, shopid ?shopid:oper_shopid)) {
    return {
      errMsg: `您没有[${actionname}]权限`
    }
  }
  var ctrlParams = {
    openid: oper_userid,
    page_size: event.page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  var whereCondi = {
    shopid: shopid ? shopid : oper_shopid
  };
  
  if (saleprice && saleprice.length > 0){
    const cmd = db.command;
    whereCondi.price = {};
    if (saleprice[0][0] == '<'){
      whereCondi.price.saleprice = cmd.lt(Number(saleprice[0].substr(1)));
    } else if (saleprice[0][0] == '>') {
      whereCondi.price.saleprice = cmd.gt(Number(saleprice[0].substr(1)));
    } else {
      var s = saleprice[0].split('~').map(v=>Number(v));      
      whereCondi.price.saleprice = cmd.gte(s[0]).and(cmd.lte(s[1]));//cmd.in(s); cmd.gte(s[0]).and(cmd.lte(s[1]));
    }
  }
  if(event.goodsname){
    whereCondi.goodsname = {
      $regex: '.*' + event.goodsname,
      $options: 'i'
    }
  }
  if (event.keywords) {
    whereCondi.keywords = {
      $regex: '.*' + event.keywords,
      $options: 'i'
    }
  }
  const outField = {
    "shopid": true,
    "shopname": true,
    "goodsno": true,
    "goodsname": true,
    "deptid": true,
    "subid":true,
    "quantity":true,
    "price":true,
    "picpath":true,
    "keywords":true,
    "status":true,
    "updatetime":true
  }
  event.status && event.status !== "" ? (whereCondi.status = event.status) : "";
  return await query('xlh_goods', whereCondi, ctrlParams, outField);
}