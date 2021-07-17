const app = getApp();
const helperServ = require("../../lib/utils/helper.js");
const shopServ = require("../../lib/services/shop.js");
const goodsServ = require("../../lib/services/goods.js");
const couponServ = require("../../lib/services/coupon.js");
const pagecfg = require("../../components/shoptheme/cfg/pagecfg.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carousel: null,
    toprank:null,
    coupons:null,
    announcementText: "新店开业，欢迎贵客进店参观，选购，优品多多，优惠多多！",
    category: [],
    action: null,
    manager: "trader",
    temptype: "goodslist",
    defParams:{shopid:app.globalData.shopid},
    orderBy:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    shopServ.listCategory({
      shopid:app.globalData.shopid
    }).then(res => {
      if (res.result.data && res.result.data.length > 0) {
        this.data.category = res.result.data[0].items.map(v => {
          return this.transferCate(v, options.code)
        });
        this.setData({
          category: this.data.category,
          action:"goods.getGoodsList"
        });
      } else if(!res.result.data) {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  
  transferCate: function(cate,cursel) {
    return {
      name: cate.name,
      params: {
        subid: cate.code
      },
      active: cate.code === cursel,
      items: cate.items && cate.items.map(v => {
        return this.transferCate(v, cursel);
      })
    }
  },

  tapNode:function(e){
    if (e.currentTarget.dataset.url){
      helperServ.goToPage(e.currentTarget.dataset.url);
    }  
  },
  
  goToGoods:function(e){
    helperServ.goToPage(pagecfg.goodsdetail_page + "?goodsno=" + e.currentTarget.dataset.goodsno);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    goodsServ.getCarousel({
      shopid: app.globalData.shopid
    }).then(res => {     
      this.setData({
        carousel: res.result.data
      })
    }).catch(err => {
      //todao
    });

    goodsServ.getTopRankList({
      shopid:app.globalData.shopid
    }).then(res => {
      this.setData({
        toprank: res.result.data
      })
    }).catch(err => { });

    couponServ.getCouponList({
      shopid:app.globalData.shopid
    }).then(res => {
      this.setData({
        coupons: res.result.data
      })
    }).catch(err => {

    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})