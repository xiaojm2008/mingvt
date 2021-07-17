// miniprogram/pages/myCashOut/myCashOut.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cashOut:0,
    willCashOut:'',
    showPrompt:false,
    exceed: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cashOut: options.cashout
    });
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
    var exceed = !!amt && parseFloat(amt) > parseFloat(this.data.cashOut);
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
      willCashOut: this.data.cashOut
    })
  },
  cashOutTap:function(){

  }
})