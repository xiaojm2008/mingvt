//const app = getApp();
//var shopServ = require("../../lib/services/shop.js");
//const helperServ = require("../../lib/utils/helper.js");
/**
 * 页面shopCategory中调用
 */
Page({

  /**
   * 页面的初始数据
   */
  data: {
    condi: [],
    action: null,
    manager: "trader",
    temptype:null,
    orderBy:null,
    defParams:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var params = {};
    if(options.params){
      params = JSON.parse(decodeURIComponent(options.params));
    }
    this.setData({
      condi: params.condi||null,
      action: params.action||"goods.getGoodsList",
      manager: params.manager||"trader",
      defParams: params.defParams||{shopid:options.shopid||''},
      orderBy: params.orderBy||{},
      temptype: params.temptype ||"goodslist"
    });
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})