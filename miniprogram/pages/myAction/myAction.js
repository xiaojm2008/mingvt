// miniprogram/pages/myAction/myAction.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: [{
      name: "全部",
      params: {
        status: ""
      }
    },{
      name: "进行中",
      params: {
        status: "0"
      }
    },{
      name: "已结束",
      params: {
        status: "1"
      }
    },{
      name: "待评论",
      params: {
        status: "2"
      }
    },{
      name: "已完成",
      params: {
        status: "3"
      }
    }],
    action: "action.getMyEnrollInfoList",
    manager: "trader",
    temptype: 'enrolllist',
    defParams:{},
    orderBy:{
      orderby_field: "updatetime",
      orderby_type: "desc"
    }
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