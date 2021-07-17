const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    catetype,
    category
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

  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  if(!catetype){
    return {
      errMsg: '参数错误，分类类别不能为空'
    }
  }

  if (category.level === 1) {
    const cmd = db.command;
    var res = db.collection('xlh_category').where({
      catetype:catetype,
      items: {
        code: category.code
      }
    }).get();
    if (res.data && res.data.length > 0) {
      return {
        errMsg: '分类已经存在'
      }
    }
    res = await db.collection('xlh_category').where({
      catetype: catetype
    }).update({
      data: {
        items: cmd.push([category])
      }
    });
    if (res.stats.updated == 1) {
      return {
        success: 1,
        errMsg: '分类新增成功'
      }
    }
  } else if (category.level === 2) {
    if (!category.parentcode || category.parentcode.trim() == '') {
      return {
        errMsg: '父分类不能为空'
      }
    }
    const cmd = db.command;
    res = await db.collection('xlh_category').where({
      catetype:catetype,
      items:{
        code: category.parentcode.trim(),
        items:{
          code: category.code
        }
      }
    }).get();
    if (res.data && res.data.length > 0) {
      return {
        errMsg: '分类已经存在'
      }
    }
    res = await db.collection('xlh_category').where({
      catetype: catetype,
      items: {
        code: cmd.eq(category.parentcode.trim()),
        items: {
          code: cmd.eq(category.code),
        }
      }
    }).update({
      data: {
        items: cmd.set({
          items: cmd.push([category])
        })
      }
    });
    if (res.stats.updated == 1) {
      return {
        success: 1,
        errMsg: '分类新增成功'
      }
    }
  }
  return res;
}