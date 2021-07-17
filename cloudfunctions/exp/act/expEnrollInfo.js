// 云函数入口文件
//const utils = require("/trader/comm/utils.js");
//const mySeq = require("/trader/comm/mySeq.js");
const xlsx = require('node-xlsx');
const getUserInfo = require("../comm/getUserInfo.js");
//const fs = require('fs');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
var toValues = function(obj, l) {
  if(!obj){
    return [];
  }
  var a = [];
  for (var k in obj) {
    if (l === 0) {
      break;
    }
    a.push(obj[k]);
    l&&l!=-1?--l:0;
  }
  return a;
}

// 云函数入口函数
module.exports = async (event, wxContext) => {
  //const wxContext = cloud.getWXContext();

  if (!event.actionid || !event.actionid.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var userInfo = await getUserInfo(wxContext.OPENID);
  if(!userInfo){
    return {
      regflag:0,
      errMsg:"用户信息不存在，请重新注册"
    }
  }
  if(!userInfo.basedir || !userInfo.basedir.trim()){
    return {
      regflag:0,
      //wxContext:wxContext,
      //userInfo:userInfo,
      errMsg:"用户信息配置信息不存在，请重新注册"
    }
  }
  var basedir = userInfo.basedir+"action/"+event.actionid
  

  var title = null;
  var form = await db.collection('xlh_enrollform')
  .doc(event.actionid)
  .field({enrollform:1}).get();

  form = form.data?form.data.enrollform:null;

  if(!form){
    return {
      errMsg:"表单数据异常"
    };
  }

  title = toValues(form).sort((a,b)=>a.seq-b.seq);//.map(v=>v.name);

  var enroll = await db.collection('xlh_enrollinfo').where({actionid:event.actionid}).get();
  enroll = enroll.data;
  if(!enroll){
    return {
      errMsg:"空数据异常"
    };
  }
  var all=[];
  all.push(title.map(v=>v.name));
  for(var i in enroll){ 
    var row = enroll[i],data = [];
    for(var j in title){
      var field = title[j],val = row[field.id];
      if(val&&typeof val == 'object'){
        val = val.toString();
      }
      data.push(val);
    }
    all.push(data);
  }

  var buffer = xlsx.build([{
    name:"sheets",
    data:all
  }])

  var path = basedir+"/"+event.actionid+".xlsx";

  var res = await cloud.uploadFile({
    cloudPath:path,
    fileContent:buffer
  })
  if(res.fileID){
    return {
      success:1,
      errMsg:"成功生成，点击可确认下载文件",
      fileID:res.fileID
    }
  }
  return res;
}