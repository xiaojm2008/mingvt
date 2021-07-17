var helperServ = require("../../lib/utils/helper.js");
var userServ = require("../../lib/services/user.js");
var commServ = require("../../lib/services/common.js");
var loginServ = require("../../lib/services/login.js");
var app = getApp()

Page({
  data: {
    focusSet: {},
    userInfo: {
      _id: null,
      nickname: '',
      gender: '0',
      avatarurl: '/images/ic_user.png',
      city: null,
      province: null,
      country: null,
      username: null,
      phone: null,
      birthdate: null,
      region: null,
      detail: null
    },
    dict: {
      "gender": ['男', '女']
    },
    fromindex: ''
  },

  onLoad: function (options) {
    this.fromindex = options.fromindex || '';
    var userInfo = helperServ.getUserInfo();
    if (!userInfo) {
      userServ.getUserInfo({}).then(res => {
        if (res.result && res.result.data && res.result.data.length > 0) {
          if(!res.result.data[0].gender){
            res.result.data[0].gender = '0';
          }
          this.setData({
            userInfo:res.result.data[0]
          });
        }
      });
    } else {
      if(!userInfo.gender){
        userInfo.gender = '0';
      }
      this.setData({
        userInfo:userInfo
      });
    }
  },
  chooseLocation: function () {
    helperServ.showLoading();
    app.chooseLocation((res) => {
      helperServ.hideLoading();
      console.log("chooseLocation", res);
      this.setData({
        "userInfo.detail": res.address || "",
        "userInfo.latitude": res.latitude || 0,
        "userInfo.longitude": res.longitude || 0
      });
    });
  },
  inputTogger: function (e) {
    var data = {};
    data[`userInfo.${e.currentTarget.id}`] = e.detail.value;
    this.setData(data);
  },
 
  showIndexListChoose:function(e){
    var catetype = e.currentTarget.dataset.catetype;
    if(!catetype){
      return;
    }

    if(catetype==='citycode' && (!this.data.userInfo.prov || !this.data.userInfo.prov.code)){
      helperServ.showToast({title:"请先选择省份",icon:'none'});
      var data = {};
      data[`focusSet.prov`] = 1;
      this.setData(data);
      return;
    }
    this.setData({
      focusSet:null
    });

    var currPage = helperServ.getCurrPage();
    var options = currPage.options;

    options.nextPageCallBack = (err, info) => {
      var data = {};
      data[`userInfo.${e.currentTarget.id}`] = {
        code:info.code,
        name:info.name
      }
      if(catetype==='provcode'){
        data[`userInfo.city`] = {
          code:"",
          name:""
        }
      }
      this.setData(data);
    }
    var p = "/pages/indexlist/indexlist?catetype="+catetype;
    helperServ.goToPage(catetype==='citycode'?(p+"&prov="+this.data.userInfo.prov.code):p);
  },
  choosePhoto: function () {
    var that = this;
    helperServ.chooseImage(function (imgUrl) {
      that.setData({
        'userInfo.avatarurl': imgUrl
      })
    });
  },

  returnPage: function () {
    if (this.fromindex) {
      helperServ.goToPage("/pages/index/index");
    } else {
      helperServ.goBack();
    }
  },
  isNull(val) {
    if(typeof val ==="string"){
      return (!val || !val.trim());
    }
    return !val;
  },
  check() {
    var user = this.data.userInfo,
      err = [];
    if (this.isNull(user.nickname)) {
      err.push("nickname");
      err.push("昵称不能为空");
    } else if (this.isNull(user.gender)) {
      err.push("gender");
      err.push("性别不能为空");
    } else if (this.isNull(user.phone)) {
      err.push("phone");
      err.push("手机号码不能为空");
    } else if (this.isNull(user.prov)) {
      err.push("prov");
      err.push("省份信息不能为空");
    } else if (this.isNull(user.city)) {
      err.push("city");
      err.push("城市信息不能为空");
    }

    if (err.length > 0) {
      var data = {};
      data[`focusSet.${err[0]}`] = 1;
      this.setData(data);

      helperServ.showToast({
        title: err[1],
        icon: "none"
      })
      return false;
    }

    return true;
  },
  saveUserInfo: function () {

    if (!this.check()) {
      return;
    }
    helperServ.showLoading();
    userServ.saveUserInfo({user:this.data.userInfo}).then(res => {
      helperServ.hideLoading();
      if (res.result.success) {
        this.data.userInfo.basedir=res.result.basedir;
        helperServ.setUserInfo(this.data.userInfo).then(res=>{
          console.log("setUserInfo",res);
        }).catch(err=>{
          console.log("setUserInfo",err);
        });
        helperServ.showModal({
          content: res.result.errMsg,
          success: (ok) => {
            if (ok.confirm) {
              this.returnPage();
            }
          }
        })
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        })
      }
    }).catch(err => {
      helperServ.showToast({
        title: err.errMsg || err.message,
        icon: "none"
      })
    });
  },

  getPhoneNumber: function (e) {
    //console.debug(e.detail.errMsg)
    //console.debug(e.detail.iv)
    //console.debug(e.detail.encryptedData)
    if (e && e.detail && e.detail.encryptedData) {
      helperServ.showLoading();
      loginServ.checkSession().then(res => {
        helperServ.hideLoading();
        if (res.is_login == '1') {
          this.decryptData(e.detail);
        } else {
          loginServ.login().then(res => {
            if (res.is_login == '1') {
              this.decryptData(e.detail);
              return;
            }
          })
        }
      });
    }
  },

  exitLogin: function () {

  },

  decryptData: function (params) {

    commServ.decryptWXData(params).then(res => {
      if (res.result && res.result.data) {
        this.setData({
          "userInfo.phone": res.result.data.phoneNumber,
          "userInfo.purephone": res.result.data.purePhoneNumber
        })
      } else if (res.result.is_login == '0') {
        helperServ.showModal({
          title: res.result.errMsg,
          content: '需要请您的确认是否进行微信服务器认证！',
          success: (res) => {
            if (res.confirm) {
              helperServ.showLoading();
              loginServ.login().then(res => {
                helperServ.hideLoading();
                if (res.is_login == '1') {
                  helperServ.showModal({
                    content: '登陆成功，请再次尝试'
                  });
                } else {
                  helperServ.goToPage("../login/login");
                  return;
                }
              });
            }
          }
        });
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg
      });
    });
  }
})