const constants = require("../comm/constants.js");
const helperServ = require("./helper.js");
var app = getApp();
var toEnrollArr=function (enrolllinfo) {
  var tmp = Object.values(enrolllinfo);
  tmp.sort((a, b) => {
    return a.seq - b.seq;
  });
  return tmp;
}
var restoreAction = function(dataid,cb) {
  const prompt = `您上次的修改还未保存，是否继续`,
    prompt1 = `您上次修改的另外一个项目还未保存，是否继续`,
    prompt3="是否继续您上次未保存信息的修改" ;
  var complete, actioninfo, delta, enroll, 
    compelte_key, actioninfo_key, html_key, delta_key, enroll_key;
  if (dataid) {
    actioninfo_key = constants.APPCACHE_ACTION_INFO2;
    html_key = constants.APPCACHE_EDITOR_HTML2;
    delta_key = constants.APPCACHE_EDITOR_CONTENTS2;
    enroll_key = constants.APPCACHE_ENROLL_INFO2;
    compelte_key = constants.APPCACHE_ACTION_COMPLETE_FLAG2;

  } else {
    actioninfo_key = constants.APPCACHE_ACTION_INFO;
    html_key = constants.APPCACHE_EDITOR_HTML;
    delta_key = constants.APPCACHE_EDITOR_CONTENTS;
    enroll_key = constants.APPCACHE_ENROLL_INFO;
    compelte_key = constants.APPCACHE_ACTION_COMPLETE_FLAG;
  }
  complete = app.getAppCache(compelte_key);
  actioninfo = app.getAppCache(actioninfo_key);
  delta = app.getAppCache(delta_key);
  enroll = app.getAppCache(enroll_key);
  console.log(`compelte_key:${compelte_key} complete:${JSON.stringify(complete)} `);
  if (typeof complete == 'boolean' && complete){
    //clear cache   
    app.setAppCache(actioninfo_key, null);
    app.setAppCache(delta_key, null);
    app.setAppCache(html_key, null);
    app.setAppCache(enroll_key, null);
    app.setAppCache(compelte_key, null);
    cb(null, 0, dataid);
    return;
  } else  if (complete && !complete.save && (actioninfo || delta||enroll)) {
    helperServ.showModal({
      content: complete.dataid && complete.dataid == dataid ? prompt : (complete.dataid ? prompt1 : prompt3), success: (res) => {
        if (res.confirm) {
          cb(null, 1,dataid);
        } else {
          //clear cache   
          app.setAppCache(actioninfo_key, null);
          app.setAppCache(delta_key, null);
          app.setAppCache(html_key, null);
          app.setAppCache(enroll_key, null);
          app.setAppCache(compelte_key, null);
          cb(null, 0, dataid);
        }
      }
    });
  } else {   
    cb(null, 0, dataid);
  }
}
var setActionBaseInfo = function (dataid,data){
  dataid ? app.setAppCache(constants.APPCACHE_ACTION_INFO2, data) : app.setAppCache(constants.APPCACHE_ACTION_INFO, data);
}
var setEditorDelta = function (dataid,data) {
  dataid ? app.setAppCache(constants.APPCACHE_EDITOR_CONTENTS2, data) : app.setAppCache(constants.APPCACHE_EDITOR_CONTENTS, data);
}
var setEditorHtml = function (dataid, data) {
  dataid ? app.setAppCache(constants.APPCACHE_EDITOR_HTML2,data) : app.setAppCache(constants.APPCACHE_EDITOR_HTML,data);
}
var setEnrollInfo = function (dataid, data){
  dataid ? app.setAppCache(constants.APPCACHE_ENROLL_INFO2, data) : app.setAppCache(constants.APPCACHE_ENROLL_INFO, data);
}

var getActionBaseInfo = function (dataid) {
  return dataid ? app.getAppCache(constants.APPCACHE_ACTION_INFO2) : app.getAppCache(constants.APPCACHE_ACTION_INFO);
}
var getEditorDelta = function (dataid) {
  return dataid ? app.getAppCache(constants.APPCACHE_EDITOR_CONTENTS2) : app.getAppCache(constants.APPCACHE_EDITOR_CONTENTS);
}
var getEditorHtml = function (dataid) {
  return dataid ? app.getAppCache(constants.APPCACHE_EDITOR_HTML2) : app.getAppCache(constants.APPCACHE_EDITOR_HTML);
}
var getEnrollInfo = function (dataid) {
  return dataid ? app.getAppCache(constants.APPCACHE_ENROLL_INFO2) : app.getAppCache(constants.APPCACHE_ENROLL_INFO);
}
var setActionComplete = function(dataid,save){
  dataid ? app.setAppCache(constants.APPCACHE_ACTION_COMPLETE_FLAG2, { dataid: dataid, save: save }) : app.setAppCache(constants.APPCACHE_ACTION_COMPLETE_FLAG, save);
}
module.exports={
  toEnrollArr: toEnrollArr,
  restoreAction:restoreAction,
  setActionComplete: setActionComplete,
  setActionBaseInfo:setActionBaseInfo,
  setEditorDelta: setEditorDelta,
  setEditorHtml: setEditorHtml,
  setEnrollInfo:setEnrollInfo,
  getActionBaseInfo: getActionBaseInfo,
  getEditorDelta: getEditorDelta,
  getEditorHtml: getEditorHtml,
  getEnrollInfo: getEnrollInfo
}