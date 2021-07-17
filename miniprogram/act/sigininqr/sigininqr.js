var helperServ = require("../../lib/utils/helper.js");
var pageServ = require("../../lib/utils/pagehelper");
var qrCodeServ = require("../../lib/services/qrcode.js");
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
    this.actionid = options.actionid;
    if(!this.actionid){
      helperServ.showModal({
        content:"参数错误",
        success:(ok)=>{
          if(ok.confirm){
            helperServ.goBack();
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getSigninQr:function(){
    this.genQrCode();
  },
  getSize: function () {
    var size = {};
    try {
      pageServ.setWinHgh(this);
      /*
      var res = wx.getSystemInfoSync();
      var windowHeight = res.windowHeight;
      this.setData({
        windowHeight: windowHeight
      })*/
      
      var scale = 750 / 686; //不同屏幕下canvas的适配比例；设计稿是750宽
      var width = Math.floor(this.data.windowWidth / scale);
      var height = width; //
      size.w = width;
      size.h = height;
    } catch (e) {
      console.log("获取设备信息失败" + e);
    }
    this.setData({
      size: size.w
    })
    return size;
  },
  genQrCode: function () {
    helperServ.showLoading();
    const size = this.getSize();
    qrCodeServ.getQrCode({
      scene: this.actionid,
      width: size.w,
      content: "pages/siginin/siginin"
    }).then(res => {
      helperServ.hideLoading();
      if (!res.result.buffer) {
        helperServ.showToast({
          icon: 'none',
          title: res.result.errMsg,
        });
        return;
      }
      //var qr = null;
      if (res.result.contentType === "string") {
        this.setData({
          qrcode: res.result.buffer,
          qrHidden: false
        });
      } else {     
        const qrPath = `${wx.env.USER_DATA_PATH}/qr_${this.actionid}.jpg`;
        wx.getFileSystemManager().writeFile({
          filePath: qrPath,
          data: res.result.buffer,
          encoding: 'binary',
          success:(res) =>{
            console.log(qrPath, res);
            this.setData({
              qrcode: qrPath,
              qrHidden: false
            });
          },
          fail:(err) =>{
            console.log('writeFile', err);
            helperServ.showModal({
              title: '提示',
              content: err.errMsg,
            })
          },
        });
      }
      //helperServ.setStorage("QR_MYTEAM", qr);
    });
  },
  previewImg: function (e) {
    var img = this.data.qrcode;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },
})