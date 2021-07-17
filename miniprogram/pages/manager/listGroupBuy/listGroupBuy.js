const promServ = require('../../../lib/manager/prom.js');
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const mySeq = require("../../../lib/utils/mySeq.js");
const constants = require("../../../lib/comm/constants.js");
Page({


  /**
   * 页面的初始数据
   */
  batch_time: 0,
  tmpArr: [],
  data: {
    totalNum: 0,
    loadFinish: false,
    inList: []
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cache.getDict(["100015", "100016", "100017","100018"], (err, res) => {
      this.setData({
        dict: res
      });
      this.loadMore();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var _self = this;
    wx.getSystemInfo({
      success: function (res) {
        _self.setData({
          windowHeight: res.windowHeight
        })
      }
    });
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.data.loadFinish = false;
    this.batch_time = -1;
    this.tmpArr = [];
    this.loadMore(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  previewImg:function(e){
    var picpath = this.data.inList[parseInt(e.currentTarget.dataset.index)].picpath;
    pageServ.previewImg(picpath.value,0);
  },
  loadMore: function (isPull) {
    pageServ.loadMore(promServ.listProm, {
      batch_time: this.batch_time,
      orderby_field: ["status","updatetime"],
      orderby_type: ["desc","desc"],
      status: null,
    }, isPull, this);
  },
  getPromId: function () {
    return mySeq.S4() + mySeq.S4();
  },
  addTogger:function(e){

    this.showAddDlg(e);
  },
  modTogger:function(e){
    var index = e.currentTarget.dataset.index;    
    this.showAddDlg(e,this.data.inList[parseInt(index)],"修改");
  },
  delTogger:function(e){
    var index = e.currentTarget.dataset.index,
    item = this.data.inList[parseInt(index)];    
    helperServ.showModal({
      content: `请确认是否删除【${item.promname}】`,
      success: (res) => {
        if (res.confirm) {
          promServ.delProm({
            prom: {
              promid: item.promid  
            }
          }).then(res => {
            helperServ.showModal({
              content: res.result.errMsg
            });
            res.result.success == 1 ? this.loadMore() : null;
          }).catch(err => {
            helperServ.showModal({
              content: err.errMsg || err.message || '未知'
            });
          })
        }
      }
    });
  },

  showAddDlg: function (e, prom, title) {
    var self = this, promid=null;
    var myDlg = this.selectComponent('#modalDlg');
    if (!prom) {
      //myDlg.clearCache();
      promid = this.getPromId();
    }
    myDlg.showDlg({
      title: title ? title : '新增活动',
      cloudPath:pageServ.getCloudPath('promotion'),
      animationShow:true,
      inputlist: {
        "promid": {
          "id": "promid",
          "name": "活动ID",
          "type": "0", //信息提示
          "required": "R",
          "hidden": true,
          "value": prom ? prom.promid : promid
        },
      "promtype": {
        "id": "promtype",
        "name": "活动类型",
        "label": true,
        "type": "3",
        "dict":"dict",
        "dictlist": 100016,
        "required": "R",
        "value": prom ? prom.promtype : '0'
      },
        "promname": {
          "id": "promname",
          "name": "活动名称",
          "label": true,
          "type": "0",
          "required": "R",
          "value": prom ? prom.promname : null
        },
        "promfullname": {
          "id": "promfullname",
          "name": "活动全称",
          "label": true,
          "type": "0",
          "required": "R",
          "value": prom ? prom.promfullname : null
        },
        "limittimeflag": {
          "id": "limittimeflag",
          "name": "限时标识",
          "label": true,
          "type": "3",
          "required": "R",
          "dict":"dict",
          "dictlist": 100017,
          "value": prom ? prom.limittimeflag : "1"
        },
        "begtime": {
          "id": "begtime",
          "name": "开团时间",
          "label": true,
          "type": "x",
          "required": "R",
          "value": prom ? prom.begtime : null
        },
        "endtime": {
          "id": "endtime",
          "name": "结束时间",
          "label": true,
          "type": "x",
          "required": "R",
          "value": prom ? prom.endtime : null
        },       
        "status": {
          "id": "status",
          "name": "状态",
          "label": true,
          "type": "3",
          "required": "O",
          "dict": "dict",
          "dictlist": 100018,
          "value": prom ? prom.status : '1'
        },
        "picpath": {
          "id": "picpath",
          "name": "活动图片",
          "label": true,
          "type": "b",
          "required": "O",
          "maxwidth":780,
          "maxheight":280,
          "maxcount":1,
          "initflag": true, //initflag: false, 在初始化upimg 对象的时候，不传pack参数，即第三个参数传NULL
          "value": prom && prom.picpath ? prom.picpath : null
        },    
        "prominfo": {
          "id": "prominfo",
          "name": "活动详情",
          "type": "9",
          "required": "R",
          "length": 300,
          "label": false,
          "value": prom ? prom.prominfo : null,
          "placeholder": '请在此处介绍下活动详细规则'
        }
      },
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        if (!e.inputlist) {
          cb('e');
          return;
        }
        try {
          if (e.btnindex == 1) {
            myDlg.upLoadFile((err,res)=>{
              if(err){
                helperServ.showToast({icon:'none',title:err});
                return;
              }
              if (prom) {
                self.updProm(e.inputlist, prom, cb);
              } else {
                self.addProm(e.inputlist, cb);
              }
            })
          }
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  },
  getPromInfo:function(inputlist){
    return {
      promid: inputlist.promid.value,
      promname: inputlist.promname.value,
      promfullname: inputlist.promfullname.value,
      promtype: inputlist.promtype.value,
      limittimeflag: inputlist.limittimeflag.value,
      begtime: inputlist.begtime.value,
      endtime: inputlist.endtime.value,
      status: inputlist.status.value,
      prominfo: inputlist.prominfo.value,
      picpath:inputlist.picpath.value
    };
  },
  updProm: function (inputlist,prom,cb){
    helperServ.showLoading({content:"处理中..."})
    promServ.modProm({ prom: this.getPromInfo(inputlist) }).then(res=>{
      helperServ.showModal({ content: err.result.errMsg });
      cb(err.result.success ? null : "e");
      helperServ.hideLoading();
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({content:err.errMsg||err.message});
      cb('e');
    })
  },
  addProm: function (inputlist,cb){
    helperServ.showLoading({ content: "处理中..." })
    promServ.addProm({ prom: this.getPromInfo(inputlist)}).then(res => {
      helperServ.showModal({ content: err.result.errMsg });
      cb(err.result.success?null:"e");
      helperServ.hideLoading();
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({ content: err.errMsg || err.message });
      cb('e');
    })
  }
})