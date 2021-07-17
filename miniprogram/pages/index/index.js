const app = getApp();
const shopServ = require("../../lib/services/shop.js");
const helperServ = require("../../lib/utils/helper.js");
const advertServ = require("../../lib/services/advert.js");
Page({

  /**
   * 页面的初始数据
   */
  newuser:false,
  data: {
    statusBarHeight: app.systemInfo.statusBarHeight, 
    nodes:null,
    current:0,
    loadFinish:false,
    show:false,
    listData:null,/*[
      {
        picpath: "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/index/shop22.jpg",
        text:"离开电脑，快速开店，随时随地随性打理您的店铺，开启您的创业新时代！"
      },
      {
        picpath: "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/index/goods.jpg",
        text: "动动手指头，就可以在小程序里发布您的宝贝，让您的生活与工作两不误！"
      },
      {
        picpath: "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/index/order22.jpg",
        text: "店铺，商品，订单，物流一切尽在股掌间！让指尖流转的不只是时间还有您想要的所有！"
      },
      {
        picpath:"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/index/pin06.jpg",
        text: "在这里您可以全天后为您的客户，您会很傲娇哦"
      }
    ]*/
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideTabBar();
    var userinfo = helperServ.getUserInfo();
    this.newuser = !userinfo || !userinfo.shopinfo || !userinfo.shopinfo.shopid;
    advertServ.getAdvert({_id:"launch"}).then(res=>{      
      if(res.result.data){
        this.setData({       
          show:res.result.data.show ||  this.newuser,
          listData:res.result.data.content
        })
      }
      //新用户
      if(!this.data.show){
        wx.showTabBar();
      }
      this.loadThema();
    }).catch(err=>{
      helperServ.showToast({title:err.errMsg||err.message})
    })
  },
  change: function (e) {
    this.setData({
      current: e.detail.current
    })
  },
  hide: function () {
    this.setData({
      show: !this.data.show
    })
    if (!this.data.show) {
      wx.showTabBar();
    }
  },
  loadThema:function(){
    shopServ.getShopThema({
      shopid: "SHP15771871049857906ccd8927cdb3b"
    }).then(res => {
      helperServ.hideLoading();
      if (!res.result.data || res.result.data.length === 0) {
        helperServ.showModal({
          content: "获取店铺信息失败"
        });
      } else {
        this.setData({
          loadFinish:true,
          nodes: res.result.data
        })
      }
    }).catch(err => {
      helperServ.showModal({ content: err.errMsg || err.message });
      //helperServ.hideLoading();
    });
  },
  goLogin:function(){
    this.hide();
    helperServ.goToPage("/pages/login/login?fromindex=1");   
  },
  tapNode: function (e) {
    if (e.currentTarget.dataset.url) {
      helperServ.goToPage(e.currentTarget.dataset.url);
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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