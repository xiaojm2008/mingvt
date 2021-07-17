// pages/myCard/myCard.js
var userServ = require("../../lib/services/user.js");
var helperServ = require("../../lib/utils/helper.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardWidth:0,
    cardHeight:0,
    userCardWidth:0,
    moreInfoWidth:0,
    userInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var self = this;
    wx.getSystemInfo({
      success: function(res) {
        var cardWidth = res.windowWidth -10;
        var cardHeight = res.windowHeight;
        self.setData({
          cardWidth: cardWidth,
          cardHeight: 5 * cardWidth/9,
          userCardWidth: cardWidth/3,
          moreInfoWidth: cardWidth - cardWidth / 3
        })
      },
    });
    var userInfo = helperServ.getUserInfo();
    this.setData({
      userInfo: userInfo
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  }
})