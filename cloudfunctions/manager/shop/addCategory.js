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

  if (!category.code) {
    return {
      errMsg: '分类代码为空'
    }
  }
  var res =null,data={};
  if (category.level == '1') {
    res = await db.collection('xlh_shopcategory').where({ shopid: shopid }).field({ shopid:1}).get();
    if (!res.data || res.data.length === 0) {
      res = await db.collection('xlh_shopcategory').add({data:{shopid:shopid}});
      if (!res._id) {
        return {
          success: 1,
          errMsg: '分类新增失败：'+res.errMsg
        }
      }
    }
    var res = await db.collection('xlh_shopcategory').where({
      shopid: shopid,
      items: {
        code: category.code
      }
    }).field({ shopid: 1 }).get();
    if (res.data && res.data.length > 0) {
      return {
        errMsg: '分类已经存在'
      }
    }
    const cmd = db.command;
    res = await db.collection('xlh_shopcategory').where({
      shopid: shopid
    }).update({
      data: {
        items: cmd.push([category])
      }
    });
    if (res.stats.updated === 1) {
      return {
        success: 1,
        errMsg: '分类新增成功'
      }
    } else if (res.stats.updated === 0) {
      return {
        success: res.stats.updated,
        errMsg: '分类新增失败'
      }
    }
  } else if (category.level == '2') {
    if (category.pindex === undefined || category.pindex===null){
      return {
        errMsg: '父索引参数错误'
      }
    }
    res = await db.collection('xlh_shopcategory').where({
      shopid: shopid,
      'items.code': typeof category.code === "string" ? category.code.substring(0, 3) : (category.code+"").substring(0, 3),
      'items.items.code': category.code
    }).field({shopid:1}).get();
    if (res.data && res.data.length > 0) {
      return {
        errMsg: '子分类已经存在'
      }
    }
    const cmd = db.command;
    data[`items.${category.pindex}.items`] = cmd.push([category]);
    res = await db.collection('xlh_shopcategory').where({
      shopid: shopid
    }).update({
      data: data
    });
    if (res.stats.updated >= 1) {
      return {
        success: res.stats.updated,
        errMsg: '子类新增成功'
      }
    } else if (res.stats.updated === 0){
      return {
        success: res.stats.updated,
        errMsg: '子类新增失败'
      }
    }
  }
  return res;
}