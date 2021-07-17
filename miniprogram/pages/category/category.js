// pages/category/category.js
var commServ = require("../../lib/services/common.js");
var constants = require("../../lib/constants.js");
var goodsServ = require("../../lib/services/goods.js");
var helperServ = require("../../lib/utils/helper.js");
Page({

  /**
   * 页面的初始数据
   */
  batch_time:-1,
  data: {
    selectdeptid:"",
    cate:[],
    windowHeight:0,
    loadFinish:false,
    goodsMap:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    commServ.getDictValueList().then(res=>{
      if (!res.result.data || res.result.data.length == 0){
        return;
      }
      this.setData({
        cate:res.result.data[0][constants.DICT_CATE_ID]
      });
      this.tapDeptHandler("10");
    }).catch(err=>{});
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
    var self = this;
    wx.getSystemInfo({
      success: function (res) {
        var windowHeight = res.windowHeight;
        self.setData({
          windowHeight: windowHeight
        })
      }
    });
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
  tapToItemHandler: function (event) {
    let goodsno = event.currentTarget.dataset.goodsno;
    if (goodsno) {
      helperServ.goToPage('/pages/goodsDetail/goodsDetail?goodsno=' + goodsno);
    }
  },
  toBusModelList:function(goods){
    var tmp = {};
    for(var i = 0; i < goods.length;i++){
      var itm = goods[i];
      if(!tmp[itm.busmodel]){
        tmp[itm.busmodel] = new Array();
      } 
      tmp[itm.busmodel].push(itm);
    }
    return tmp;
  },

  tapDeptHandler: function (event){
    let deptid = typeof event == "string"? event :event.currentTarget.dataset.deptid;
    this.setData({
      selectdeptid:deptid
    });
    if (deptid) {
      helperServ.showLoading({
        title: '加载中...',
      });
      goodsServ.getGoodsList({ deptid: deptid, batch_time: this.batch_time}).then(res=>{
        helperServ.hideLoading();
        if (!res.result.data){
          this.setData({
            loadFinish:true
          });
          return;
        }
        var goods = this.toBusModelList(res.result.data);
        this.setData({
          goodsMap:goods
        });
      }).catch(err => { helperServ.hideLoading();});
    }
  }
})