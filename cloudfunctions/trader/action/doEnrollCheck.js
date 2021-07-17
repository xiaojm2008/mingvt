// 云函数入口文件
/**
 * 管理员，报名记录审核
 */
const utils = require("../comm/utils.js");
const mySeq = require("../comm/mySeq.js");
const cloud = require('wx-server-sdk')
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
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  if (!event.enrollid || !event.enrollid.trim()) {
    return {
      errMsg: "参数错误"
    }
  } else if (!event.apprstatus || !event.apprstatus.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var enrollinfo = await db.collection('xlh_enrollinfo').doc(event.enrollid).field({
    actionid:1,
    enrollstatus:1,
    apprflag:1,
    apprstatus:1
  }).get();
  if(!enrollinfo.data){
    return {
      errMsg:"信息不存在"
    }
  }
  enrollinfo = enrollinfo.data;
  if(enrollinfo.apprstatus == event.apprstatus){
    return {
      errMsg:"已经审批过了，不需要重新处理"
    }
  } else if(enrollinfo.enrollstatus =='9'){
    return {
      errMsg:"记录已经删除"
    }
  }

  const transaction = await db.startTransaction();
 
  var res = await transaction.collection('xlh_enrollinfo').doc(event.enrollid).update({
    data: {
      apprtime:new Date(),
      updatetime: new Date(),
      apprstatus: event.apprstatus
    }
  });
   /**审批状态100038 0待审核，1pass 2dispass不通过*/
  if(event.apprstatus=='2'){
    const cmd = db.command;
    res = await transaction.collection('xlh_enrollaction').doc(enrollinfo.actionid).update({
      data: {
        dispass_num:cmd.inc(1),
        updatetime: new Date()
      }
    });
  } else if(enrollinfo.apprstatus=='2' && event.apprstatus=='1'){
    //原来记录式审核不过，现在修改通过
    const cmd = db.command;
    res = await transaction.collection('xlh_enrollaction').doc(enrollinfo.actionid).update({
      data: {
        dispass_num:cmd.inc(-1),
        updatetime: new Date()
      }
    });
  }
  await transaction.commit();

  return {
    updated: res.stats.updated,
    success: res.stats.updated==1?1:0,
    errMsg: res.stats.updated==1?"处理成功":"更新失败"
  };
}