// 云函数入口文件
const utils = require("../comm/utils.js");
const mySeq = require("../comm/mySeq.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});

// 云函数入口函数
module.exports = async (event, context) => {
  //const wxContext = cloud.getWXContext();

  if (!event.enrollid || !event.enrollid.trim()) {
    return {
      errMsg: "参数错误"
    }
  } else if (!event.enrollstatus || !event.enrollstatus.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var enrollinfo = await db.collection('xlh_enrollinfo').doc(event.enrollid).field({
    actionid:1,
    enrollstatus:1
  }).get();
  if(!enrollinfo.data){
    return {
      errMsg:"信息不存在"
    }
  }
  enrollinfo = enrollinfo.data;
  if(enrollinfo.enrollstatus != event.enrollstatus){
    /**enrollstatus 100040 记录状态 1:有效,9:删除 */
    var res = await db.collection('xlh_enrollinfo').doc(event.enrollid).update({
      data: {
        updatetime: new Date(),
        enrollstatus: event.enrollstatus
      }
    });
    if(event.enrollstatus=='9'){
      const cmd = db.command;
      res = await db.collection('xlh_enrollaction').doc(enrollinfo.actionid).update({
        data: {
          updatetime: new Date(),
          num:cmd.inc(-1)
        }
      });
    }
    return {
      updated: res.stats.updated,
      success: res.stats.updated==1?1:0,
      errMsg: res.stats.updated==1?"处理成功":"更新失败"
    };
  }
  return {
    errMsg:"处理成功"
  }
}