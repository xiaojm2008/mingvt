// miniprogram/act/actionlist/actionlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  /**
     * name:''
     * params:{}
     */
    category: [{
      name: "全部",
      params: {
        status: ""
      }
    },{
      name: "待报名",
      params: {
        status: "0"
      }
    },{
      name: "报名中",
      params: {
        status: "1"
      }
    },{
      name: "待活动",
      params: {
        status: "2"
      }
    },{
      name: "活动中",
      params: {
        status: "3"
      }
    },{
      name: "结束",
      params: {
        status: "4"
      }
    },{
      name: "已删除",
      params: {
        status: "9"
      }
    }],
    action: "action.getActionList",
    manager: "trader",
    temptype: 'actionlist',
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})