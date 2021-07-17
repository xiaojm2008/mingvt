const V = require("../comm/validate.js").V;
const actFormat = require("./actFormat.js");
const cloud = require('wx-server-sdk');

cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});

var getuserInfo = async (openid) => {
  return await db.collection('xlh_userinfo').where({
    openid: openid
  }).field({
    phone: true,
    username: true,
    nickname: true,
    avatarurl: true
  }).get();
}
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var {
    actionid,
    actionstatus /** 0:"启动",1:"暂停",9:"删除" */
  } = event;

  var userInfo = await getuserInfo(wxContext.OPENID);
  if (!userInfo.data || userInfo.data.length == 0) {
    return {
      errMsg: '用户没有注册'
    }
  }
  if (!actionid || !actionstatus) {
    return {
      errMsg: "参数错误"
    }
  }
  //var res = null;
  /**
   * 报名删除的话需要更新action的num
   */
  var res = await db.collection('xlh_enrollaction').doc(actionid).update({
    data: {
      status:actionstatus,
      updatetime:new Date()
    }
  });
  if(res.stats.updated===1){

    var enrollinfo = {};    
    enrollinfo.actionstatus = actionstatus;
    res = await db.collection('xlh_enrollinfo').where({actionid:actionid}).update({
      data: enrollinfo
    });

    return {
      success:1,
      errMsg:"操作成功"
    }
  }
  return {
    success:0,
    errMsg:"操作失败"
  };
}