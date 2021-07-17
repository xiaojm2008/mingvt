// miniprogram/pages/manager/shopdecor/shopdecor.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      shopid:options.shopid||'',
      themaid:options.themaid||''
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /*
  onPageScroll: function(e) {
    this._onPageScroll && this._onPageScroll(e);
  }*/
})