// pages/myCoupon/myCoupon.js
var couponServ = require("../../lib/services/coupon.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      tabIndex: "1"
    });
    this.getCoupons("1");
  },
  getCoupons:function(status){
    couponServ.getMyCouponList({ status: status}).then(res => {
      this.setData({
        coupons: res.result.data
      })
    }).catch(err => {

    });
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
  tabFun(e) {   
    this.setData({
      tabIndex: e.currentTarget.dataset.index
    });
    this.getCoupons(e.currentTarget.dataset.index)
  },
})