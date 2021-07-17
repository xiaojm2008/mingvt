const V = require("../comm/validate.js").V;
const utils = require("../comm/utils.js");
const actFormat = require("./actFormat.js");
const cloud = require('wx-server-sdk');
const getuserInfo = require("../comm/getUser");
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
const DEBUG = false;

var isEmpty=(enrollform)=>{
  if(!enrollform){
    return true;
  }
  for(var k in enrollform){
    return false;
  }
  return true;
}

var checkTime = (action)=>{
  var now = new Date();
  if(action.enrollbegintime_dt>=action.enrollendtime_dt){
    return {
      errMsg:`报名开始时间${utils.dateFormat(action.enrollbegintime_dt,"yyyy-MM-dd hh:mm")}大于或等于报名结束时间${utils.dateFormat(action.enrollendtime_dt,"yyyy-MM-dd hh:mm")}`
    }
  } else if(action.enrollendtime_dt>action.actbegintime_dt){
    return {
      errMsg:`报名结束时间${utils.dateFormat(action.enrollendtime_dt,"yyyy-MM-dd hh:mm")}大于活动开始时间${utils.dateFormat(action.actbegintime_dt,"yyyy-MM-dd hh:mm")}`
    }
  } else if(action.actbegintime_dt>=action.actendtime_dt){
    return {
      errMsg:`活动开始时间${utils.dateFormat(action.actbegintime_dt,"yyyy-MM-dd hh:mm")}大于或等于活动结束时间${utils.dateFormat(action.actendtime_dt,"yyyy-MM-dd hh:mm")}`
    }
  }
  return null;
}
var initAction = (actioninfo)=>{
    var upd = Object.assign({},actioninfo);
    upd.settime && delete upd.settime;
    //upd.apprtime && delete upd.apprtime;
    //upd.time && delete upd.apprtime;
    return upd;
}
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var {
    actioninfo,
    enrollform
  } = event;

  var err = V(actFormat.act, actioninfo, 'baseinfo', actioninfo, actioninfo, null);
  if (err && err.errMsg) {
    return err;
  }
  err = V(actFormat.enroll, enrollform, 'baseinfo', enrollform, enrollform, null);
  if (err && err.errMsg) {
    return err;
  }

  err = checkTime(actioninfo);
  if(err){
    return err;
  }

  var userInfo = await getuserInfo(wxContext.OPENID);
  if (!userInfo) {
    return {
      errMsg: '用户没有注册'
    }
  }
  if (!actioninfo.actionid) {
    return {
      errMsg: "活动ID空"
    }
  }
  var res = await db.collection('xlh_enrollaction').doc(actioninfo.actionid).field({basedir:1}).get();
  if(!res.data){
    return {
      errMsg: '活动不存在'
    }
  }
  if(!res.data.basedir || !res.data.basedir.trim()){
    actioninfo.basedir = userInfo.basedir+"action/"+actioninfo.actionid+"/";
  }
  var _id = actioninfo._id;
  
  _id ? delete actioninfo._id : null;
  actioninfo.settime && delete actioninfo.settime;

  actioninfo.mod_userid = wxContext.OPENID;
  actioninfo.mod_username = userInfo.username || userInfo.nickname;
  actioninfo.mod_phone = userInfo.phone;
  actioninfo.mod_avatarurl = userInfo.avatarurl;
  //actioninfo.actbegintime_dt = new Date(actioninfo.actbegintime_dt);
  //actioninfo.actbegintime_dt1 = actioninfo.actbegintime_dt.toLocaleString();
  //actioninfo.actbegintime_dt2 = new Date(actioninfo.actbegintime_dt.toLocaleString()) ;
  actioninfo.updatetime = new Date();

  const transcation = DEBUG ? db : await db.startTransaction();

  res = await transcation.collection('xlh_enrollaction').doc(actioninfo.actionid).update({
    data: actioninfo
  });

  /**
   * 修改活动信息，需要更新已经报名了的人员信息
   */
  var enrollinfo = {};

  actioninfo.num = actioninfo.num ? actioninfo.num:0;
  
  //enrollinfo.actionstatus = actioninfo.status||'0';  /** 0:"启动",1:"暂停",9:"删除" */

  enrollinfo.launch_avatarurl = actioninfo.create_avatarurl; // 发起人
  enrollinfo.launch_name = actioninfo.create_username; // 发起人  
  enrollinfo.launch_id = actioninfo.create_userid; // 发起人  
  enrollinfo.launch_phone = actioninfo.create_phone; // 发起人

  enrollinfo.actionname = actioninfo.actionname;
  enrollinfo.actiontype = actioninfo.actiontype;
  enrollinfo.feetype = actioninfo.feetype;
  /**审批状态100038 0待审核，1pass 2dispass不通过*/
  enrollinfo.apprflag = actioninfo.apprflag?1:0;
  enrollinfo.siginflag = actioninfo.siginflag?1:0;
  enrollinfo.enrollbegintime = actioninfo.enrollbegintime_dt||null;
  enrollinfo.enrollendtime = actioninfo.enrollendtime_dt||null;
  enrollinfo.actbegintime = actioninfo.actbegintime_dt;
  enrollinfo.actendtime = actioninfo.actendtime_dt;
  enrollinfo.cover = typeof actioninfo.picpath==='object' ? (actioninfo.picpath[0].fileID||''):actioninfo.cover;
  enrollinfo.imginfo =  typeof actioninfo.imginfo==='object' ? (actioninfo.imginfo[0].fileID||''):actioninfo.imginfo;

  var updenroll = await db.collection('xlh_enrollinfo').where({actionid:actioninfo.actionid}).update({
    data: enrollinfo
  });

  if (isEmpty(enrollform)) {
    /*DEBUG?null:await transcation.commit();
    return {
      openid: wxContext.OPENID,
      dataid: actioninfo.actionid,
      updated: res.stats.updated,
      //actbdate:actioninfo.actbegintime_dt,
      //actbdate1:actioninfo.actbegintime,
      _id: _id,
      success: 1,
      errMsg: `修改成功,同步【${updenroll.stats.updated}】条记录`
    };*/
  
  }
 
  var _enrollform = {
    enrollform: enrollform,
    updatetime: new Date()
  }
  res = await transcation.collection('xlh_enrollform').doc(actioninfo.actionid).set({
    data: _enrollform
  });
  
  DEBUG?null:await transcation.commit();

  return {
    openid: wxContext.OPENID,
    dataid: actioninfo.actionid,
    updated: res.stats.updated,
    //actbdate:actioninfo.actbegintime_dt,
    //actbdate1:actioninfo.actbegintime,
    //updatetime:actioninfo.updatetime,
    success: 1,
    errMsg: `修改成功,同步【${updenroll.stats.updated}】条记录`
  };
}