const shopServ = require('../../../lib/manager/shop.js');
const helperServ = require('../../../lib/utils/helper.js');
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const upimg = require("../../../lib/utils/upimg.js");
const restore = require("../../../lib/utils/restore.js");
const fieldFormat = require("../../../lib/manager/comm.js").fieldFormat;
const V = require('../../../lib/utils/validate.js');
var app = getApp();
const MAX_IMG = 100;
/**
 * 上传店铺图片
 * 
 */
Page({

  /**
   * 页面的初始数据
   */
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
    imginfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //this.imgcate = options.imgcate || '';
    if (options.imgcate) {
      this.initDefaultImgCate(options.imgcate||'')
    }
    /**
       * time 20200213 22:23
       * 这里需要调整下,basedir从后台计算(考虑在getShopid的时候)
       * basedir= userinfo.basedir + "shopinfo/"+shopid;
    */
    if(options.shopid && options.basedir && options.basedir.trim()){
      this.shopid = options.shopid;
      this.upCfg.cloudpath = options.basedir + "/extimg/";
    } else {
      this.userinfo = helperServ.getUserInfo();
      if (!this.userinfo.shopinfo || !this.userinfo.shopinfo.basedir) {
        helperServ.showModal({
          content: "用户参数异常，请修改重新选择并且修改店铺信息",
          success: (res) => {
            if (res.confirm) {
              helperServ.goToPage('/pages/manager/listShop/listShop?frompage=shopPic');
            }
          }
        });
        return;
      }
      this.shopid = this.userinfo.shopinfo.shopid;     
      this.upCfg.cloudpath = this.userinfo.shopinfo.basedir + "/extimg/";
    }
    restore.setEnrollInfo(null, null);
    /*
    shopServ.getShopImg({shopid:this.shopid}).then(res=>{
      this.setData({
        shopinfo:res.result.data[0]
      })
    });*/
  },
  initDefaultImgCate: function(imgcate) {
    cache.fieldTemplate({
      temptype: "shop_imginfo",
      category: ""
    }, (err, arr) => {
      if (!err) {
        for (var k in arr) {
          var temp = arr[k];
          if (temp[imgcate]) {
            this.data.imginfo[imgcate] = temp[imgcate];
            this.data.imginfo[imgcate].active = true;
            this.setData({
              imginfo: this.data.imginfo
            })
            return;
          }
        }
      } else {
        helperServ.showModal({
          content: err
        });
      }
    });
  },
  
  uploadImg: function(cb) {
    helperServ.showLoading({
      title: '图片上传中...',
    });
    var imgarr = [],
      item = null;
    for (var i in this.data.imginfo) {
      var field = this.data.imginfo[i];
      if (field.type === '5' || field.type === 'a' || field.type === 'b') {
        if (field.value && field.value.length > 0) {
          Array.prototype.push.apply(imgarr, field.value);
        }
      }
    }
    if (imgarr.length > MAX_IMG) {
      helperServ.showModal({
        content: `最多上传${MAX_IMG}}张图片`
      });
      return;
    }
    this.data.countofimg = imgarr.length;
    //console.log("**********",imgarr);
    pageServ.upLoadFile(imgarr, this.upCfg.cloudpath, cb);
  },
  save: function(e) {
    this.uploadImg((err, res) => {
      if (!res.success) {
        helperServ.showModal({
          content: err
        });
        return;
      }
      wx.showLoading({
        title: '提交中...',
      });
      //this.data.shopinfo.parameter = this.data.goodsinfo.parameter ? Object.values(this.data.goodsinfo.parameter) : null;
      var arr = Object.values(this.data.imginfo);
      var imginfo = arr.reduce((pre, cur, a) => {
        if (!cur.value || cur.value.length === 0) {
          return pre;
        }
        return pre.concat(cur.value.map(v1 => {
          return {
            shopid: this.shopid,
            imgcate: cur.id,
            digest: v1.digest,
            fileID: v1.fileID,
            status: v1.status
          }
        }));
      }, []);

      shopServ.addShopImg({
        shopid:this.shopid,
        imginfo: imginfo
      }).then(res => {
        helperServ.hideLoading();
        helperServ.showModal({
          content: res.result.errMsg
        })
        if (res.result.success == 1) {
          this.setData({
            toggerDisabled: false
          });
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
  inputTogger2: function(e) {
    var data = {},
      dataid = e.currentTarget.dataset.id,
      fieldData = pageServ.getData(dataid, this);
    if (!fieldData[e.detail.field.id]) {
      return;
    }
    if (!e.detail.field.type) {
      fieldData[e.detail.field.id].value = e.detail.field.value;
    } else {
      fieldData[e.detail.field.id].text = e.detail.field.value;
    }
    var pages = getCurrentPages();
    if (pages.length > 1) {
      let prevPage = pages[pages.length - 2];
      data[`${dataid}`] = fieldData;
      prevPage.setData(data)
    }
  },
  showParameterDlg: function(e) {
    var id = e.currentTarget.id,
      type = e.currentTarget.dataset.type,
      self = this,
      parameter = {},
      dataItem = pageServ.getData(id, this),
      data = {};
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