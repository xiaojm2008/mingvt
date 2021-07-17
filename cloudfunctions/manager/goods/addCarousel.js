
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
/**
 * goodsno = _id
 */
module.exports = async (event, wxContext) => {
  const {
    goodsno
  } = event;
  if (!goodsno){
    return {
      errMsg:'商品编号不能空'
    }
  }

  const userInfo = await getUserInfo(wxContext.OPENID);


  //await manageRight.checkUserRight(event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var goods =  await db.collection('xlh_goods').where({goodsno:goodsno}).field({
    goodsno:1,
    goodsname:1,
    picpath:1,
    "price.saleprice":1,
    shopid:1,
  }).get();


  goods = goods.data && goods.data.length==1 ?goods.data[0]:null;
 

  if(goods.picpath.length < 3){
    return {
      errMsg: "商品图片为上传齐全"
    }
  }
  var res = null;
  const i = await db.collection('xlh_carousel').where({goodsno:goodsno}).field({goodsno:1}).get();

  if(i.data && i.data.length > 0){
    res = await db.collection('xlh_carousel').where({goodsno:goodsno}).update({
      data:{
        goodsno:goods.goodsno,
        goodsname:goods.goodsname,
        shopid:goods.shopid,
        price:goods.price.saleprice,
        picpath:goods.picpath[2].fileID,
        buycount:0,
        flag:1,
        settime:new Date()
      }
    });
    if(res.stats.updated){
      return {
        errMsg:"更新成功"
      }
    }
  } 
    res = await db.collection('xlh_carousel').add({
      data:{
        goodsno:goods.goodsno,
        goodsname:goods.goodsname,
        shopid:goods.shopid,
        price:goods.price.saleprice,
        picpath:goods.picpath[2].fileID,
        buycount:0,
        flag:1,
        settime:new Date()
      }
    });
    if(res._id){
      return {
        errMsg:"设置成功"
      }
    }
}