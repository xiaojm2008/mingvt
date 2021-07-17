const helperServ = require("../../lib/utils/helper.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataid:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      dataid: options.dataid
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
  callPhone (e) {
    helperServ.callPhone(e.currentTarget.dataset.phone);
  },
  goToPage: function (e) {
    var page = e.currentTarget.dataset.page;
    helperServ.goToPage(page);
  }
})