const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require("../../../lib/utils/pagehelper.js");
const app = getApp();
Page({
  data: {
    hasTop: false,
    refreshlock: false, //是否禁止下拉刷新
    windowHeight: 0,
    statusBarHeight: app.systemInfo.statusBarHeight,
    freshBarSize: pageServ.getRpx(45 + app.systemInfo.statusBarHeight),
    listData: [],
    batch_time: -1
  },
  _qryParams: {
    orderby_field: "updatetime",
    orderby_type: "desc"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.refresh();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    pageServ.getSystemInfo({
      success: (res) => {
        this.setData({
          "windowHeight": res.windowHeight-65
        })
      }
    })
  },
// 刷新数据
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
  pageServ.loadMore2("manager", "thema.getThemaList", params, isPull, this, (err, res) => {
    if (err) {
      return;
    }
  });
},
reBack(e) {
  helperServ.goBack();
},
goDetail(e){
  helperServ.goToPage(`/pages/manager/shopdecor/shopdecor?themaid=${e.currentTarget.dataset.themaid}`);
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})