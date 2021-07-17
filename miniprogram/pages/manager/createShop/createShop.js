const shopServ = require('../../../lib/manager/shop.js');
const helperServ = require('../../../lib/utils/helper.js');
const pageServ = require('../../../lib/utils/pagehelper.js');
//const commServ = require('../../../lib/manager/comm.js');
const cache = require("../../../lib/utils/cache.js");
//const mixed = require("../../../lib/services/mixed.js");
//const mySeq = require("../../../lib/utils/mySeq.js");
const upimg = require("../../../lib/utils/upimg.js");
//const constants = require("../../../lib/comm/constants.js");
const restore = require("../../../lib/utils/restore.js");
//const goToPage = require('../../../lib/comm/goToPage.js');
const shopFormat = require("../../../lib/manager/comm.js").shopFormat;
const V = require('../../../lib/utils/validate.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  aspectInFunc: [null, null, null, null, null, null], //nextStep中执行
  aspectFunc: [null, null, null, null, null, null], //nextStep中执行
  preAspectFunc: [null, null, null, null, null, null], //preStep中执行
  preAspectFuncBefore: [null, null, null, null, null, null], //preStep中执行
  upCfg: {
    cloudpath: null,
    compressrate: 10,
    maxcount: 4,
    maxwidth: 640,
    maxheight: 480,
    cutimg: true,
    imgtype: 'jpg'
  },
  data: {
    btnShow: true,
    itemWidth: 0,
    activeIndex: 0,
    shopinfo: {},
    flows: [{
      step: '阅读须知',
      desc: '请确认相关规则与条例',
      width: 60
    }, {
      step: '开店类型',
      desc: '个人或企业',
      width: 60
    }, {
      step: '申请认证',
      desc: '提供相关资料，等待审核',
      width: 60
    }, {
      step: '预览',
      desc: '开店成功，快点发布宝贝吧',
      width: 40
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.userinfo = helperServ.getUserInfo();
    if (!this.userinfo || !this.userinfo.basedir) {
      helperServ.showModal({
        content: "用户未注册",
        success: (res) => {
          if (res.confirm) {
            helperServ.goToPage('/pages/login/login/login');
          }
        }
      });
      return;
    }

    this.aspectFunc[1] = this.checkBaseInfo;   
    shopFormat({}).then(res => {
      this.shopFormat = res.result;
    }); 
    if (!options.shopid ) {
      helperServ.showModal({
        content: "参数错误，请返回后重试"
      });
      helperServ.goBack();
      return;
    }
    restore.setEnrollInfo(null, null);

    this.data.shopinfo.shopid = options.shopid;
    //this.data.shopinfo.basedir = options.basedir;

    cache.getDict(["100000", "100023", "100024", "100025", "100026"], (err, res) => {
      if (err) {
        return;
      }
      this.setData({
        dict: res
      });
    });
    wx.getSystemInfo({
      success: (res) => {
        var windowWidth = res.windowWidth;
        this.setData({
          itemWidth: windowWidth / this.data.flows.length,
          activeIndex: options.activeIndex || 0
        })
      }
    });
    this.loadShopInfo();
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

  //自定义字段排序处理
  sortEnrollTap: function (e) {
    var data = {}, sortenroll = e.currentTarget.dataset.sortenroll;//parameterSort: !this.data.parameterSort
    data[sortenroll] = !this.data[sortenroll];
    this.setData(data);
  },
  sortTogger: function (e) {
    var data = {}, dataid = e.currentTarget.dataset.id, fieldData = pageServ.getData(dataid, this);
    fieldData[e.detail.sortfield.src.id].seq = e.detail.sortfield.src.seq;
    fieldData[e.detail.sortfield.target.id].seq = e.detail.sortfield.target.seq;
    //fieldData = e.detail.sort.data;
  },
  flowTogger: function (e) {
    this.setData({
      activeIndex: e.detail.index
    })
  },
  sortParamter: function (shop) {
    shop.credentials ? (shop.credentials.sort((a, b) => a.seq - b.seq), shop.credentials.forEach((v, i) => { v.seq = i })): null;
    shop.parameter ? (shop.parameter.sort((a, b) => a.seq - b.seq), shop.parameter.forEach((v, i) => { v.seq = i })) : null;  
  },
  loadShopInfo: function () {
    helperServ.showLoading({
      title: "数据加载中..."
    })
    shopServ.getShopDetail({
      shopid: this.data.shopinfo.shopid
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.data && res.result.data.length > 0) {
        var shop = res.result.data[0];
        this.sortParamter(shop);
        this.setData({
          toggerDisabled: false,
          shopinfo: shop
        })
        //都需要转换为object，在enroll组件sort,togger事件中方便处理
        this.data.shopinfo.parameter = pageServ.toObject(this.data.shopinfo.parameter, 'id');
        this.data.shopinfo.credentials = pageServ.toObject(this.data.shopinfo.credentials, 'id');
      }
      /**
       * time 20200213 22:23
       * 这里需要调整下,basedir从后台计算(考虑在getShopid的时候)
       * basedir= userinfo.basedir + "shopinfo/"+shopid;
       */
      /* delete by xiaojm
      "basedir":"shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000"（shop+userinfo.region+openid+shopid）
      this.data.shopinfo.basedir = pageServ.getCloudPath('shop') + "/" + this.data.shopinfo.shopid;
     
     if(!this.data.shopinfo.basedir || !this.data.shopinfo.basedir.trim()){
        helperServ.showModal({content:"参数错误basedir null exception!"});
        helperServ.goBack();
        return;
     }
      this.upCfg.cloudpath = this.data.shopinfo.basedir + "/base/"; */
    }).catch(err => {
      //this.data.shopinfo.basedir = pageServ.getCloudPath('shop') + "/" + this.data.shopinfo.shopid;
      /*
      if(!this.data.shopinfo.basedir || !this.data.shopinfo.basedir.trim()){
        helperServ.showModal({content:"参数错误basedir null exception!"});
        helperServ.goBack();
        return;
      }
      this.upCfg.cloudpath = this.data.shopinfo.basedir + "/base/";
      */

      helperServ.hideLoading();
      helperServ.showModal({
        content: err.message || err.errMsg
      });
    })
  },
  preStep: function (e) {
    this.setData({
      activeIndex: this.data.activeIndex - 1
    });
  },
  nextStep: function (e) {
   /*this.setData({
      activeIndex: this.data.activeIndex + 1
    });*/
    if (this.aspectFunc[this.data.activeIndex]) {
      //console.log(`outStep${this.data.activeIndex}Call`)
      var v = this.aspectFunc[this.data.activeIndex].call(this, this.data.activeIndex);
      v.then(res => {
        //console.log(`outStep${this.data.activeIndex}Call return`, res);
        this.setData({
          activeIndex: this.data.activeIndex + 1
        });
      });
    } else {
      //console.log(`direct outStep${this.data.activeIndex}`)
      this.setData({
        activeIndex: this.data.activeIndex + 1
      });
    }
  },
  checkBaseInfo: function (flowid) {
    return new Promise((resolve, reject) => {
      var field = V.V(this.shopFormat, this.data.shopinfo, "shopinfo", this.data.shopinfo, this.data.shopinfo, null);
      this.data.focusSet = {};
      if (field) {
        this.data.focusSet[helperServ.subStrByPos(field.path, 2)] = true;
        //console.log('*********V.V*********', field, helperServ.subStrByPos(field.path, 2))
        helperServ.showToast({
          title: field.errMsg,
          icon: 'none'
        });
      } else {
        resolve(null);
      }
      this.setData({
        "focusSet": this.data.focusSet
      });
    })
  },
  uploadImg: function (cb) {
    helperServ.showLoading({
      title: '图片上传中...',
    });
    var imgarr = [],
      item = null;
    Array.prototype.push.apply(imgarr, this.data.shopinfo.picpath);
    Array.prototype.push.apply(imgarr, this.data.shopinfo.imginfo);
    for (var i in this.data.shopinfo.credentials) {
      var field = this.data.shopinfo.credentials[i];
      if (field.type === '5' || field.type === 'a' || field.type === 'b') {
        if (field.value && field.value.length > 0) {
          Array.prototype.push.apply(imgarr, field.value);
        }
      }
    }
    for (var i in this.data.shopinfo.parameter) {
      var field = this.data.shopinfo.parameter[i];
      if (field.type === '5' || field.type === 'a' || field.type === 'b') {
        if (field.value && field.value.length > 0) {
          Array.prototype.push.apply(imgarr, field.value);
        }
      }
    }
    //console.log("**********",imgarr);
    /**mod by xiaojm at 20200214 */
    if(!this.data.shopinfo.basedir || !this.data.shopinfo.basedir.trim()){
      /**
       * const basedir =  userinfo.basedir + "shop/"+shopid;
       * 临时的
       */
      this.data.shopinfo.basedir =  this.userinfo.basedir+"shop/"+this.data.shopinfo.shopid+"/";
    }
    pageServ.upLoadFile(imgarr, this.data.shopinfo.basedir, cb);
  },
  save: function (e) {
    this.uploadImg((err, res) => {
      if (err || !res.success) {
        helperServ.showModal({
          content: err
        });
        return;
      }
      wx.showLoading({
        title: '提交中...',
      });
      //转换为数据，显示方便
      this.data.shopinfo.credentials = this.data.shopinfo.credentials ? Object.values(this.data.shopinfo.credentials).sort((a, b) => {
        return a.seq - b.seq;
      }) : null;
      this.data.shopinfo.parameter = this.data.shopinfo.parameter ? Object.values(this.data.shopinfo.parameter).sort((a, b) => {
        return a.seq - b.seq;
      }) : null;

      shopServ.createShop({
        shopinfo: this.data.shopinfo
      }).then(res => {
        helperServ.hideLoading();
        if (res.result.success == 1) {
          this.data.shopinfo._id = res.result._id;
          this.setData({
            toggerDisabled: false
          });
          if(!res.result.basedir || !res.result.basedir.trim()){
            helperServ.showModal({
              content:"店铺配置目录空异常"
            });
            return;
          }
          //mod by xiaojm 20200214 后台返回的basedir
          this.data.shopinfo.basedir = res.result.basedir;
          helperServ.addUserShopInfo(res.result.data, helperServ.getUserInfo(), this.data.shopinfo);
          helperServ.showModal({
            content: res.result.errMsg,
            success: (ok) => {
              if (ok.confirm) {
                helperServ.goBack();
              }
            }
          })
        } else {
          helperServ.showModal({
            content: res.result.errMsg
          })
        }
      }).catch(err => {
        helperServ.hideLoading();
        helperServ.showModal({
          title: '异常提示',
          content: err.errMsg || err.message
        })
      });
    });
  },
  delImg: function (e, cb) {
    pageServ.delImg(e, this, cb);
  },
  chooseImg: function (e) {
    var initflag = e.currentTarget.dataset.initflag;
    pageServ.chooseImg(e, this, initflag ? this.upCfg : null);
  },
  previewImg: function (e) {
    var img = e.currentTarget.dataset.src;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: this.upimg.imginfo.map(v => v.fileID || v.path) // 需要预览的图片http链接列表
    })
  },
  chooseLocation: function () {
    helperServ.showLoading();
    app.chooseLocation((res) => {
      helperServ.hideLoading();
      console.log("chooseLocation", res);
      this.setData({
        "shopinfo.address": res.address || "",
        "shopinfo.latitude": res.latitude || 0,
        "shopinfo.longitude": res.longitude || 0
      });
    });
  },
  inputTogger: function (e) {
    pageServ.inputTogger(e, this);
  },
  inputTogger2: function (e) {
    var data = {}, dataid = e.currentTarget.dataset.id, fieldData = pageServ.getData(dataid, this);
    if (!fieldData[e.detail.field.id]) {
      return;
    }
    //this.data.shopinfo.parameter[e.detail.field.id].value = e.detail.field.value;
    if (!e.detail.field.type) {
      fieldData[e.detail.field.id].value = e.detail.field.value;
    } else {
      fieldData[e.detail.field.id].text = e.detail.field.value;
    }
    //console.log("*******", this.data.shopinfo.parameter[e.detail.field.id], e.detail.field);
  },
  chooseSector: function (e) {
    helperServ.goToPage("../categorysel/categorysel?catetype=2");
  },
  goToPage: function (e) {
    pageServ.goToPage(e, this);
  },
  showParameterDlg: function (e) {
    var id = e.currentTarget.id, type = e.currentTarget.dataset.type, self = this,
      parameter = {}, dataItem = pageServ.getData(id, this), data = {};
    if (Array.isArray(dataItem)) {
      for (var i in dataItem) {
        parameter[dataItem[i].id] = dataItem[i];
      }
    } else {
      parameter = dataItem;
    }
    this.setData({
      parameterType: type
    })
    var myDlg = this.selectComponent('#parameterDlg');
    myDlg.showDlg({
      title: '新增对话框',
      enrollinfo: parameter || {},
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        if (e.btnindex == 0) {
          cb(null);
          return;
        } else {
          if (e.enrollinfo) {
            for (var k in e.enrollinfo) {
              if (parameter && parameter[k]) {
                e.enrollinfo[k].value = parameter[k].value;
              }
            }
            data[id] = e.enrollinfo;
            this.setData(data)
          }
          cb(null);
        }
      },
    });
  },
})