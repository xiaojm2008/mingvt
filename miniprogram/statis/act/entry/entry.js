const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require("../../../lib/utils/pagehelper.js");
const rpc = require("../../../lib/utils/rpc.js");
//const dict = require("../../../lib/utils/cache.js").dict(true);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadFinish:0,
    rate:1.5,
    windowHeight:200
  },
  actionid:"",
  /**
   * 
   * @param {statstype} options 
   */
  onLoad: function (options) {
    this.actionid = options.actionid;
    if(!this.actionid){
      helperServ.goBack();
      helperServ.showModal({
        content:"参数错误"
      })
      return;
    }
    rpc.doAction({},"cfg.getActionFuncList", "statis").then(res => {
      if (res.result.data) {
        this.setData({
          funclist:res.result.data
        })
      } else {
        helperServ.showToast({
          icon: "none",
          title: res.result.errMsg || "返回异常"
        });
      }
    }).catch(err => {
      helperServ.showToast({
        icon: "none",
        title: err.errMsg || err.message
      });
    });
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '活动报表统计',
      path: this.route,
      success: function () {},
      fail: function () {}
    }
  },
  goToPage: function (e) {
    var func = this.data.funclist[e.currentTarget.dataset.index];
    helperServ.goToPage(func.url+"?actionid="+this.actionid+"&funcid="+func.id+"&action="+func.action+"&manager="+func.manager);
  }
})
