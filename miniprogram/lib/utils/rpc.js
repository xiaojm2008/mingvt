var helper = require("./helper.js");
const APP_ID = 'T404OMKoT3';
const BASE_URL = "";
const CONTENT_TYPE_URLENCODED = "application/x-www-form-urlencoded";
const CONTENT_TYPE_JSON = "application/json";
const SERV_MANAGER="trader";
var requestEx = (servname, params) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: servname,
      data: params
    }).then(res => {
      console.log(`[服务名] ${servname} [入参] ${JSON.stringify(params)} 调用成功:`, res);
      resolve(res);
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '调用失败',
      });
      console.error(`[服务名] ${servname} [入参] ${JSON.stringify(params)} 调用失败`, err);
      reject(err);
    });
  });
};
/**
 * var field = e.currentTarget.dataset.field;
rpc.sendRequest(field.value, { url: field.value}).then(res=>{
console.log(res);
const prompt = {
  type: "0",
  value: res.statusCode != 200?"失败":'可用'
};
cb(null, prompt);
}).catch(err=>{
console.log(err);
const prompt = {
  type: "0",
  value: JSON.stringify(err)
};
cb(null, prompt);
});
 * 
 */
var sendRequest = (url, param) => {
  return new Promise((resolve, reject) => {
    var data = param.data || {},
      header = param.header || {
        'content-type': CONTENT_TYPE_JSON
      };
    url = url || param.url;
    var requestUrl = BASE_URL + url;
    data._app_id = data.app_id || APP_ID;
    data.session_key = helper.getSessionKey();
    param.method = param.method || "GET";
    if (param.method && header["content-type"].indexOf(CONTENT_TYPE_URLENCODED) >= 0) {
      if (param.method == 'POST') {
        data = helper.encodeURIPostParam(data);
      }
    }

    if (!param.hideLoading) {
      helper.showToast({
        title: '请求中...',
        icon: 'loading'
      });
    }

    wx.request({
      url: requestUrl,
      data: data,
      method: param.method,
      header: header,
      success: function(res) {
        if (res.statusCode && res.statusCode != 200) {
          wx.hideToast();
          reject(res);
          return;
        }
        if (res.data.status) {
          if (res.data.status == 401 || res.data.status == 2) {
            //未登录
            helper.login();
            reject(res);
            return;
          }
          if (res.data.status != 0) {
            wx.hideToast();
            helper.showModal({
              content: '' + res.data.data
            });
            reject(res);
            return;
          }
        }
        //typeof param.success == 'function' && param.success(res.data);
        resolve(res);
      },
      fail: function(res) {
        helper.showModal({
          content: '请求失败 ' + res.errMsg
        })
        //typeof param.fail == 'function' && param.fail(res.data);
        reject(res);
      },
      complete: function(res) {
        // that.hideToast();
        //typeof param.complete == 'function' && param.complete(res.data);
        console.log(`[服务]${url} complete 返回`, res);
      }
    });
  });
};

var doAction = (params, action, manager)=>{
  if(!action){
    helper.showModal({
      content: "action null Exception!"
    });
    return;
  }
  var start = action.indexOf(".");
  if (start <= 0) {
    helper.showModal({
      content: action + ":定义错误"
    });
    return;
  }
  params.transtype = action.substring(0, start);
  params.actionname = action.substr(start + 1);
  return requestEx(manager || SERV_MANAGER, params);
}

module.exports = {
  requestEx: requestEx,
  sendRequest: sendRequest,
  doAction: doAction
}