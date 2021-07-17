// pages/logisticsPath/logisticsPath.js
var servLogistics = require("../../lib/manager/logistics.js");
var KDNWidget = require("./KDNWidget/KDNWidget.js");
Page({
  testLogistics: {
    com: "shunfeng",
    comany: "顺丰速运",
    condition: "D01",
    data: [{
      time: "2019-01-15 08:43:21",
      ftime: "2019-01-15 08:43:21",
      context: "[潍坊市]代签收(圆通快递 ),感谢使用顺丰,期待再次为您服务",
      display: 0
    }, {
      time: "2019-01-15 07:41:10",
      ftime: "2019-01-15 07:41:10",
      context: "[潍坊市]快件交给安同振，正在派送途中（联系电话：18369680172）",
      display: 1
    }, {
      time: "2019-01-15 07:00:24",
      ftime: "2019-01-15 07:00:24",
      context: "快件到达 【潍坊市奎文区万达广场营业点】",
      display: 1
    }, {
      time: "2019-01-15 05:57:10",
      ftime: "2019-01-15 05:57:10",
      context: "[潍坊市]快件已发车",
      display: 1
    }, {
      time: "2019-01-15 01:55:44",
      ftime: "2019-01-15 01:55:44",
      context: "快件在【潍坊宝通集散中心】已装车,准备发往 【潍坊市奎文区万达广场营业点】",
      display: 1
    }, {
      time: "2019-01-14 19:52:05",
      ftime: "2019-01-14 19:52:05",
      context: "[潍坊市]快件到达 【潍坊宝通集散中心】",
      display: 1
    }, {
      time: "2019-01-14 14:57:40",
      ftime: "2019-01-14 14:57:40",
      context: "[连云港]快件已发车",
      display: 1
    }, {
      time: "2019-01-14 09:44:55",
      ftime: "2019-01-14 09:44:55",
      context: "快件在【连云港海州集散中心】已装车,准备发往 【潍坊宝通集散中心】",
      display: 1
    }, {
      time: "2019-01-14 09:24:07",
      ftime: "2019-01-14 09:24:07",
      context: "快件到达 【连云港海州集散中心】",
      display: 1
    }, {
      time: "2019-01-14 00:24:21",
      ftime: "2019-01-14 00:24:21",
      context: "[常州市]快件已发车",
      display: 1
    }, {
      time: "2019-01-13 23:59:14",
      ftime: "2019-01-13 23:59:14",
      context: "[常州市]快件在【常州横山桥集散中心】已装车,准备发往 【连云港海州集散中心】",
      display: 1
    }, {
      time: "2019-01-13 21:05:56",
      ftime: "2019-01-13 21:05:56",
      context: "[常州市]快件到达 【常州横山桥集散中心】",
      display: 1
    }, {
      time: "2019-01-13 20:39:47",
      ftime: "2019-01-13 20:39:47",
      context: "[常州市]快件已发车",
      display: 1
    }, {
      time: "2019-01-13 20:01:08",
      ftime: "2019-01-13 20:01:08",
      context: "[常州市]快件在【常州武进天安营业部】已装车,准备发往 【常州横山桥集散中心】",
      display: 1
    }, {
      time: "2019-01-13 17:13:21",
      ftime: "2019-01-13 17:13:21",
      context: "[常州市]顺丰速运 已收取快件",
      display: 1
    }],
    image: "https://img.nmsmt.cn/sbs/good/20190111/154718948060748.jpg",
    ischeck: "1",
    message: "ok",
    nu: "467995890343",
    state: "3",
    state_cn: "已签收",
    status: "200"
  },
  /**
   * 页面的初始数据
   */
  data: {
    logistics: [], //物流详情列表 
    hasData: false,
    url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //http://www.kdniao.com/JSInvoke/MSearchResult.aspx?expCode=ZTO&expNo=75143252113465&sortType=DESC&color=rgb(46,114,251)
    var url = KDNWidget.run({
      serviceType: "A",
      expCode:  options.exp_code||"ZTO",
      expNo: options.BN||"75143252113465",
    });
    this.setData({
      url:url
    });
    
    var orderId = options.order_id; //order表主键id
    this.setData({
      logistics: this.testLogistics,
      hasData: this.testLogistics.data && this.testLogistics.data.length > 0
    });
    return;
    servLogistics.getLogisticsPath({
      order_id: orderId
    }).then(res => {
      if (!res.result.data){
        wx.showToast({
          icon:"none",
          title: `${res.result.errCode}:${res.result.errMsg}`
        })
      } else {
      this.setData({
        logistics: res.result.data,
        hasData: res.result.data && res.result.data.data.length > 0
      })
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  onUrlLoad:function(e){
    console.log(e.detail)
  },
  onUrlLoadErr: function (e) {
    console.log('Err',e.detail)
  }
})