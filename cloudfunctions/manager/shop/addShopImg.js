const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/**
 * 查询用 listShopImg.js
 *  {"imginfo":[{"shopid":"S0000","imgcate":"effectiveshow","fileID":"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000/shop/extimg/719eb9bea2ffb0eaba1d82bb01caecd7.jpg","status":"2"},{"shopid":"S0000","imgcate":"effectiveshow","fileID":"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000/shop/extimg/94b12725b27ad0c266a365cf67e3c978.jpg","status":"2"}],"transtype":"shop","actionname":"addShopImg"}
 */
module.exports = async(event, wxContext) => {
  var {
    transtype,
    actionname,
    shopid,
    imginfo
  } = event;
  if (!imginfo || imginfo.length === 0) {
    return {
      errMsg: "空数据"
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

  var tasks = []
  imginfo.forEach(v => {
    v.oper_userid = wxContext.OPENID;
    v.settime = db.serverDate();
    v._id = v.digest;
    v.shopid = shopid;
    tasks.push(
      db.collection('xlh_shopimg').add({
        data: v
      })
    )
  });
  var res = await Promise.all(tasks);/*.then(res => {
    var succ = res.find(v => !v._id);
    return {
      success: 1,
      errMsg: "图片上传成功"
    }
  });*/

  var success = res.filter(v =>v._id);

  const cmd = db.command;
  var imgnum = await db.collection("xlh_shopinfo").where({
    shopid:shopid
  }).update({
    data:{
      countofimg:cmd.inc(success.length)
    }
  })

  if (success.length < tasks.length){
    return {
      errMsg: "部分图片上传失败"
    }
  }
  return {
    success:1,
    countofimg:imgnum,
    imgs:success,
    errMsg: "图片上传成功"
  }
}