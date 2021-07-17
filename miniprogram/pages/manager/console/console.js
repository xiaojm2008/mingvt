
var loginServ = require("../../../lib/services/login.js");
var userServ2 = require("../../../lib/services/user.js");
var userServ = require("../../../lib/manager/user.js");
const commServ = require('../../../lib/manager/comm.js');
const menuServ = require('../../../lib/manager/menu.js');
const pageServ = require('../../../lib/utils/pagehelper.js');
var helperServ = require("../../../lib/utils/helper.js");
Page({

  /**
   * 页面的初始数据
   */
  userinfo:null,
  isAuth:false,
  data: {
    menu:null,
    delCount:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    helperServ.showLoading({title:'模块加载中...'})
    this.getUserMenu();
    var userInfo = helperServ.getUserInfo();
    this.setData({
      'userinfo.shopinfo': userInfo.shopinfo,
      'userinfo.avatarurl': userInfo.avatarurl,
      'userinfo.username': userInfo.username || userInfo.nickname,
      'userinfo.phone': userInfo.phone
    })
  },
  goToShop:function(){
    helperServ.goToPage('/pages/manager/listShop/listShop?frompage=console');
  },
  //manager/listShop中调用
  setSelectedShop:function(shop){
    this.setData({
      'userinfo.shopinfo': shop});
    helperServ.showLoading({ title: '模块重新加载中...' })
    this.getUserMenu();    
  },
  getMenuList:function(){
    menuServ.getMenuList({}).then(res => {
      helperServ.hideLoading();
      if (res.result.data) {
       
        res.result.data.menu.forEach((v, i) => {
          v.children.forEach(cv => {        
              cv.active = true;
              cv.status = '1';            
          })
        });
        this.setData({
          menu: res.result.data.menu
        })
        this.userinfo = res.result.data.userinfo;
        var userInfo = helperServ.getUserInfo();
        this.userinfo = Object.assign(userInfo, this.userinfo);
        helperServ.setUserInfo(this.userinfo);
      } else {
        helperServ.showModal({ content: res.result.errMsg });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({ content: err.errMsg });
    })
  },
  getUserMenu:function(){
    helperServ.showLoading({
      title: '模块加载中...'
    })
    menuServ.listMenu({}).then(res => {
      if (res.result.data) {
        userServ.getUserMenu({
        }).then(res2 => {
          helperServ.hideLoading();
          if (!res2.result.menus) {
            helperServ.showModal({
              content: res2.result.errMsg || '未知错误'
            });
            return;
          }
          this.userinfo = res2.result.userinfo;
          var userInfo = helperServ.getUserInfo()||{};
          this.userinfo = Object.assign(userInfo, this.userinfo);
          //console.log(this.userinfo);
          helperServ.setUserInfo(this.userinfo);
          /**
           * 100：{
           *  id:100,
           *  name:'父'
           *  children:{
           *    100000:{
           *       id:100000
           *       name:'子'           *       
           *    }
           *  }
           * }
           */
          var delCount={};
          res.result.data.forEach((v, i) => {
            if(!v){
              return;
            }
            delCount[v.id]=0;
            var c_m = res2.result.menus[v.id];
            if (!c_m || c_m.length == 0) {
              return;
            }
            var activenum = 0;
            
            v.children.forEach((cv,j,arr) => {
              if (!cv) {
                //v.children.splice(j,1);
                delCount[v.id]++;
                return;
              }
              if (c_m.children[cv.id]) {
                cv.active = true;
                cv.status = '1';
                //console.log('active#### ', cv);
                activenum++;
              } else {
                cv.active = false;
                cv.status = '0';
                //console.log('del**** ',cv);
                delCount[v.id]++;
                //v.children.splice(j, 1);
              }
            })
            if (activenum == 0){
              v.active = false;
              v.status = '0';
            } else {
              v.active = true;
              v.status = '1';
            }
          });
          this.setData({
            menu: res.result.data,
            delCount: delCount
          })
        }).catch(err => {
          helperServ.hideLoading();
          helperServ.showModal({
            content: err.errMsg || err.message || '未知错误'
          });
        });
      } else {
        helperServ.hideLoading();
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message || '未知错误'
      });
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var userInfo = helperServ.getUserInfo();
    if (!userInfo || userInfo == "") {
      this.isAuth = false;
      helperServ.goToPage("../../login/login");
      return;
    } else {
      this.isAuth = true;
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  goToPage: function (e) {
    if (this.isAuth) {
      pageServ.goToPage(e, this, this.userinfo);
    } else {
      helperServ.goToPage("../../login/login");
    }
  },
})