const helperServ = require("../../lib/utils/helper.js");
const pageServ = require("../../lib/utils/pagehelper.js");
const actionServ = require("../../lib/services/action.js");
const showDetail = require("../../components/template/enrolllist/enrolllist.js").showDetail;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      const scene = decodeURIComponent(options.scene);
      this.actionid = scene;
      var userInfo = helperServ.getUserInfo();
      if (!userInfo) {
        helperServ.goToPage('/pages/login/login');
      }
      return showDetail({
        actionid:scene,
        options:{
          title:"签到",
          togger:true,
          btntext:"签到"
        }
      },this);
    } else {
      helperServ.showModal({content:"页面错误"});
    }
  },
  onReady: function () {
    pageServ.setWinHgh(this);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  sigin(e){
    var params = {};
    params["actionid"] = this.actionid;
    params["sigincode"] = "QR";
    helperServ.showLoading();
    actionServ.siginIn(params).then(res => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      })
      if(res.result.success){
        this.selectComponent("#enrollDetail").hide();
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      })
    })
  }
})