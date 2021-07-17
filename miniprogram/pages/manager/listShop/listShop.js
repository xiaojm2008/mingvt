const shopServ = require("../../../lib/manager/shop.js");
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  batch_time: -1,
  tmpArr: [],
  userinfo: null,
  data: {
    totalNum: 0,
    loadFinish: false,
    inList: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.userinfo = helperServ.getUserInfo();
    cache.getDict(["100024", "100025", "100026"], (err, res) => {
      if (err) {
        return;
      }
      this.setData({
        frompage: options.frompage || null,
        userid:this.userinfo.userid,
        currshopid: this.userinfo.shopinfo ? this.userinfo.shopinfo.shopid : null,
        dict: res
      });
    });
    this.loadMore();
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data.loadFinish = false;
    this.batch_time = -1;
    this.tmpArr = [];
    this.loadMore(true);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  loadMore: function(isPull) {
    pageServ.loadMore(shopServ.getShopByUserId, {
      batch_time: this.batch_time,
      status: null,
    }, isPull, this);
  },
  openLocation: function(e) {
    var shop = this.data.inList[e.currentTarget.dataset.index];
    pageServ.openLocation(shop.latitude, shop.longitude);
  },
  callPhone: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  shopSelectTap: function(e) {
    var shop = this.data.inList[e.currentTarget.dataset.index];
    /*if (this.userinfo.shopinfo && shop.shopid === this.userinfo.shopinfo.shopid && this.userinfo.shopinfo.basedir) {
      helperServ.goBack();
      return;
    }*/
    helperServ.showLoading();
    //shopServ.addSysUserInfo({ shopinfo: shop }).then(res => {
    shopServ.setDefaultShop({
      shopinfo: {
        shopid:shop.shopid,
        shopname:shop.shopname,
        basedir:shop.basedir,
        status:shop.status
      }
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.success) {
        helperServ.addUserShopInfo(res.result.data, this.userinfo, shop);
        var prePage = helperServ.getPrePage();
        if (prePage && prePage.setSelectedShop){
          prePage.setSelectedShop(res.result.data);        
        }      
        helperServ.goBack();
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.showModal({
        content: res.errMsg || res.message
      });
      helperServ.hideLoading();
    });
  },
  goToPage: function(e) {
    var page = e.currentTarget.dataset.page,
      params = e.currentTarget.dataset.params;
    if (!params && page == 'createShop') {
      //this.showModal();
      this.createShop({});
    } else {
      params = !!params ? "?" + params : "";
      if (page[0] === "/") {
        helperServ.goToPage(page + params);
        return;
      }
      helperServ.goToPage(`../${page}/${page}${params}`);
    }
  },
  delTogger:function(e){
    helperServ.showModal({content:"请联系管理员来关闭店铺"});
  },
  createShop: function(params) {
    helperServ.showLoading({
      title: '跳转中...'
    });
    shopServ.getShopid(params).then(res => {
      helperServ.hideLoading();
      if (res.result.shopid && res.result.basedir && res.result.basedir.trim()) {
        helperServ.goToPage(`../createShop/createShop?shopid=${res.result.shopid}&basedir=${res.result.basedir}`);
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    });
    return;
  },
  chooseImg: function(e, cb) {
    var storage = e.currentTarget.dataset.field.value;
    pageServ.chooseImg(e, null, null, (err, curimg, existsImgArr) => {
      if (err) {
        helperServ.showToast({
          title: err,
          icon: 'none'
        });
        return;
      }
      if (!curimg || curimg.length === 0) {
        helperServ.showToast({
          title: "您未选择图片",
          icon: 'none'
        });
        return;
      }
      pageServ.upLoadFile(curimg, "ok", (err, res) => {
        if (err) {
          //helperServ.showToast({ title: err, icon: 'none' });
          return;
        } else {
          const prompt = {
            type: "b",
            retogger: false, //点击 prompt 项目 还有触发事件      
            text: "验证成功",
            value: res.imgarr.map(v => {
              return {
                fileID: v.fileID
              }
            })
          };
          cb(null, prompt);
          app.setEnv("storage", storage);
          this.verify = true;
        }
      }, storage);
    });
  },
  showModal: function() {
    this.myDlg = this.selectComponent('#modalDlg');
    this.myDlg.showDlg({
      title: '云环境ID配置',
      inputlist: {
        "cloudid": {
          "id": "cloudid",
          "name": "云环境ID",
          "type": "0",
          "required": "R",
          "label": true,
          "placeholder": '请输入云环境ID',
          "prompt": {
            "type": "0",
            "value": "请于微信公众平台申请小程序账号，并开通云环境并保障验证通过"
          },
          "event": {
            "type": "tap",
            "name": "验证",
            "togger": (e, cb) => {
              e.currentTarget.dataset.initflag = true;
              e.currentTarget.dataset.maxcount = 1;
              const field = e.currentTarget.dataset.field;
              if (!field.value || !field.value.trim()) {
                helperServ.showToast({
                  title: field.name + "不能为空",
                  icon: 'none'
                });
                return;
              }
              this.chooseImg(e, cb);
            }
          },
          "value": "xiaovt-9bie1" //mingvt-f8c412dd xiaovt-9bie1
        },
        "links": {
          "id": "links",
          "name": "小程序账号注册",
          "label": false,
          "type": "l",
          "required": "O",
          "link": {
            "type": "navigator",
            "items": [{
              "params": "",
              "type": "1", //
              "url": "https://mp.weixin.qq.com/wxopen/waregister?action=step1",
              "name": "小程序账号注册"
            }]
          }
        },
        "summary": {
          "id": "summary",
          "name": "备注",
          "type": "9", //选择框
          "required": "O",
          "placeholder": '小程序云环境用于我的店铺开发，图片和数据存储',
          "value": ""
        }
      },
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        if (e.btnindex === 0) {
          cb();
          return;
        }
        if (!e.inputlist) {
          cb('e');
          return;
        }
        if (!this.verify) {
          this.showToast({
            title: "未验证",
            icon: "none"
          });
          cb('e');
          return;
        }
        try {
          var params = {};
          for (var k in e.inputlist) {
            params[k] = e.inputlist[k].value
          }
          this.createShop(params);
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  },
})