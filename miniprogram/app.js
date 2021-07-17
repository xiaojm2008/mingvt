/*
须知少日拿云志，曾许人间第一流
*/
var helperServ = require("lib/utils/helper.js");
var userServ = require("lib/services/user.js");
var cache = require("lib/utils/cache.js")
/*
if(typeof Object.values =="undefined"){
  Object.prototype.values = (args)=>{
    return Object.keys(args).map(key=>args[key]);
  }
}*/

App({
  onLaunch: function() {
    console.log("App Launch");
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    /*console.debug("****获取用户注册与登陆信息****")
    userServ.getUserInfo({}).then(res=>{
      if(res.result.data && res.result.data===1){
        helperServ.setUserInfo(res.result.data[0]);
      } else if (res.result.data){
        if (res.result.data >1){
          helperServ.showModal({content:"系统异常"})
          return;
        }
      }
    }).catch(err=>{
      helperServ.showModal({ content:err.errMsg||err.message })
    });*/

    this.getSystemInfo();   

    cache.mixedCache().then(res => {
      console.debug('mixedCache return ', res.clientcfg);
      this.globalData.clientcfg = res.clientcfg;
      if (res.clientcfg && res.clientcfg.LOCATE){
        this.getLocalion();
      }
    });

    cache.categoryCache({
      catetype: '1'
    }).then(res => {
      console.debug('categoryCache catetype=1 return ');
    });

    cache.categoryCache({
      catetype: '2'
    }).then(res => {
      console.debug('categoryCache catetype=2  return ');
    });

    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.debug("onCheckForUpdate:" + res)
    })

    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })

    })

    updateManager.onUpdateFailed(function() {
      // 新的版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    })
  },

  saveLocation: function() {
    // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        //console.log("getLocation success");
        userServ.saveLocation({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracy: res.accuracy,
          speed: res.speed,
          altitude: res.altitude,
          verticalAccuracy: res.verticalAccuracy,
          horizontalAccuracy: res.horizontalAccuracy
        }).then(res => {
          //console.log("save success");
        }).catch(err => {
          //console.log("save success", err);
        });
      }
    });
  },
  getLocalion: function() {
    var self = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              self.saveLocation();
            }
          });
        } /*authorize */
        else {
          //console.log("don't authorize");
          self.saveLocation();
        }
      }
    })
  },

  chooseLocation: function(cb) {
    var self = this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              wx.chooseLocation({
                success: function(res) {
                  /*name	string	位置名称
address	string	详细地址
latitude	string	纬度，浮点数，范围为-90~90，负数表示南纬。使用 gcj02 国测局坐标系
longitude	 */
                  if (!res.address) {
                    /*helperServ.showToast({
                      title: '地址选择失败'
                    });*/
                  }
                  cb(res);
                },
                fail: function(err) {
                  helperServ.showToast({
                    title: err.errMsg
                  });
                }
              });
            }
          });
        } /*authorize */
        else {
          //console.log("don't authorize");
          wx.chooseLocation({
            success: function(res) {
              if (!res.address) {
                helperServ.showToast({
                  title: '地址选择失败'
                });
              }
              cb(res);
            },
            fail: function(err) {
              helperServ.showToast({
                title: err.errMsg
              });
            }
          });
        }
      }
    })
  },
  tabBarHeightSize: function() {
    // px转换到rpx的比例
    //let pxToRpxScale = 750 / systemInfo.windowWidth;
    // 状态栏的高度 systemInfo.statusBarHeight;
    // 导航栏的高度 navigationHeight = 44;
    // window的宽度 systemInfo.windowWidth;
    // window的高度 systemInfo.windowHeight;
    // 底部tabBar的高度
    this.systemInfo.tabBarHeight = this.systemInfo.screenHeight - this.systemInfo.statusBarHeight - 44 - this.systemInfo.windowHeight;
  },

  getSystemInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        this.systemInfo = res;
        this.tabBarHeightSize();
        console.log(this.systemInfo);
      }
    });
  },
  getClientCfg:function(){
    return this.globalData.clientcfg;
  },
  /**
   * ios,android,devtools
   */
  getPf:function(){
    return this.systemInfo.platform;
  },
  getWinHeight: function() {
    return this.systemInfo.windowHeight + this.systemInfo.tabBarHeight;
  },
  getWinWidth: function () {
    return this.systemInfo.windowWidth;
  },
  getPx:function(rpx){
    return rpx / 750 * this.systemInfo.windowWidth;
  },
  /**
   * key:storage
   */
  getEnv:function(key){
    if(key){
      return this.globalData.env[key];
    }
    return this.globalData.env;
  },
  setEnv:function(key,val){
    this.globalData.env[key] =val;
  },
  getMUser: function() {
    var userinfo = helperServ.getUserInfo();
    if (!userinfo.shopinfo || !userinfo.shopinfo.basedir) {
      helperServ.showModal({
        content: "用户参数异常，请修改重新选择并且修改店铺信息",
        success: (res) => {
          if (res.confirm) {
            helperServ.goToPage('/pages/myShop/myShop?frompage=addGoods');
          }
        }
      });
      return;
    }
    return userinfo;
  },
  setAppCache: function(key, value) {
    this.globalData.appCache[key] = value;
  },
  getAppCache: function(key) {
    return this.globalData.appCache[key];
  },
  setUserInfo: function(user) {
    this.globalData.userInfo = user;
  },
  getUserInfo: function(user) {
    return this.globalData.userInfo;
  },
  setShopid:function(shopid){
    this.globalData.shopid = shopid;
  },
  getShopid:function(){
    return this.globalData.shopid;
  },
  setShopInfo:function(shopinfo){
    this.globalData.shopinfo = shopinfo;
  },
  getShopInfo:function(){
    return this.globalData.shopinfo;
  },
  globalData: {
    shopid:"SHP1581604412240e4762b43bdb2f538",
    pageContext: null,
    appCache: {},
    MAX_PAGE_LIMIT: 4,
    homepageRouter: 'index',
    userInfo: null,
    sessionKey: '',
    notBindXcxAppId: false,
    locationInfo: {
      latitude: '',
      longitude: '',
      address: ''
    },
    env:{
      database:'xiaovt-818we',
      storage: 'xiaovt-818we',
      functions:'xiaovt-818we'
    },
    urlLocationId: ''
  }
})