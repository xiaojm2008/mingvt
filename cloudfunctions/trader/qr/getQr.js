// 云函数入口文件
const getUserInfo = require("../user/getUserInfo.js")
const mySeq = require("../comm/mySeq.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

var _saveQR = async function(filename, buffer) {
  return await cloud.uploadFile({
    cloudPath: filename,
    fileContent: buffer,
  });
}

module.exports = async (event, wxContext) => {
  var {
    width,
    scene,
    type, //1:商品，2店铺，3报名活动
    url,//最终需要被分享的页面（即最后定位到的详情PAGE）
    content //小程序码扫描后第一次定位的页面
  } = event;
  //根据type不同对应不同含义值：goodsno,shopid,actionid(sigid)
  if (!scene || !scene.trim()) {
    return {
      errMsg: "参数错误，不能空"
    }
  }
  
  var userinfo = await getUserInfo(event,wxContext);
  userinfo = userinfo.data && userinfo.data.length>0 ? userinfo.data[0]:null;
  if(!userinfo){
    return {
      errMsg:"用户未授权"
    }
  }
  //if()
  //var basepath = userinfo.shopinfo.basepath;
  var debug = false;
  /*
  var qr = await db.collection('xlh_qrinfo').doc(scence).get();
  if(qr.data){
    return {
      success:1,
      type:"path",
      qr:qr.data.qr
    }
  }*/
  if (!width || width === 0) {
    width = 430;
  }

  const config = await db.collection('sys_config').get();
  if (config.data && config.data.length > 0) {
    debug = config.data[0].debug;
  }
  
  var qr = null;

  var exists = await db.collection("xlh_shareinfo").where({
    share_no:scene,
    share_userid:userinfo.openid
  }).field({
    share_type:1,
    share_content:1,
    share_url:1,
    share_qrwidth:1,
  }).get();
  exists = exists.data && exists.data.length > 0 ? exists.data[0]:null;
  if(exists){

    const cmd = db.command;
    await db.collection("xlh_shareinfo").doc(exists._id).update({
      data:{
        share_url:url,
        share_qrwidth:width,
        share_type:type,
        share_content:content,
        share_times:cmd.inc(1),
        updatetime:db.serverDate()
      }
    });

    qr = await cloud.openapi.wxacode.getUnlimited({
      scene: exists._id,
      page: debug ? null : content,
      width: width
    })

    if (!qr.buffer || qr.buffer.byteLength == 0) {
      return {
        errMsg: "生成小程序码失败！"
      };
    }

    return {
      success:1,
      type:"buffer",
      buffer:qr.buffer
    };
  }

  const _id = mySeq.mySeq32("SHA");

  var shareinfo = {
    share_id:_id,
    share_no:scene,
    share_type:type,
    share_content:content,
    share_url:url||'',
    share_qrwidth:width,
    share_avatarurl:userinfo.avatarurl,
    share_userid:userinfo.openid,
    share_nickname:userinfo.nickname,  
    share_username:userinfo.username,
    share_times:0,
    entry_times:0,
    settime:db.serverDate(),
    updatetime:db.serverDate()
  }

  qr = await cloud.openapi.wxacode.getUnlimited({
    scene: _id,
    page: debug ? null : content,
    width: width
  })
  if (!qr.buffer || qr.buffer.byteLength == 0) {
    return {
      errMsg: "生成小程序码失败！"
    };
  }

  shareinfo.share_qr=null;

  var shareres = await db.collection("xlh_shareinfo").doc(_id).set({
    data:shareinfo
  })

  if(!shareres._id){
    return {
      errMsg: "生成小程序码SCENE失败！"
    }
  }

  return {
    success:1,
    type:"buffer",
    buffer:qr.buffer
  };
}