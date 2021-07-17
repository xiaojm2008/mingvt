const mixed = require("../services/mixed.js");
//const constants = require("../comm/constants.js");
const helper = require("./helper");
const CACHE_DICT_KEY = "CACHE_DICT_KEY";
const CACHE_FIELDTEMP_KEY = "CACHE_FIELDTEMP_KEY";
const CACHE_CLIENTCFG_KEY = "CACHE_CLIENTCFG_KEY";
const CACHE_CATEGORY_KEY = "CACHE_CATEGORY_KEY";

var reloadPage = function() {
  var pages = getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  var options = currentPage.options
  currentPage.onLoad(options);
  console.log('---------------reloadPage----------------',currentPage.route);
}
var reloadPrePage = function () {
  var pages = getCurrentPages() //获取加载的页面
  var prePage = pages[pages.length - 2] //获取当前页面的对象
  var options = prePage.options
  prePage.onLoad(options);
  console.log('---------------reloadPrePage----------------', prePage.route);
}
var doResult = function (res, silent) {
  if(silent){
    return;
  }
  if (res.success ) {
    helper.showModal({
      content: '网络延时，请点击确认刷新...',
      success(res) {
        if (res.confirm) {
          reloadPage();
        } else {
          reloadPage();
        }
      }
    });
  } else {
    helper.showModal({
      content: res.errMsg
    });
  }
}
var dictAdd = function () {

}
var dictDel = function () {

}
var dictCache = function() {
  return new Promise((resolve, reject) => {
    mixed.dict({}).then((res) => {
      helper.setStorageSync(CACHE_DICT_KEY, res.result.data && res.result.data.length > 0 ? res.result.data[0] : null);
      //console.log("dictCache OK");
      resolve({
        data: res.result.data && res.result.data.length > 0 ? res.result.data[0] : null,
        success: true
      });
    }).catch(err => {
      reject({
        success: false,
        errMsg: err.errMsg
      });
    });
  })
}
//参考validate.js直接require了
var dict = function(silent) {
  var cache = helper.getStorageSync(CACHE_DICT_KEY);
  if (!cache) {
    //console.log('----------------dict cache is null,retry------------')
    dictCache().then(res => {
      doResult(res, silent);
    });
    return null;
  }
  //console.log("dict cache", cache)
  return cache;
}
var fieldTemplateDel = function (params,cb){
  var item = params.field;
  mixed.defaultFieldDel(params).then(res=>{
    if (res.result && res.result.stats.updated >= 0 ){
      helper.showModal({ content: "字段删除成功"});
      var cache = fieldTemplate(params);
      if (cache[item.tempid][item.fieldid]) {
        delete cache[item.tempid][item.fieldid];
        helper.setStorageSync(CACHE_FIELDTEMP_KEY + params.temptype, cache);
        if (typeof cb == 'function'){
          cb(null,res);
        }
      }
    }
    //console.log(`fieldTemplateDel ${item.fieldid}`,item,res);
  }).catch(err=>{
    //console.log(`fieldTemplateDel ${item.fieldid}`, item, err);
    if (typeof cb == 'function') {
      cb(err);
    }
  });
}
//{temptype: this.data.temptype, category: category,field:field}
var fieldTemplateAdd = function (params,cb){
  var item = params.field;
  helper.showLoading();
  var cache = fieldTemplate(params);
  if(cache.length == 0){
    return;
  }
  if (!cache[item.tempid]){
    cache[item.tempid] = {};
  }
  cache[item.tempid][item.id] = item;
  helper.setStorageSync(CACHE_FIELDTEMP_KEY + params.temptype, cache);
  mixed.defaultFieldAdd(params).then(res=>{
    helper.hideLoading();
    if(res.result.success){
      if (typeof cb == 'function') {
        cb(null, res);
      }
      helper.showModal({content:res.result.errMsg});
    } else {
      if (typeof cb == 'function') {
        cb(res);
      }
      helper.showModal({ content: res.result.errMsg||res.errMsg});
    }
  }).catch(err=>{
    helper.hideLoading();
    helper.showModal({ content: err.errMsg || err.message });
    if (typeof cb == 'function') {
      cb(err);
    }
  });
}
//{temptype: this.data.temptype, category: category}
var fieldTemplateCache = function (params) {
  return new Promise((resolve, reject) => {
    mixed.defaultField(params).then((res) => {
      helper.setStorageSync(CACHE_FIELDTEMP_KEY + params.temptype, res.result);
      //console.log("fieldTemplateCache OK");
      resolve({
        success: true,
        data: res.result
      });
    });
  }).catch(err => {
    reject({
      success: false,
      errMsg: err.errMsg
    });
  })
}
//{temptype: this.data.temptype, category: category,field:field}
var fieldTemplate = function(params,cb) {
  var cache = helper.getStorageSync(CACHE_FIELDTEMP_KEY + params.temptype);
  if (!cache) {
    //console.log('----------------fieldTemplate cache is null,retry------------')
    fieldTemplateCache(params).then(res => {
      doResult(res,true);
      cb ? cb(null,res.data):null;
    }).catch(err=>{
      cb ? cb(err.errMsg,null) : null;
    });
    return [];
  }
  cb ? cb(null,cache) : null;
  return cache;
}
var categoryCache = function (params) {
  return new Promise((resolve, reject) => {
    mixed.getCategory(params).then((res) => {
      if (!res.result.data){
        reject({
          success: false,
          errMsg: res.result.errMsg
        });
        return;
      }
      res = res.result.data.length > 0 ? res.result.data[0].items : null;
      helper.setStorageSync(CACHE_CATEGORY_KEY + params.catetype, res);
      //console.log("categoryCache OK");
      resolve({
        success: true,
        data: res
      });
    });
  }).catch(err => {
    console.error("categoryCache:",err);
    helper.showModal({content:err.message||err.errMsg});
  })
}
var getCategory = function(params){
  var cache = helper.getStorageSync(CACHE_CATEGORY_KEY + params.catetype);
  if (!cache) {
    //console.log('----------------getCategory cache is null,retry------------')
    categoryCache(params).then(res => {
      doResult(res);
    });
    return [];
  }
  return cache;
}
var clientCfgAdd = function () {

}
var clientCfgDel = function(){

}
var clientCfgCache = function() {
  return new Promise((resolve, reject) => {
    mixed.clientCfg({}).then((res) => {
      helper.setStorageSync(CACHE_CLIENTCFG_KEY, res.result.data && res.result.data.length > 0 ? res.result.data[0] : null);
      //console.log("clientCfgCache OK");
      resolve({
        success: true
      });
    });
  }).catch(err => {
    reject({
      success: false,
      errMsg: err.errMsg
    });
  })
}
var clientCfg = function() {
  var cache= helper.getStorageSync(CACHE_CLIENTCFG_KEY);
  if (!cache) {
    //console.log('----------------clientCfg cache is null,retry------------')
    clientCfgCache().then(res => {
      doResult(res);
    });
    return {};
  }
  return cache;
}

var mixedCache = function() {
  return new Promise((resolve, reject) => {
    mixed.mixed({}).then((res) => {
      helper.setStorageSync(CACHE_DICT_KEY, res.result.dict);
      //helper.setStorageSync(CACHE_FIELDTEMP_KEY, res.result.fieldtemplate);
      helper.setStorageSync(CACHE_CLIENTCFG_KEY, res.result.clientcfg);
      resolve(res.result);
      //console.log("mixedCache OK");
    });
  }).catch(err => {
    reject({
      success: false,
      errMsg: err.errMsg
    });
  })
}
var _getDict = function (key, callback) {
  var SYS_DICT = null;
  dictCache({}).then(res => {
    if (res.data) {
      SYS_DICT = res.data;
      if (key && key.length > 0) {
        var d = {};
        for (var k = 0; k < key.length; k++) {
          d[`${key[k]}`] = SYS_DICT[key[k]];
        }
        callback(null, d);
      } else {
        callback(null, SYS_DICT);
      }
    } else {
      callback('获取字典失败', null);
    }
  }).catch(err => { callback(err.errMsg) });
}
var getDict = function (key, callback) {
  //var SYS_DICT = getStorageSync("CACHE_DICT_KEY");
  var SYS_DICT = dict();
  if (!SYS_DICT) {
    callback('null dict', null);
    return null;
  } else {
    //console.log('get dict from storage');
    if (key && key.length > 0) {
      var d = {};
      for (var k = 0; k < key.length; k++) {
        if (!SYS_DICT[key[k]]) {
          _getDict(key, callback);
          return null;
        } else {
          d[`${key[k]}`] = SYS_DICT[key[k]];
        }
      };
      callback(null, d);
      return d;
    } else {
      callback(null, SYS_DICT);
      return SYS_DICT;
    }
  }
}
var dictTrs = function (dict, code, def) {
  //console.log('code=' + code);
  if (code === undefined || code === '') { return def }
  if (!dict || dict.length == 0) return '';
  if (code === null) {
    code = 0;
  }
  //var id = parseInt(code);  
  //return dict[id].name || dict[id].cname.trim();
  for (var i = 0; i < dict.length; i++) {
    if (dict[i].code == code) {
      //console.log('code=' + code + ":name=" + dict[i].name || dict[i].cname);
      return code + "-" + (dict[i].name || dict[i].cname.trim());
    }
  }
  if (i == dict.length) {
    //console.log('code=' + code + ":name=[-]");
    return code + "--";
  }
}
module.exports = {
  dictTrs: dictTrs,
  getDict: getDict,
  reloadPage:reloadPage,
  reloadPrePage: reloadPrePage,
  dict: dict,
  dictCache,dictCache,
  dictAdd,dictAdd,
  dictDel, dictDel,
  clientCfg: clientCfg,
  clientCfgCache: clientCfgCache,
  clientCfgAdd: clientCfgAdd,
  clientCfgDel: clientCfgDel,
  fieldTemplate: fieldTemplate,
  fieldTemplateCache: fieldTemplateCache,
  fieldTemplateAdd: fieldTemplateAdd,
  fieldTemplateDel: fieldTemplateDel,
  mixedCache: mixedCache,
  categoryCache: categoryCache,
  getCategory: getCategory
}