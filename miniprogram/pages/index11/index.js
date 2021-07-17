// miniprogram/pages/index.js
var app = getApp();
var helperServ = require("../../lib/utils/helper.js");
var couponServ = require("../../lib/services/coupon.js");
var commomServ = require("../../lib/services/common.js");
var goodsServ = require("../../lib/services/goods.js");
Page({

  /**
   * 页面的初始数据
   */
  hotSellArr: [],
  batch_time: -1,
  data: {
    //alpha: [1, 1, 1],
    windowHeight: 0,
    loadFinish: false,
    loadTimer:null,
    isLoading: true,
    loadGif: true,
    announcementText: "新店开业，欢迎贵客进店参观，选购，优品多多，优惠多多！",
    carousel: [],
    coupons: [],
    toprank: [],
    hotsell: []
  },
  loadFunc: goodsServ.getGoodsList,
  loadFuncParams:{hotsell:'1'},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.scene) {
      const scene = decodeURIComponent(options.scene);
      console.log(`get scan string :${scene}`);
      return;
    }
    this.goodsList = new goodsList(this);
    this.refreshMore();
    //this.loadMore();
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
    var self = this;
    wx.getSystemInfo({
      success: function(res) {
        var windowHeight = res.windowHeight;
        self.setData({
          windowHeight: windowHeight
        })
      }
    });
    //this.showLoading();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log("onPullDownRefresh");
    //wx.showNavigationBarLoading(); //在标题栏中显示加载
    //this.refreshMore();
    //wx.hideNavigationBarLoading() //完成停止加载
    //wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log("onReachBottom");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  
  refreshMore:function(){
    goodsServ.getCarousel({
      posid: 1
    }).then(res => {
      console.log("success-data=", res.result.data);
      this.setData({
        carousel: res.result.data
      })
    }).catch(err => {
      //todao
    });
    couponServ.getCouponList({}).then(res => {
      this.setData({
        coupons: res.result.data
      })
    }).catch(err => {

    });
    goodsServ.getTopRankList().then(res => {
      this.setData({
        toprank: res.result.data
      })
    }).catch(err => { });
  },
  tapToCouponHandler:function(e){
    let _id = e.currentTarget.dataset.id;
    if(!helperServ.getUserInfo()){
      helperServ.goToPage("../login/login");
      return;
    }
    if (_id) {
      wx.showLoading({
        title: '请稍等...',
      })
      couponServ.takeCoupon({_id}).then(res=>{
        wx.hideLoading();
        if(res.result._id){
          wx.showModal({
            title: '',
            content: '优惠券领取成功！',
          });
          couponServ.getCouponList({}).then(res => {
            this.setData({
              coupons: res.result.data
            })
          });
        } else {
          wx.showModal({
            title: '',
            content: res.result.errMsg,
          });
        }
      });
    }
  }
})