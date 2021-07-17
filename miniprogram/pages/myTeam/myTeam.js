// miniprogram/pages/myTeam/myTeam.js
var myTeamServ = require("../../lib/services/myteam.js");
var helperServ = require("../../lib/utils/helper.js");
var pageServ = require("../../lib/utils/pagehelper.js");
var qrCodeServ = require("../../lib/services/qrcode.js");
var userServ = require("../../lib/services/user.js");
const PAGE_SIZE = 10;
Page({
  QR_FILE_NAME: 'invitation_qr.png',
  /**
   * 页面的初始数据
   */
  _qryParams: {
    orderby_field: "updatetime",
    orderby_type: "desc"
  },
  userInfo: null,
  data: {
    size: 0,
    qrHidden: true,
    qrcode: null,
    loadFinish: false,
    inList: [],
    userBenefit: {}
  },
  getSize: function() {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var windowHeight = res.windowHeight;
      this.setData({
        windowHeight: windowHeight
      })
      //不同屏幕下canvas的适配比例；设计稿是750宽
      var scale = 750 / 686;
      var width = Math.floor(res.windowWidth / scale);
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.userInfo = helperServ.getUserInfo();
    if (!this.userInfo || this.userInfo == "") {
      helperServ.goToPage("../login/login");
      return;
    }
    this.refresh();
  },

  getQrCode: function(userBenefit) {
    if (userBenefit.level == 'A' || userBenefit.level == 'B') {
      this.genQrCode(userBenefit);
      return;
    }
    this.genQrCode(userBenefit);
  },
  genQrCode: function(userBenefit) {
    const size = this.getSize();
    qrCodeServ.getQrCode({
      scene: `${userBenefit.invitation_code}`,
      width: size.w,
      content: "pages/joinTeam/joinTeam",
      user_level: userBenefit.level,
      user_id: userBenefit.openid
    }).then(res => {
      helperServ.hideLoading();
      if (!res.result.buffer) {
        helperServ.showToast({
          icon: 'none',
          title: res.result.errMsg,
        });
        return;
      }
      var qr = null;
      if (res.result.contentType === "string") {
        this.setData({
          qrcode: res.result.buffer,
          qrHidden: false
        });
      } else {
        var that = this;
        const qrPath = `${wx.env.USER_DATA_PATH}/${this.QR_FILE_NAME}`;
        wx.getFileSystemManager().writeFile({
          filePath: qrPath,
          data: res.result.buffer,
          encoding: 'binary',
          success(res) {
            console.log(qrPath, res);
            that.setData({
              qrcode: qrPath,
              qrHidden: false
            });
          },
          fail(err) {
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
  refleshQR: function(e) {
    if (!this.userInfo.phone || this.userInfo.phone.trim() == "") {
      helperServ.showModal({
        title: '提示',
        content: '您需要认证手机号码后才能邀请其他人加入您的团队！',
        success: (res) => {
          if (res.cancel) {
            return;
          }
          helperServ.goToPage("../myCenter/myCenter");
        }
      });
      return;
    }
    helperServ.showLoading({
      title: '加载中...',
    });
    userServ.getUserBenefit({
      gen: 1
    }).then(res => {
      if (!res.result.invitation_code) {
        helperServ.showToast({
          icon: 'none',
          title: res.result.errMsg,
        });
        return;
      }
      this.setData({
        userBenefit: res.result || {}
      })
      this.getQrCode(res.result);
    });
  },
  previewImg: function(e) {
    var img = this.data.qrcode;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },
  drawQR: function(frame, canvas, sizeRect, $this) {
    var size = sizeRect.w;
    var width = size;
    var cavW = size;
    // 组件中生成qrcode需要绑定this 
    var ctx = wx.createCanvasContext(canvas, $this);
    var px = Math.round(size / (width + 8));
    var roundedSize = px * (width + 8),
      offset = Math.floor((size - roundedSize) / 2);
    size = roundedSize;
    //ctx.clearRect(0, 0, cavW, cavW);
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, cavW, cavW);
    ctx.setFillStyle('#000000');
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < width; j++) {
        if (frame[j * width + i]) {
          ctx.fillRect(px * (4 + i) + offset, px * (4 + j) + offset, px, px);
        }
      }
    }
    ctx.draw();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

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
    pageServ.loadMore2("trader", "user.getMyTeamList", params, isPull, this, (err, res) => {
      if (err) {
        return;
      }
    });
  },
  callPhone: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  hiddenQR: function() {
    this.setData({
      qrHidden: true
    })
  }
})