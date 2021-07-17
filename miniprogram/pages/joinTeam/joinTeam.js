// miniprogram/pages/joinTeam/joinTeam.js
var teamServ = require("../../lib/services/myteam.js");
var helperServ = require("../../lib/utils/helper.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myTeam: null
  },
  /*
      "join=A&code=5029&phone=12312312313" ||
      var arr = scene.split("&");
      var params = {};
      arr.forEach((item, idx, arr2) => {
        var i = item.indexOf("=");
        var key = item.substr(0, i);
        var val = item.substr(i + 1);
        params[key] = val;
      });*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const scene = options.scene ? decodeURIComponent(options.scene) : null;
    const show = options.show ? options.show : '0';
    console.log(`get scan string :${scene}->show=${show}`);
    if(show == '1'){
      teamServ.getMyTeamList({
        invitation_code: scene,
        batch_time:0,
        page_size:1
      }).then(res=>{
        this.setData({
          myTeam: res.result && res.result.data.length > 0 ? res.result.data[0]:null
        })
      });
      return;
    }
    teamServ.joinTeam({
      invitation_code: scene || '35f860b9f23f4be8bf14bbb6c009eff4'
    }).then(res => {
      if (res.result.errMsg) {
        helperServ.showModal({
          title: '提示',
          content: res.result.errMsg,
        })
        return;
      } else {
        this.setData({
          myTeam: res.result
        });
      }
    });
  },
  goBack: function() {
    helperServ.goBack();
  },
  callPhone: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})