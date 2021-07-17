const mySeq = require("../comm/mySeq.js");
const V = require("../comm/validate.js").V;
const utils = require("../comm/utils.js");
const actFormat = require("./actFormat.js");
const getuserInfo = require("../comm/getUser.js");

const cloud = require('wx-server-sdk');
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
  /*if(action.enrollbegintime_dt < now){
    return {
      errMsg:`报名开始时间${utils.dateFormat(action.enrollbegintime_dt)} 小于当前系统时间${now}`
    }
  } else*/ if(action.enrollbegintime_dt>=action.enrollendtime_dt){
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
      regflag:0,
      errMsg: '用户没有注册'
    }
  }
  var res = null;
  const transcation = DEBUG ? db : await db.startTransaction();

  actioninfo.actionid = mySeq.mySeq32("ACT"); //32 char
 
  res = await transcation.collection('xlh_enrollaction').doc(actioninfo.actionid).get();

  if (res.data) {
    return {
      errMsg: '活动信息已经存在'
    }
  }
  //"P350000/350700/ounQF5gNI1fojHjR6JnyBekJpowQ/action/ACT00000000/
  actioninfo.basedir = userInfo.basedir+"action/"+actioninfo.actionid+"/";

  actioninfo.create_userid = wxContext.OPENID;
  actioninfo.create_username = userInfo.username || userInfo.nickname;
  actioninfo.create_phone = userInfo.phone;
  actioninfo.create_avatarurl = userInfo.avatarurl;
  actioninfo.status = "0";//100039 0:"启动",1:"暂停",2:"结束",9:"删除"
  actioninfo.regtime = new Date(),
    actioninfo.settime = new Date(),
    actioninfo.updatetime = new Date();//db.serverDate();

  if (isEmpty(enrollform)) {
    actioninfo.formflag = "0";
  } else {
    actioninfo.formflag='1';
  }

  res = await transcation.collection('xlh_enrollaction').doc(actioninfo.actionid).set({
    data: actioninfo
  });

  if(actioninfo.formflag=='0'){
    enrollform = {
      "nickname": {
        "label": true,
        "id": "nickname",
        "name": "昵称",
        "type": "0",
        "seq":0,
        "required": "R",
        "tempid":0,
        "length": 200
      },
      "username": {
        "label": true,
        "id": "username",
        "name": "姓名",
        "type": "0",
        "seq":1,
        "required": "O",
        "tempid":0,
        "length": 200
      },
      "gender": {
        "label": true,
        "id": "gender",
        "name": "性别",
        "type": "3",
        "seq":2,
        "required": "R",
        "dict": "dict",
        "tempid":0,
        "dictlist": 100015
      },
      "phone": {
        "label": true,
        "id": "phone",
        "name": "手机号码",
        "type": "8",
        "seq":3,
        "required": "R",
        "tempid":0,
        "fix": "1",
        "length": 11
      }
    }
  }

  var _enrollform = {
    formid: actioninfo.actionid,
    enrollform: enrollform,
    settime: new Date()
  }
  res = await transcation.collection('xlh_enrollform').doc(_enrollform.formid).get();
  if (res.data) {
    DEBUG?null:await transcation.rollback();
    return {
      errMsg: '活动表单已经存在'
    }
  }

  res = await transcation.collection('xlh_enrollform').doc(_enrollform.formid).set({
    data: _enrollform
  });
  DEBUG?null:await transcation.commit();
  return {
    success:1,
    openid: wxContext.OPENID,
    _id: res._id,
    dataid: actioninfo.actionid,
    errMsg: '新建成功'
  };  
}