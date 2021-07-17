var helperServ = require("../../../lib/utils/helper.js");
var pageServ = require("../../../lib/utils/pagehelper.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  _qryParams: {
    orderby_field: "statismonth",
    orderby_type: "desc"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refresh();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  goRpt:function(){

  },
  //trader user.getMyTeamList
  refresh() {
    this.setData({
      batch_time: -1,
      loadFinish: false
    });
    this.loadMore(this._qryParams, true);
  },
  // 加载更多
  more() {
    this.loadMore(this._qryParams, false);
  },
  loadMore(params, isPull) {
    pageServ.loadMore2("manager", "settle.getBalDetail", params, isPull, this, (err, res) => {
      if (err) {
        return;
      }
    });
  },
})