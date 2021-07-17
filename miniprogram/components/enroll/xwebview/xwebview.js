// miniprogram/components/enroll/xwebview/xwebview.js
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
      url: decodeURIComponent(options.url)
    });
  },

  onUrlLoad: function (e) {
    console.log(e.detail)
  },
  onUrlLoadErr: function (e) {
    console.log('Err', e.detail)
  }
})