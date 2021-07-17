
//const manageRight = require('yutian').manageRight;
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});

var delGoods = (event, wxContext)=>{
  const {
    goodsno
  } = event;
  if (!goodsno){
    return {
      errMsg:'商品编号不能空'
    }
  }
  /*
  var shopid = goodsno.substr(0,5);
  if (shopid.charAt(0) != 'S'){
    return {
      errMsg: '商品编号非法'
    }
  }
  
  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.shopinfo.shopid != shopid) {
    return {
      errMsg: `您没有该店铺操作权限`
    }
  }
*/
  const userInfo = await getUserInfo(wxContext.OPENID);
  if (!await manageRight.checkUserRight(event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid)) {
    return {
      errMsg: `您没[${userInfo.shopinfo.shopname}][${event.actionname}]权限`
    }
  } 
  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  return await db.collection('xlh_goods').doc({goodsno:goodsno}).update({
    data:{
      status:'D',
      updatetime:new Date().getTime()
    }
  });
}

module.exports = delGoods;