const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    category_index,
    category_id
  } = event;

  if (category_id === undefined || null === category_id) {
    return {
      errMsg: '参数错误：分类ID空异常'
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
  /*
   const outField = {
     "goodsno": 1,
     "goodsname": 1,
     "price": 1,
     "picpath": 1,
     "summary": 1,
     "status": 1
   }
   var cmd = db.command;
   var ctrlParams = {
     openid: oper_userid,
     page_size: null,
     orderby_field: 'goodsname',
     orderby_type: 'desc',
     batch_time:-1
   }
   var goods = await query('xlh_goods', {_id:cmd.in(goods_ids)}, ctrlParams, outField);
   */
  var res = null;
  if (category_index === null || category_index === undefined) {
    res = await db.collection('xlh_category').doc(category_id).field({ items: 1 }).get();
    res = res.data;
    if (!res) {
      return {
        errMsg: '分类信息不存在'
      }
    }
    if(res.items && res.items.length > 0){
      return {
        errMsg: '分类信息下还存在子类！'
      }
    }
  
    res = await db.collection('xlh_category').doc(category_id).remove();
    if (res.stats.removed) {
      return {
        success: 1,
        errMsg: "删除分类成功"
      }
    }
    return res;
  }

  var data = { items:{}};
  data.items[category_index] = cmd.remove();

  res = await db.collection('xlh_category').doc(category_id).update({data:data});
  if (res.stats.updated) {
    return {
      success: 1,
      errMsg: "删除子分类成功"
    }
  }
  return res;
}