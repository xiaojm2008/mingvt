var utils = require("../utils/rpc.js");
var helper = require("../utils/helper.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "user";

const SERV_LOGIN_SENDCODE = 'sendLoginCode';
const SERV_SAVEWXUSER = 'saveUserInfo';
//获取微信用户信息
var getUserWxInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: function(res) {
        utils.saveUserInfo(res.userInfo).then(res => {
          if (res.is_login == 0) {
            helper.setUserInfo(res.data.user_info);
            resolve(res.data.user_info);
          } else {
            reject("res.status != 0");
          }
        }).catch(err => {
          console.log('sendUserInfo fail', err);
          reject(err);
        });
      },
      fail: function(res) {
        console.log('requestUserWxInfo fail', res);
        reject(res);
      }
    })
  });

};
//保存微信用户信息到系统服务器
var saveUserInfo = (userInfo) => {
  return utils.requestEx(
    SERV_SAVEWXUSER, {
      nickname: userInfo['nickName'],
      gender: userInfo['gender'],
      city: userInfo['city'],
      province: userInfo['province'],
      country: userInfo['country'],
      avatarUrl: userInfo['avatarUrl']
    }
  );
};

//向服务器发送微信登录返回的code
var sendLoginCode = (code) => {
  return utils.requestEx(
    SERV_MANAGER, {
      code: code,
      transtype: TRANSTYPE,
      actionname: SERV_LOGIN_SENDCODE
    }
  );
};

var checkSession = () => {
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success: function(res) {
        resolve({
          is_login: '1',
          errMsg: res.errMsg || res.message
        });
      },
      fail: function(err) {
        resolve({
          is_login: '0',
          errMsg: err.errMsg || err.message
        });
      } //failure
    });
  });
}

var login = () => {
  return new Promise((resolve, reject) => {
    // session_key 已经失效，需要重新执行登录流程
    wx.login({
      success: function(res1) {
        if (res1.code) {
          sendLoginCode(res1.code).then(res2 => {
            var result = typeof res2.result == 'string' ? JSON.parse(res2.result) : res2.result;
            resolve({
              is_login: result.is_login,
              errMsg: result.errMsg
            });
            if (result.is_login != '1') {
              helper.showModal({
                content: result.errMsg || 'sendLoginCode未知错误'
              });
              return;
            }
            helper.setSessionKey(result.session_key);
          }).catch(err => {
            console.log('sendLoginCode fail', err);
            resolve({
              is_login: '0',
              errMsg: err.errMsg || err.message
            });
            helper.showModal({
              content: err.errMsg || err.message || 'sendLoginCode未知错误'
            })
            reject(err);
          });
        } else {
          console.log('获取用户登录态失败！', res1);
          helper.showModal({
            content: res1.errMsg || res1.message || '获取用户登录态失败！'
          })
          reject(err);
        }
      },
      fail: function(res) {
        console.log('login fail: ' + res.errMsg);
        helper.showModal({
          title: '异常提示',
          content: res.errMsg || res.message || '获取用户登录态失败！'
        })
        reject(res);
      }
    });
  });
}
/*
scope.address/scope.writePhotosAlbum
*/
var checkAuth = (authstr) => {
  authstr = authstr ? authstr : 'scope.userInfo';
  return new Promise((resolve, reject) => {
    //查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting[authstr]) {
          resolve({
            code: 1
          });
        } else {
          //未授权     
          wx.authorize({
            scope: authstr,
            success() {
              resolve({
                code: 1
              });
            },
            fail(err) {
              resolve({
                code: 0,
                errMsg:err.errMsg||err.message
              });
            },
            complete() {}
          });
        }
      },
      fail(res) {
        reject(res);
      }
    });
  });
};


module.exports = {
  checkSession: checkSession,
  checkAuth: checkAuth,
  saveUserInfo: saveUserInfo,
  login: login
}