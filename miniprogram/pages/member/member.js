// pages/member/member.js
var helperServ = require("../../lib/utils/helper.js");
var loginServ = require("../../lib/services/login.js");
var userServ = require("../../lib/services/user.js");
Page({

  isAuth: false,
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    userBenefit:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var userInfo = helperServ.getUserInfo();
    if (!userInfo || userInfo == "") {
      this.isAuth = false;
      helperServ.goToPage("../login/login");
      return;
    } else {
      this.isAuth = true;
    }
    var data = {
      'userInfo.nickname': userInfo.nickname,
      'userInfo.gender': userInfo.gender,
      'userInfo.avatarurl': userInfo.avatarurl,
      'userInfo.phone': userInfo.phone || ''
    };
    this.setData(data);

    userServ.getUserBenefit({}).then(res=>{
      this.setData({
        userBenefit:res.result.data||null
      })
    })

    userServ.getMemMenu({}).then(res=>{
      if(res.result.data && res.result.data.length > 0){
        var orderidx = res.result.data.findIndex((v,i,o)=>v.id==100);
        if(orderidx>=0){
          this.data.ordermenu =  res.result.data.splice(orderidx,1);
        } else {       
          this.data.ordermenu = null;
        }
        this.data.memmenu = res.result.data;
        this.setData({
          ordermenu:this.data.ordermenu,
          memmenu:this.data.memmenu
        })
      }
    }).catch(err=>{
      helperServ.showToast({title:err.errMsg||err.message});
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  checkAuth: function() {
    return loginServ.checkAuth();
  },
  goToOrder: function(e) {
    var status = e.currentTarget.dataset.status;
    if (this.isAuth) {
      helperServ.goToPage(`../myOrder/myOrder?status=${status||''}`);
    } else {
      helperServ.goToPage("../login/login");
    }
  },
  goToPage: function(e) {
    var page = e.currentTarget.dataset.page;
    if(page[0]==="/"){
      helperServ.goToPage(page);
      return;
    }
    var params = e.currentTarget.dataset.params;
    params = !!params ? "?"+params :"";
    if (this.isAuth) {
      helperServ.goToPage(page == "myTeam" ? `../${page}/${page}?scene='join=A&code=2250'` : `../${page}/${page}${params}`);
    } else {
      helperServ.goToPage("../login/login");
    }
  },
  /*
  goToConsole:function(e){
    if (this.isAuth) {
      helperServ.goToPage('../manager/console/console');
    } else {
      helperServ.goToPage("../login/login");
    }
  }*/
})