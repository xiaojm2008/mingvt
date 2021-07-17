// miniprogram/pages/manager/showGoods/showGoods.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsno:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      goodsno:options.goodsno
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})