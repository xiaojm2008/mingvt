// 云函数入口文件
const getUserInfo = require("../user/getUserInfo.js")
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

module.exports = async (event, wxContext) => {
  var {
    scene,
    userInfo
  } = event;

  userInfo = userInfo||{};

  if (!scene || !scene.trim()) {
    return {
      errMsg: "参数错误，不能空"
    }
  }

  //scene = share_id ,根据type不同scene对应不同含义值：goodsno,shopid,actionid(sigid)
  var shareInfo = await db.collection("xlh_shareinfo").doc(scene).field({
    share_id:1, //即：_id
    share_no:1, //goodsno,shopid,sigid...
    share_url:1, //最后定位的页面
    share_type:1,
    share_avatarurl:1,
    share_userid:1,
    share_nickname:1,  
    share_username:1,
    share_time:1
  }).get();

  shareInfo = shareInfo.data?shareInfo.data:null;
  if(!shareInfo){
    return {
      errMsg:"分享不存在"
    }
  }

  const cmd = db.command;
  await db.collection("xlh_shareinfo").doc(scene).update({
    data:{
      entry_times:cmd.inc(1),
      entry_lasttime:db.serverDate()
    }
  });

  var exists = await db.collection("xlh_shareentryinfo").where({
    share_id:shareInfo._id, //等于scene
    entry_userid:wxContext.OPENID
  }).field({
    share_no:1,
    share_type:1
  }).get();

  exists = exists.data && exists.data.length>0?exists.data[0]:null;

  if(exists){

    //第二次进入别人分享的页面
    await db.collection("xlh_shareentryinfo").doc(exists._id).update({
      data:{
        entry_times:cmd.inc(1),
        updatetime:db.serverDate()
      }
    });

    return {
      success:1,
      share_url:shareInfo.share_url,
      share_no:shareInfo.share_no,
      share_type:shareInfo.share_type,
      errMsg:"查询成功"
    }
  }
  //首次进入别人分享的页面
  var shareentryinfo = {
    share_id:shareInfo.share_id,
    share_no:shareInfo.share_no,
    share_url:shareInfo.share_url,
    share_type:shareInfo.share_type,
    share_avatarurl:shareInfo.share_avatarurl,
    share_userid:shareInfo.share_userid,
    share_nickname:shareInfo.share_nickname,  
    share_username:shareInfo.share_username,
    share_time:shareInfo.share_time,
    entry_userid:wxContext.OPENID,
    entry_avatarurl:userInfo.avatarUrl,
    entry_gender:userInfo.gender,
    entry_nickname:userInfo.nickName,
    entry_country:userInfo.country,
    entry_province:userInfo.province,
    entry_city:userInfo.city,
    entry_times:0,
    settime:db.serverDate(),
    updatetime:db.serverDate()
  }

  var res = await db.collection("xlh_shareentryinfo").add({
    data:shareentryinfo
  })

  return {
    success:1,
    share_no:shareInfo.share_no, //对应可能是goodsno,shopid,sigid
    share_url:shareInfo.share_url,//最后需要定位到的页面
    share_type:shareInfo.share_type,//对用1：商品详情，2店铺，3报名信息
    errMsg:"记录成功"
  }
}