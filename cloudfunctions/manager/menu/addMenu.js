//const query = require('../comm/query');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    menu
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

  var res = db.collection('sys_menu').where({id:menu.id}).get();
  if(res.data && res.data.length > 0){
    return {
      errMsg: '菜单已经存在'
    }
  }
  if(menu.level == 1){
    res = await db.collection('sys_menu').add({
      data:menu
    });
    if(res._id){
      return {
        success:1,
        errMsg: '菜单新增成功'
      }
    } else {
      return {
        errMsg: '菜单新增失败'
      }
    }
  } 
  if (!menu.parentid || menu.parentid.trim() == ''){
    return {
      errMsg: '父菜单ID不能为空'
    }
  }
  const cmd = db.command;
  res = await db.collection('sys_menu').where({id:menu.parentid}).update({
    data:{
      children: cmd.push([menu])
  }});
  if(res.stats.updated == 1){
    return {
      success: 1,
      errMsg: '菜单新增成功'
    }
  }
  return res;
}