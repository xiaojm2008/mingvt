// miniprogram/pages/joinTeam/joinTeam.js
var shareServ = require("../../lib/services/share.js");
var helperServ = require("../../lib/utils/helper.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadFinish: false
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
      });
    if(res.result.type=='1'){
        //商品
        helperServ.goToPage("/pages/goodsDetail/goodsDetail?goodsno="+res.result.share_no,1);         
    } else if(res.result.type=='2'){         
      helperServ.goToPage("/pages/shopDetail/shopDetail?shopid="+res.result.share_no,1);         
    } else if(res.result.type=='3'){
        //报名分享
      helperServ.goToPage("/pages/sigDetail/sigDetail?sigid="+res.result.share_no,1);
    }*/
  /**
   * 生命周期函数--监听页面加载
   * 扫描二维码首次进入的页面（scene=xlh_shareinfo._id)
   */
  onLoad: function (options) {
    const scene = options.scene ? decodeURIComponent(options.scene) : null;
    //console.log(`get scan string :${scene}`);
    this.setData({
      loadFinish: false
    })
    shareServ.addShareInfo({
      scene: scene ||'SHA157875365570276e3d5cccb21558f'|| '35f860b9f23f4be8bf14bbb6c009eff4'
    }).then(res => {
      if (res.result.success) {
        helperServ.goToPage(res.result.share_url + res.result.share_no, 1);
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        })
      }
      this.setData({
        loadFinish: true
      })
    }).catch(err => {
      this.setData({
        loadFinish: true
      })
      helperServ.showModal({
        content: err.errMsg || err.message
      })
    });
  }
})