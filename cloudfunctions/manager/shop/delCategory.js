const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  var {
    transtype,
    actionname,
    shopid,
    category
  } = event;

  if (category.index === null || category.index === undefined) {
    return {
      errMsg: '参数错误：空异常'
    }
  }
  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  if(!shopid){
    shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
    if (!shopid) {
      return {
        errMsg: '您还未开店，信息不存在'
      }
    }
  }
  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  var res = null,data={};
  const cmd = db.command;
  if (category.level == '1') {
    data[`items.${category.index}`] = cmd.remove();
  } else if (category.level == '2'){
    if (category.pindex === null || category.pindex === undefined) {
      return {
        errMsg: '参数错误：空异常'
      }
    }
    data[`items.${category.pindex}.items.${category.index}`] = cmd.remove();
  }
  res = await db.collection('xlh_shopcategory').where({ shopid: shopid }).update({ data: data });
  if (res.stats.updated >= 1) {
    return {
      success: res.stats.updated,
      errMsg: '删除成功'
    }
  } else if (res.stats.updated === 0){
    return {
      success: res.stats.updated,
      errMsg: '删除失败'
    }
  }
  return res;
}