const shopServ = require('../../../lib/services/shop.js');
const helperServ = require('../../../lib/utils/helper.js');
const pageServ = require('../../../lib/utils/pagehelper.js');
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
    if (!options.shopid) {
      helperServ.showModal({
        content: "参数错误，请返回后重试"
      });
      return;
    }
    shopServ.getShopImg({ shopid: options.shopid }).then(res => {
      if (!res.result.data && res.result.data.length === 0) {
        return;
      }
      var imginfo2 = res.result.data[0].imginfo2;
      imginfo2 = imginfo2 ? Object.values(imginfo2) : null;
      if (!imginfo2) {
        return;
      }
      imginfo2.sort((a, b) => a - b);
      var tabTitle = imginfo2.map(v => { return { name: v.name, status: '1' } });
      this.setData({
        tabTitle: tabTitle,
        imginfo: imginfo2
      })
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          imgWidth: res.windowWidth / 2 - 15
        })
      }
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

  },
  oneSelectTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var cindex = e.currentTarget.dataset.cindex;
    var imginfo = this.data.imginfo[index];
    var prePage = helperServ.getPrePage();
    if (prePage) {
      var options = prePage.options;
      options.nextPageCallBack ? options.nextPageCallBack(null, imginfo.value[cindex].fileID) : null;
      helperServ.goBack();
    } else {
      helperServ.showModal({ content: '获取上一页面失败,请返回重试！' });
    }
  },
})