const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const mySeq = require('../comm/mySeq.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    thema,
  } = event;
  
  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  /*
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
  */
 var res = null
 if(thema._id && thema._id.trim()){
   res = await db.collection("xlh_thema").doc(thema._id).set({
      data:{
        authorid:wxContext.OPENID,
        authorname:userInfo.username||userInfo.nickname,
        authorimg:userInfo.avatarurl,
        catetype:thema.catetype,
        picpath:thema.picpath,
        feetype:thema.feetype,/**是否收费 */
        price:thema.price,
        name:thema.name,
        content:thema.content,
        summary:thema.summary,
        updatetime:new Date()
      }
   })
 }
  res = await db.collection("xlh_thema").add({
    data:{
      _id:mySeq.mySeq32("TMA"),
      authorid:wxContext.OPENID,
      authorname:userInfo.username||userInfo.nickname,
      authorimg:userInfo.avatarurl,
      catetype:thema.catetype,
      picpath:thema.picpath,
      feetype:thema.feetype,/**是否收费 */
      price:thema.price,
      name:thema.name,
      content:thema.content,
      summary:thema.summary,
      status:"1", // 0 未发布 1 已发布
      settime:new Date(),
      updatetime:new Date()
    }
  });
  if(res._id){
    return {
      success:1,
      errMsg:"保存成功"
    }
  } 
  return {
    errMsg:"保存失败"
  }
}