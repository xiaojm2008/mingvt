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

 if(category.index === undefined || category.index === null){
   return {
     errMsg: '分类索引参数错误'
   }
 }
  var res = null,data={};
  if (category.level == '1') {
    const cmd = db.command;
    /*
    res = await db.collection('xlh_shopcategory').where({
      shopid: shopid,
      'items.code': category.code
    }).get();

    if (!res.data || res.data.length === 0) {
      return {
        errMsg: '分类不存在'
      }
    } else if (res.data.length > 1) {
      return { errMsg: `[${category.code}]分类有多条记录`};
    }*/
    data[`items.${category.index}`] = category;
  } else if (category.level == '2') {
    if (category.pindex === undefined||category.pindex === null) {
      return {
        errMsg: '父分类索引参数错误'
      }
    }
    /*
    var where={};
    if (!category.parentcode || category.parentcode.trim() == '') {
      return {
        errMsg: '父分类CODE不能为空'
      }
    }
    const cmd = db.command;
    where['shopid']=shopid;
    where[`items.${pindex}.items.${category.index}.code`] = category.code;
    res = await db.collection('xlh_shopcategory').where(where).get();
    if (!res.data || res.data.length === 0) {
      return {
        errMsg: `[${category.parentcode}:${category.code}]子分类不存在`
      }
    } else if (res.data.length > 1){
      return {
        errMsg: `[${category.parentcode}:${category.code}]子分类有多条记录`
      }
    }*/
    const cmd = db.command;
    data[`items.${category.pindex}.items.${category.index}`] = cmd.set(category);//category;
  }
  res = await db.collection('xlh_shopcategory').where({
    shopid: shopid
  }).update({
    data: data
  });
  if (res.stats.updated >= 1) {
    return {
      success: res.stats.updated,
      errMsg: '更新成功'
    }
  } else if (res.stats.updated === 0) {
    return {
      success: 1,
      errMsg: '不需要更新'
    }
  }
  return res;
}