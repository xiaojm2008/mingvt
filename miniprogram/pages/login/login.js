// pages/login/login.js
const loginServ = require("../../lib/services/login.js");
const helperServ = require("../../lib/utils/helper.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const userServ = require("../../lib/services/user.js");
Page({

  /**
   * 页面的初始数据
   */
  fromindex: false,
  data: {
    windowHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.fromindex = options.fromindex||'';
    pageServ.setWinHgh(this);
  },
  goMyCenter:function(){
    helperServ.goToPage("/pages/myCenter/myCenter?fromindex=" + this.fromindex,1);
  },
  /**
   * 
   * @param {*} userInfo 
   * 点击事件
   */
  onGotUserInfo: function(userInfo) {
    var user = userInfo.detail.userInfo;
    user = {
      nickname: user['nickName'],
      gender: user['gender'],
      country: user['country'],
      avatarurl: user['avatarUrl']
    };
    userServ.getUserInfo({}).then(res => {
      var userDB = res.result && res.result.data ? res.result.data[0] : null;
      if (!userDB) {
        //没有注册用户信息，保存到数据库，并本地缓存
        this.saveUserInfo(user);
      } else {
        //已经注册过，本地缓存
        user = Object.assign(userDB,user);
        this.setUserInfo(user);
      }
    });
  },

  setUserInfo:function(user){
    helperServ.setUserInfo(user).then(res => {
      /*if(1 == this.fromindex){
        helperServ.goBack();
      } else*/ if (!user.phone || !user.phone.trim() || !user.basedir || !user.basedir.trim()){
        this.goMyCenter();
      } else{
        helperServ.goBack();
      }
    }).catch(err => {
      helperServ.showToast({
        title: err.errMsg || err.message
      });
    });
  },

  saveUserInfo: function(user) {
    helperServ.showLoading({title:"验证中..."});
    userServ.saveUserInfo({authflag:1,user:user}).then(res => {
      helperServ.hideLoading();
      /**
    basedir:,
    openid:,
    success:,
    errMsg: ,
       */    
      if (!res.result.success) {
        wx.showToast({
          title: res.result.errMsg,
          icon:"none"
        });
        return;
      }
      user.basedir = res.result.basedir||'';
      user.openid = res.result.openid||'';
      this.setUserInfo(user);
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showToast({
        title: err.errMsg || err.message,
        icon:"none"
      });
    });
  }
})



/*
loginServ.checkAuth().then(res => {
  if (res.code == 0) {
    console.log("checkAuth OK");
    this.isAuth = true;
    //直接获取userInfo
    userServ.getUserInfo().then(res => {
      var user = res.result.data ? res.result.data[0] : null;
      if (!user) {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        wx.getUserInfo({
          success: function(res3) {
            _self.onGotUserInfo({
              "detail": {
                "userInfo": res3.userInfo
              }
            });
          }
        });
        return;
      }
      helperServ.setUserInfo(user).then(res2 => {
        helperServ.goBack();
      }).catch(err => {
        wx.showToast({
          title: `用户信息记录失败!:${JSON.stringify(err)}}`
        });
      });
    }).catch(err => {});
  } else {
    console.log("checkAuth NONE");
    this.isAuth = false;
  }
}).catch(err => {
  console.log("checkAuth ERR");
  this.isAuth = false;
})
*/