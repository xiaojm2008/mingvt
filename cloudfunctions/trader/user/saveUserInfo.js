// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  var userInfo = {
    openid: wxContext.OPENID,
    pwd: null,
    idcard: "",
    platform: null,
    avatarurl: event.user.avatarurl||'',
    nickname: event.user.nickname||'',
    gender: event.user.gender||'',
    username: event.user.username||'',
    birthdate: event.user.birthdate||'',
    country:event.user.country||'',
    phone: event.user.phone,
    latitude:event.user.latitude,
    longitude:event.user.longitude,
    prov: event.user.prov,
    city:event.user.city,
    detail: event.user.detail||''
  };
  
  const db = cloud.database({
    throwOnNotFound: false
  });

  /**
   * even.authflag==1 在login页面中的处理，只是做基本信息存储
   */
  if(event.authflag != 1){
    if(!userInfo.prov || !userInfo.prov.code){
      return {
        errMsg:"省份信息错误，请重新选择"
      }
    }
    if(!userInfo.city || !userInfo.city.code){
      return {
        errMsg:"城市信息错误，请重新选择"
      }
    }
    //shop/000000/ounQF5tRpBxK1gFBYvE5rlQ7A7oI/S0000
    userInfo.basedir = `P${userInfo.prov.code}/${userInfo.city.code}/${wxContext.OPENID}/`;
    userInfo.regtime = db.serverDate();
  } else {
    userInfo.authtime = db.serverDate();
  }

  var res = null;

  if (userInfo.phone && userInfo.phone.trim()) {
    //检查手机号是否被其他人注册过
    res = await db.collection('xlh_userinfo').where({
      phone: userInfo.phone
    }).field({
      openid: 1
    }).get();

    if (res.data && res.data.length != 0 && res.data[0].openid != wxContext.OPENID) {
      return {
        _id: null,
        errMsg: `手机号码${userInfo.phone}已经注册`
      };
    }
  }
 
  
  res = await db.collection('xlh_userinfo').doc(wxContext.OPENID).field({
    _id: 1,
    basedir:1
  }).get();

  if (res.data) {
    var basedir = res.data.basedir;
    if(basedir &&basedir.trim()){
      //一般只能初始化一次
      userInfo.basedir&&delete userInfo.basedir;
    } else {
      basedir = userInfo.basedir;
    }
    var u_id = res.data._id;
    userInfo.updatetime = db.serverDate();
    res = await db.collection('xlh_userinfo').doc(u_id).update({
      data: userInfo
    });
    return {     
      basedir:basedir,
      openid: wxContext.OPENID,
      success:res.stats.updated==1?1:0,
      errMsg: res.stats.updated==1?"更新成功":"未更新",
    };
  } 

  //新增
  userInfo.settime = db.serverDate(),
  userInfo.updatetime = db.serverDate();

  res = await db.collection('xlh_userinfo').doc(wxContext.OPENID).set({
    data: userInfo
  });

  return {
    basedir:userInfo.basedir,
    openid: wxContext.OPENID,
    success:res.stats.created==1?1:0,
    errMsg: res.stats.created==1?(event.authflag===1?"授权成功":"注册成功"):("处理失败:"+res.errMsg)
  };  
}