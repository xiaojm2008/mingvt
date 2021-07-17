const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const helperServ = require("../../../lib/utils/helper.js");
const cashoutServ = require("../../../lib/manager/cashout.js");
const settleServ = require("../../../lib/manager/settle.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    available:0,
    willCashOut:'',
    showPrompt:false,
    exceed: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.settle();
  },
  settle:function(){
    helperServ.showLoading({context:"订单结算处理中...."});
    settleServ.settle({}).then(res=>{
      helperServ.hideLoading();
      if(res.result.success){
        this.setData({
          begmonth:res.result.begmonth,
          endmonth:res.result.endmonth,
          settlemonth:res.result.settlemonth,
          totalamt:res.result.totalamt,
          available:res.result.available+res.result.frozen,
          frozen:res.result.frozen
        })
        return;
      }
      helperServ.showModal({content:res.result.errMsg})
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({content:err.errMsg||err.message})
    })
  },
  myCashout:function(){
    helperServ.goToPage("/pages/manager/cashOutAppr/cashOutAppr")
  },
  showDetail:function(){
    helperServ.goToPage("/pages/manager/balShopDetail/balShopDetail")
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

  },
  inputCashOutAmt: function (e) {
    var amt = e.detail.value;
    var exceed = !!amt && parseFloat(amt) > parseFloat(this.data.available);
    this.setData({
      exceed: exceed?"exceed":"",
      showPrompt: amt != 0? true:false,
      promptInfo: exceed ? "输入金额超过可提现金额" : "现暂不收取手续费！",
      willCashOut: amt
    })
    console.log(`inputCashOutAmt [${e.detail.value}]`,amt);
  },
  setCashOutAmt:function(){
    this.setData({
      showPrompt:true,
      promptInfo:"现暂不收取手续费！",
      willCashOut: this.data.available
    })
  },
  cashOutTap:function(){

    helperServ.showLoading();

    cashoutServ.cashout({
      amt:this.data.willCashOut
    }).then(res=>{
      if(res.result.success==1){
        this.setData({
          willCashOut:'',
          totalamt:res.result.totalamt,
          available: res.result.available + res.result.frozen,
          frozen:res.result.frozen
        })
      }
      helperServ.hideLoading();
      helperServ.showModal({content:res.result.errMsg})
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({content:err.errMsg||err.message})
    })
  }
})