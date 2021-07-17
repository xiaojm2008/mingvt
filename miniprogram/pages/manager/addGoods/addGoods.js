const flow = require('../../../lib/comm/flows.js').goodsFlow;
const goodsServ = require('../../../lib/manager/goods.js');
const helperServ = require('../../../lib/utils/helper.js');
const pageServ = require('../../../lib/utils/pagehelper.js');
const commServ = require('../../../lib/manager/comm.js');
const cache = require("../../../lib/utils/cache.js");
const mixed = require("../../../lib/services/mixed.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const upimg = require("../../../lib/utils/upimg.js");
const constants = require("../../../lib/comm/constants.js");
const restore = require("../../../lib/utils/restore.js");
//const goToPage = require('../../../lib/comm/goToPage.js');
const fieldFormat = require("../../../lib/manager/comm.js").fieldFormat;
const V = require('../../../lib/utils/validate.js');
var app = getApp();
Page({
  aspectInFunc: [null, null, null, null, null, null], //nextStep中执行
  aspectFunc: [null, null, null, null, null, null], //nextStep中执行
  preAspectFunc: [null, null, null, null, null, null], //preStep中执行
  preAspectFuncBefore: [null, null, null, null, null, null], //preStep中执行
  /**
   * 页面的初始数据
   */
  data: {
    btnShow: true,
    activeIndex: 0,
    toggerDisabled: true,
    flows: null,
    showPicker: false,
    focusSet: {},
    //selCategory: [0, 0, 0],
    goodsinfo: {
      shopid: 'S0000',
      shopname: 'XXXX',
      delivery: {
        areainfo: ["广东省", "深圳市", "宝安区"]
      }
      //parameter: {}
    },
    //goodsinfo: { delivery: { areainfo:  ["广东省", "广州市", "越秀区"]  }},
    upCfg: {
      cloudpath: null,
      compressrate: 10,
      maxcount: 4,
      maxwidth: 640,
      maxheight: 200,
      cutimg: true,
      imgtype: 'jpg'
    },
    dict: {
      "100000": null,
      "100001": null,
      "100002": null,
      "100003": null,
      "100004": null,
      "100010": null,
      "100011": null,
      "100014": null,
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.userinfo = helperServ.getUserInfo();
    if (!this.userinfo.shopinfo || !this.userinfo.shopinfo.basedir) {
      helperServ.showModal({
        content: "用户参数异常，请修改重新选择并且修改店铺信息",
        success: (res) => {
          if (res.confirm) {
            helperServ.goToPage('/pages/manager/listShop/listShop?frompage=addGoods');
          }
        }
      });
      return;
    }
    this.data.goodsinfo.shopid = this.userinfo.shopinfo.shopid;
    this.data.goodsinfo.shopname = this.userinfo.shopinfo.shopname;
    this.aspectFunc[0] = this.checkBaseInfo;
    //this.aspectFunc[1] = this.checkBaseInfo;
    this.aspectFunc[2] = this.checkBaseInfo;
    this.aspectFunc[1] = this.initModelsItem;
    this.aspectFunc[4] = this.initDescription;
    //this.preAspectFuncBefore[3] = this.transModelsToArray;
    this.goodsno = options.goodsno ? options.goodsno : null;
    restore.setEnrollInfo(this.goodsno, null);
    this.commLoad();
  },
  cate2SubID(cate) {
    var upd = false,
      arr = cate.map((v => {
        if (v.img) {
          if (!upd) {
            upd = true;
          }
          return {
            code: v.code,
            name: v.name,
            nodeindex: v.nodeindex
          }
        } else {
          return v;
        }
      }));
    return upd ? arr : null;
  },
  showSubIdDlg: function(e) {
    var myDlg = this.selectComponent('#myCategory');
    var subid = this.data.goodsinfo.subid,
      count = 0,
      category = {};
    const maxlength = 3;
    subid = Array.isArray(subid) ? subid : null;
    count = subid && subid.length || 0;
    if (subid && subid.length > 0) {
      subid.forEach(v => {
        category[v.code] = v;
      })
    }
    myDlg.show({
      maxcount: maxlength,
      nodeindex: subid && subid.map(v => v.nodeindex),
      callback: (catenode, okBtn) => {
        if (count > maxlength) {
          --count;
          return;
        } else {
          if (catenode) {
            if (!catenode.active) {
              --count;
              delete category[catenode.code];
            } else if (count < maxlength) {
              ++count;
              category[catenode.code] = catenode;
            }
          }
        }
        if (count === maxlength || okBtn) {
          var arr = this.cate2SubID(Object.values(category));
          if (arr && arr.length > 0) {
            this.setData({
              "goodsinfo.subid": arr
            })
          }
          myDlg.hide();
        }
      }
    });
  },
  sortParamter: function(goods) {
    goods.ensure ? goods.ensure.sort((a, b) => a.seq - b.seq) : null;
    goods.parameter ? goods.parameter.sort((a, b) => a.seq - b.seq) : null;
    goods.ensure&&goods.ensure.forEach((v, i) => {
      v.seq = i
    });
    goods.parameter&&goods.parameter.forEach((v, i) => {
      v.seq = i
    });
  },
  goodsLoad: function() {
    helperServ.showLoading({
      title: "数据加载中..."
    });
    goodsServ.getGoodsDetail({
      goodsno: this.goodsno
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.data) {
        var goods = res.result.data;
        this.sortParamter(goods);
        if(goods.imginfo && goods.imginfo.length>0){
          this.data.upCfg.maxheight = goods.imginfo[0].height;
          this.data.upCfg.maxwidth = goods.imginfo[0].width;
        }
        //转换models，按seq排序。
        if(goods.models){
          this.data.goodsModels = pageServ.toValues(goods.models).sort((a, b) => a.seq - b.seq);
          //goods.models ? goods.models : null;
        }
        this.setData({
          goodsModels:goods.models?this.data.goodsModels:null,
          goodsinfo: goods,
          "upCfg.maxwidth":this.data.upCfg.maxwidth,
          "upCfg.maxheight":this.data.upCfg.maxheight
        });
        //都需要转换为object，在enroll组件sort,togger事件中方便处理
        this.data.goodsinfo.parameter = pageServ.toObject(this.data.goodsinfo.parameter, 'id');
        this.data.goodsinfo.ensure = pageServ.toObject(this.data.goodsinfo.ensure, 'id');
        //helperServ.setStorage(constants.STKEY_GOODSDETAIL, res.result.data[0]).then(res => {});
        restore.setEditorDelta(this.goodsno, goods.description);
      } else {
        helperServ.showModal({
          'content': res.result.errMsg || '商品不存在'
        })
      }
    }).catch(res => {
      helperServ.showModal({
        'content': res.errMsg || res.message || '未知'
      })
    });
  },
  //自定义字段排序处理
  sortEnrollTap: function(e) {
    var data = {},
      sortenroll = e.currentTarget.dataset.sortenroll; //parameterSort: !this.data.parameterSort
    data[sortenroll] = !this.data[sortenroll];
    this.setData(data);
  },
  /*
  sortSubIdEnrollTap: function (e) {
    this.setData({
      subIdSort: !this.data.subIdSort
    })
  },
  sortEnsureEnrollTap: function (e) {
    this.setData({
      ensureSort: !this.data.ensureSort
    })
  },*/
  //不用了
  loadGoodsCategory: function() {
    var category = helperServ.getStorageSync(constants.STKEY_GOODSCATEGORY);
    if (!category) {
      helperServ.showLoading({
        title: "数据加载中..."
      });
      goodsServ.getCategory({}).then(res => {
        helperServ.hideLoading();
        if (res.result && res.result.data && res.result.data.length > 0) {
          helperServ.setStorage(constants.STKEY_GOODSCATEGORY, res.result.data).then(res => {});
          this.setData({
            vgno: res.result.data
          });
          this.bindPickerChange({
            detail: {
              value: [0, 0, 0]
            }
          });
        }
      });
    } else {
      this.setData({
        vgno: category
      });
      this.bindPickerChange({
        detail: {
          value: [0, 0, 0]
        }
      });
    }
  },
  loadStateInfo: function() {
    pageServ.loadStateInfo(this);
  },
  /*
  sub:{subid,subname}
  models:{id,name,submodels:{subid:sub}}
  keys:Object.toValues(models).map(v=>v.id): array
  */
  composeSub: function (subid, models, excludeMs, mlen, composeArr, composeMap, keys) {

    for (var key in models) {
      var modelid = models[key].id;
      if (modelid != keys[subid.length]) {
        continue;
      }
      var exclude = excludeMs[modelid] ? excludeMs[modelid].exclude : false;
      if (exclude) {
        continue;
      } else {
        //var model = models[modelid];
         var model = models[key];
        excludeMs[modelid] = {
          exclude: true
        };
        for (var _subid in model.submodels) {
          //var  _subid =  model.submodels[_key].subid;
          subid.push(_subid);
          var submodel = model.submodels[_subid];
          composeArr.push(submodel);
          if (mlen == composeArr.length) {
            var tmp = subid.toString();
            if (!this.data.goodsinfo.modelitems || !this.data.goodsinfo.modelitems[tmp]) {
              if (composeArr.length == 1) {
                composeMap[tmp] = Object.assign({}, composeArr[0]);
              } else {
                composeMap[tmp] = composeArr.reduce((pre, cur, i, arr) => {
                  return {
                    subname: pre.subname + "|" + cur.subname,
                    subid: pre.subid + "," + cur.subid,
                    modelstr: pre.subname + "," + cur.subname,
                    price:'',
                    stock:''
                  };
                  /*
                  if(mainModel && i === mainModel_idx){
                    mainModel.submodels[cur.subid].price &&(tmp.price = mainModel.submodels[cur.subid].price);
                    mainModel.submodels[cur.subid].stock&&(tmp.stock = mainModel.submodels[cur.subid].stock);
                  }*/
                });
              }
            } else {
              composeMap[tmp] = this.data.goodsinfo.modelitems[tmp];
            }
            subid.pop();
            composeArr.pop();
            continue;
          }
          this.composeSub(subid, models, excludeMs, mlen, composeArr, composeMap, keys);
        }
        excludeMs[modelid].exclude = false;
        composeArr.pop();
        subid.pop();
      } // else exclude
    }
  },
  initModelsItem: function() {
    return new Promise((resovle, reject) => {
      //var models = this.data.goodsinfo.models,
      //使用中间变量 goodsModels
      var models = this.data.goodsModels,
        excludeMs = {},
        composeArr = [],
        composeMap = {},
        subid = [];
      if (!models) {
        resovle(null);
        return;
      }
      var field = V.V(this.fieldFormat.model, this.data.goodsModels, "models",this.data.goodsinfo, this.data.goodsModels,null);
      this.data.focusSet = {};
      if (field) {
        this.data.focusSet[helperServ.subStrByPos(field.path, 2)] = true;
        this.setData({
          "focusSet": this.data.focusSet
        });
        //console.log('*********V.V*********', field, this.subStrByPos(field.path, 2))
        helperServ.showToast({
          title: field.errMsg,
          icon: 'none'
        });
        return;
      }

      //var modelids = Object.keys(models),
      var modelids =  models.map(v=>v.id),
        mlen = modelids?modelids.length:0;
      if (mlen == 0) {
        this.setData({
          'goodsinfo.modelitems': null,
          "goodsinfo.models_mainkey_idx": -1,
          "focusSet": this.data.focusSet
        });
        resovle(null);
        return;
      }
      /*不用Object，而用array,那么models就不要这样处理获取mainModel
      var mainModel = null, mainModelIdx = 0;
      for (var k in models) {
        if (models[k].mainflag) {
          mainModel = models[k];
          break;
        }
        mainModelIdx++;
      }*/
      var mainModel = null, mainModelIdx = -1;
      if(this.data.goodsinfo.models_mainkey){
        mainModel = models[this.data.goodsinfo.models_mainkey_idx], mainModelIdx = this.data.goodsinfo.models_mainkey_idx;
      }
      //this.data.goodsinfo.modelitems = this.data.goodsinfo.modelitems || {};
      this.composeSub(subid, models, excludeMs, mlen, composeArr, composeMap, modelids);
      if (mainModel){
        var modelitem = null, kArr = null, subkey=null,submodel=null;
        for (var k in composeMap) {
          modelitem = composeMap[k];
          kArr = k.split(",");
          if (kArr.length <= mainModelIdx) {
            break;
          }
          subkey = kArr[mainModelIdx];
          submodel = mainModel.submodels[subkey];
          !modelitem.price ? submodel.price && (modelitem.price = submodel.price):null;
          !modelitem.stock ? submodel.stock && (modelitem.stock = submodel.stock):null;
        }
      }
      //console.log("composeMap", composeMap, Object.keys(composeMap).length);
      this.setData({
        'goodsinfo.modelitems': composeMap,
        "goodsinfo.models_mainkey_idx": mainModel?mainModelIdx:-1,
        "focusSet": this.data.focusSet
      });
      //console.log('modelitem', composeMap);
      resovle(null);
    });
  },
  initDescription: function() {
    var self = this;
    return new Promise((resolve, reject) => {
      this.selectComponent('#myEditor').getContents({
        success(res) {
          if (res.delta) {
            self.data.goodsinfo.description = res.delta;
            //self.data.goodsinfo.description2 = res.html;
            self.setData({
              "goodsinfo.description2": res.html
            });
            resolve({
              success: true
            });
          }
        },
        fail(err) {
          helperServ.showModal({
            content: err.errMsg
          });
          resolve({
            success: false
          });
        }
      });
    });
  },
  checkModels: function() {

  },
  checkBaseInfo: function(flowid) {
    return new Promise((resolve, reject) => {
      if (!this.fieldFormat || !this.fieldFormat.baseInfo) {
        resolve(null);
        return;
      }
      var field = null;
      if (flowid == 0) {
        field = V.V(this.fieldFormat.baseInfo, this.data.goodsinfo, "goodsinfo", this.data.goodsinfo, this.data.goodsinfo,null);
      } else if (flowid == 1) {
        field = V.V(this.fieldFormat.model, this.data.goodsModels, "models",  this.data.goodsinfo, this.data.goodsModels,null);
      } else if (flowid == 2) {
        field = V.V(this.fieldFormat.modelItem, this.data.goodsinfo.modelitems, "modelitems", this.data.goodsinfo, this.data.goodsinfo.modelitems, null);
      }
      this.data.focusSet = {};
      if (field) {
        this.data.focusSet[helperServ.subStrByPos(field.path, 2)] = true;
        this.setData({
          "focusSet": this.data.focusSet
        });
        //console.log('*********field V*********', field, this.subStrByPos(field.path, 2))
        helperServ.showToast({
          title: field.errMsg,
          icon: 'none'
        });
      } else {
        resolve(null);
        if (flowid == 0) {
          //必须setData，要不回退到第一步，不能回显
          this.setData({
            "focusSet": this.data.focusSet,
            'goodsinfo.parameter': this.data.goodsinfo.parameter
          })
        } else {
          this.setData({
            "focusSet": this.data.focusSet
          });
        }
      }
    });
  },
  commLoad: function() {
    //helperServ.showLoading({content:"数据加载中..."});
    cache.getDict(Object.keys(this.data.dict), (err, res) => {
      if (err) {
        return;
      }
      var userInfo = helperServ.getUserInfo();
      if (!userInfo.openid) {
        helperServ.showModal({
          content: "用户初始化失败！"
        });
        return;
      }
      app.setUserInfo(userInfo);
      //"basedir":"shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000"（shop+userinfo.region+openid+shopid）
      /**
       * time 20200213 22:23
       * 这里需要调整下,basedir从后台计算(考虑在getShopid的时候)
       * basedir= userinfo.basedir + "shopinfo/"+shopid;
       */
      this.setData({
        dict: res,
        //'upCfg.cloudpath': this.userinfo.shopinfo.basedir + "/goods/" + (this.goodsno ? this.goodsno + '/' : `new_${helperServ.curDate()}/`),
        flows: flow
      })
      if (this.goodsno) {
        this.goodsLoad();
      }
      //不用了。
      //this.loadGoodsCategory();
      //loadStateInfo不需要了
      //this.loadStateInfo();
      fieldFormat({}).then(res => {
        this.fieldFormat = res.result.goods;
      });
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var _self = this;
    wx.getSystemInfo({
      success: function(res) {
        _self.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },
  chooseCategory: function(e) {
    helperServ.goToPage("/pages/manager/categorysel/categorysel?catetype=1");
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
  _preStep: function(e) {
    this.setData({
      activeIndex: this.data.activeIndex - 1
    });
    var v = this.preAspectFunc[this.data.activeIndex];
    if (v) {
      //console.log(`inStep${this.data.activeIndex}Call`)
      v.call(this).then(res => {
        //console.log(`inStep${this.data.activeIndex}Call return`, res);
      });
    } else {
      //console.log(`direct inStep${this.data.activeIndex}`)
    }
  },
  preStep: function(e) {
    //console.log(`preStep activeIndex= ${this.data.activeIndex}`)
    var v1 = this.preAspectFuncBefore[this.data.activeIndex];
    if (v1) {
      v1.call(this).then(res => {
        this._preStep(e);
      });
    } else {
      this._preStep(e);
    }
  },
  nextStep: function(e) {
    //console.log('step', this.aspectFunc[this.data.activeIndex])
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
  delImg: function(e, cb) {
    pageServ.delImg(e, this, cb);
  },
  chooseImg: function(e) {
    var initflag = e.currentTarget.dataset.initflag;
    pageServ.chooseImg(e, this, initflag ? this.data.upCfg : null);
  },
  //未被调用的方法，删除
  chooseSubModelImg: function (e) {
    var index = e.currentTarget.dataset.index,
      subid = e.currentTarget.dataset.subid,
      submodel = this.data.goodsModels[index].submodels[subid];
    //initflag,maxcount 选择图片需要用
    e.currentTarget.dataset.initflag = true;
    e.currentTarget.dataset.maxcount = 1;
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
      var data = {};
      data[`goodsinfo.models.${index}.submodels.${subid}.picpath`] = {
        path: curimg[0].path,
        height: curimg[0].height,
        width: curimg[0].width
      };
      this.setData(data);
    });
  },
  inputTogger: function(e) {
    pageServ.inputTogger(e, this);
  },
  bindProvinceChange: function(e) {
    var id = e.currentTarget.id;
    var data = {};
    data[id] = e.detail.value;
    //console.log('bindProvinceChange', data[id]);
    this.setData(data);
  },
  addModel: function(e) {
    var models =  this.data.goodsModels || [];
    //var keys = Object.keys(models);
    if (models.length > 5) {
      helperServ.showModal({
        title: '提示',
        content: '最多只能5种商品属性'
      })
      return;
    }
    var model_key = mySeq.S4(),
      subid = mySeq.S4();//mySeq.rStr(4);
      /*
    if(this.data.goodsinfo.models){
      while(this.data.goodsinfo.models[model_key]){
        model_key = mySeq.rStr(4);
        console.log(`*******model_key ${model_key} redo***********`)
      }
      if(this.data.goodsinfo.models[model_key] && this.data.goodsinfo.models[model_key].submodels){
        while(this.data.goodsinfo.models[model_key].submodels[subid]){
          subid = mySeq.rStr(4);
          console.log(`*******subid ${subid} redo***********`)
        }
      }
    }*/
    var model_val = {
      //"seq":this.data.goodsinfo.models?Object.keys(this.data.goodsinfo.models).length:0,
      "id": model_key,
      "name": "",
      "submodels": {}
    };
    model_val.submodels[subid] = {
      subid: subid,
      subname: ""
    };
    var data = {};
    //data[`goodsinfo.models.${model_key}`] = model_val;
    data[`goodsModels[${models.length}]`] = model_val;    
    this.setData(data);
  },
  showHelper: function(e) {

  },
  /**
   * 指定型号上传图片
   */
  setImgFlg: function(e) {
    var index = e.currentTarget.dataset.index;
    var data = {};
    if (this.data.goodsinfo.models_mainkey && this.data.goodsModels[this.data.goodsinfo.models_mainkey_idx]) {
      //data[`goodsinfo.models.${this.data.goodsinfo.models_mainkey}.mainflag`] = false;
      data[`goodsModels[${this.data.goodsinfo.models_mainkey_idx}].mainflag`] = false;
    }
    this.data.goodsinfo.models_mainkey_idx = index;   
    this.data.goodsinfo.models_mainkey = this.data.goodsModels[index].id;
     //data[`goodsinfo.models.${index}.mainflag`] = true; 
    data[`goodsModels[${index}].mainflag`] = true;
    this.setData(data);
  },

  addModelItem: function(e) {
    var index = e.currentTarget.dataset.index;
    var subid = mySeq.rStr(4);
    while(this.data.goodsModels[index].submodels[subid]){
      subid = mySeq.rStr(4);
      console.log(`******addModelItem subid ${subid} redo*******`);
    }
    var data = {};
    /*
    models加载完成会转换为数组，这里删除，当然存储还是用object
    data[`goodsinfo.models.${index}.submodels.${subid}`] = {
      subid: subid,
      subname: ''
    };*/
    //goodsinfo.models ->goodsModels
    data[`goodsModels[${index}].submodels.${subid}`] = {
      subid: subid,
      subname: ''
    };
    //console.log(`addModelItem`, data);
    this.setData(data);
  },
  delSubModelItem: function(e) {
    var index = e.currentTarget.dataset.index,
      subid = e.currentTarget.dataset.subid,
      submodels = this.data.goodsModels[index].submodels;
    var data = {};
    delete submodels[subid];
    
    if (!submodels || Object.keys(submodels) == 0) {
      //使用数组，这里逻辑也需要调整
      //delete this.data.goodsinfo.models[index];
      this.data.goodsModels.splice(index,1);
      this.setData({
        'goodsModels': this.data.goodsModels
      });
      return;
    }
    //使用数组，这里逻辑也需要调整
    //data[`goodsinfo.models.${index}.submodels`] = submodels;
    data[`goodsModels[${index}].submodels`] = submodels;
    //console.log(`delSubModelItem`, data);
    this.setData(data);
  },
  delSubModel: function(e) {
    var index = e.currentTarget.dataset.index,
      pack = e.currentTarget.dataset.pack,
      data = {},
      mitem = this.data.goodsinfo.modelitems[index];
    /**
     * {
     *  subname:'',
     *  subid:'',
     *  price:,
     *  stock
     *  picpath
     * }
     */
    if (mitem.picpath && mitem.picpath.status == '2') {
      helperServ.showLoading({
        content: '删除处理中...'
      });
      pageServ.delImg2(mitem.picpath, (err, del, delidx) => {
        helperServ.hideLoading();
        delete this.data.goodsinfo.modelitems[index];
        data["goodsinfo.modelitems"] = this.data.goodsinfo.modelitems;
        this.setData(data);
      });
    } else {
      delete this.data.goodsinfo.modelitems[index];
      data["goodsinfo.modelitems"] = this.data.goodsinfo.modelitems;
      this.setData(data);
    }
  },
  //该方法不用了
  bindPickerChange: function(e) {
    const val = e.detail.value;
    const vgno = this.data.vgno || [];
    const deptid = vgno[val[0]] && vgno[val[0]].items && vgno[val[0]].items.length > 0 ? vgno[val[0]].items : [];
    const subid = deptid[val[1]] && deptid[val[1]].items && deptid[val[1]].items.length > 0 ? deptid[val[1]].items : [];
    this.setData({
      selCategory: val,
      "goodsinfo.vgno": vgno[val[0]] ? vgno[val[0]].code || '' : '',
      "goodsinfo.deptid": deptid[val[1]] ? deptid[val[1]].code || '' : '',
      "goodsinfo.subid": subid[val[2]] ? subid[val[2]].code || '' : '',
      "vgno_name": vgno[val[0]] ? vgno[val[0]].name || '' : '',
      "deptid_name": deptid[val[1]] ? deptid[val[1]].name || '' : '',
      "subid_name": subid[val[2]] ? subid[val[2]].name || '' : ''
    })
    //console.log(`select vgno:${this.data.goodsinfo.vgno},deptid:${this.data.goodsinfo.deptid}`, this.data.goodsinfo.subid);
    //console.log(`select vgno:${this.data.vgno_name},deptid:${this.data.deptid_name}`, this.data.subid_name);
  },
  //该方法不用了
  showPickerView: function(e) {
    this.setData({
      showPicker: !this.data.showPicker
    })
  },
  /*
  inputTogger2: function(e) {
    var data = {};
    if (!this.data.goodsinfo.parameter[e.detail.field.id]) {
      return;
    }
    this.data.goodsinfo.parameter[e.detail.field.id].value = e.detail.field.value;
    //console.log("*******", this.data.goodsinfo.parameter[e.detail.field.id], e.detail.field);
  },*/
  sortTogger: function(e) {
    var data = {},
      dataid = e.currentTarget.dataset.id,
      fieldData = pageServ.getData(dataid, this);
    fieldData[e.detail.sortfield.src.id].seq = e.detail.sortfield.src.seq;
    fieldData[e.detail.sortfield.target.id].seq = e.detail.sortfield.target.seq;
    //fieldData = e.detail.sort.data;
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
  },
  //var myEnroll = this.selectComponent('#myEnroll')
  //var enrollinfo = myEnroll.getValue(true).data||{};
  //console.log("**********",enrollinfo);
  /*
  showParameterDlg: function(e) {
    var self = this, parameter = {};
    if (Array.isArray(this.data.goodsinfo.parameter)){
      for (var i in this.data.goodsinfo.parameter){
        parameter[this.data.goodsinfo.parameter[i].id] = this.data.goodsinfo.parameter[i];
      }
    } else {
      parameter = this.data.goodsinfo.parameter;
    }
    var myDlg = this.selectComponent('#parameterDlg');
    myDlg.showDlg({
      title: '新增对话框',
      enrollinfo: parameter,
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        if (e.btnindex == 0) {
          cb(null);
          return;
        } else {
          if (e.enrollinfo) {
            for (var k in e.enrollinfo) {
              if (parameter[k]) {
                e.enrollinfo[k].value = parameter[k].value;
              }
            }
            this.setData({
              "goodsinfo.parameter": e.enrollinfo
            })
          }
          cb(null);
        }
      },
    });
  },*/
  showIndexListChoose:function(e){
    var catetype = e.currentTarget.dataset.catetype;
    if(!catetype){
      return;
    }
    var currPage = helperServ.getCurrPage();
    var options = currPage.options;

    options.nextPageCallBack = (err, info) => {
      var data = {};
      data[e.currentTarget.id] = {
        code:info.code,
        name:info.name
      }
      this.setData(data);
    }
    helperServ.goToPage("/pages/indexlist/indexlist?catetype="+catetype);
  },
  showParameterDlg: function(e) {
    var id = e.currentTarget.id,
      type = e.currentTarget.dataset.type,    
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
  showMultiCheckDlg: function(e) {
    pageServ.showMultiCheckDlg(e, this);
  },
  uploadImg: function(cb) {
    helperServ.showLoading({
      title: '图片上传中...',
    });
    var imgarr = [],
      item = null;
    Array.prototype.push.apply(imgarr, this.data.goodsinfo.picpath);
    //Array.prototype.push.apply(imgarr, this.data.goodsinfo.imginfo);
   for(var u in this.data.goodsinfo.imginfo){
     var img = this.data.goodsinfo.imginfo[u];
     if(img.height != this.data.upCfg.maxheight){
       img.height = this.data.upCfg.maxheight;
     }
     if(img.width != this.data.upCfg.maxwidth){
       img.width = this.data.upCfg.maxwidth;
     }
     imgarr.push(img);
   }
    for (var k in this.data.goodsinfo.modelitems) {
      item = this.data.goodsinfo.modelitems[k];
      if (item.picpath && item.picpath.path) {
        imgarr.push(item.picpath);
      }
    }
    for (var i in this.data.goodsinfo.ensure) {
      var field = this.data.goodsinfo.ensure[i];
      if (field.type === '5' || field.type === 'a' || field.type === 'b') {
        if (field.value && field.value.length > 0) {
          Array.prototype.push.apply(imgarr, field.value);
        }
      }
    }
    for (var i in this.data.goodsinfo.parameter) {
      var field = this.data.goodsinfo.parameter[i];
      if (field.type === '5' || field.type === 'a' || field.type === 'b') {
        if (field.value && field.value.length > 0) {
          Array.prototype.push.apply(imgarr, field.value);
        }
      }
    }
    if (this.data.goodsinfo.models_mainkey){
      var model = this.data.goodsModels[this.data.goodsinfo.models_mainkey_idx];
      for(var j in model.submodels){
        var submodel = model.submodels[j];
        if (submodel.picpath && submodel.picpath.path){
          imgarr.push(submodel.picpath);
        }
      }
    }
    
    var basedir = null;
    if(this.goodsno){
      basedir = this.data.goodsinfo.basedir; 
      if(!basedir || !basedir.trim()){
        basedir = this.userinfo.shopinfo.basedir + "goods/" +  `${this.goodsno}/`;
      }
    } else {
      basedir = this.userinfo.shopinfo.basedir + "goods/" +  `new_${helperServ.curDate()}/`;
    }

  
    //console.log("**********",imgarr);
    pageServ.upLoadFile(imgarr, basedir, cb);
  },
  save: function() {
    this.uploadImg((err, res) => {
      if (!res.success) {
        helperServ.showModal({
          content: err
        });
        return;
      }
      helperServ.showLoading({
        title: '提交中...',
      });
      delete this.data.goodsinfo.description2;
      var action = null;
      if (this.goodsno) {
        action = goodsServ.modGoods;
        //delete this.data.goodsinfo._id;
      } else {
        action = goodsServ.addGoods;
      }
      this.data.goodsinfo.ensure = this.data.goodsinfo.ensure ? pageServ.toValues(this.data.goodsinfo.ensure).sort((a,b)=>a.seq-b.seq) : null;
      this.data.goodsinfo.parameter = this.data.goodsinfo.parameter ? pageServ.toValues(this.data.goodsinfo.parameter).sort((a,b)=>a.seq-b.seq) : null;
      
      if(this.data.goodsModels && this.data.goodsModels.length>0){
        var seq = 0;
        this.data.goodsinfo.models={};
        for(var key in this.data.goodsModels){
          var model = this.data.goodsModels[key];
          model.seq = seq++;
          this.data.goodsinfo.models[model.id] = model;
        }
      } else {
        this.data.goodsinfo.models = null;
      }
      
      action({
        goodsinfo: this.data.goodsinfo
      }).then(res => {
        helperServ.hideLoading();
        if (res.result.success) {
          helperServ.showModal({
            title: '处理成功',
            content: res.result.errMsg,
            success: (ok) => {
              if (ok.confirm) {
                helperServ.goBack();
              }
            }
          })
        } else {
          helperServ.showModal({
            title: '提交失败',
            content: res.result.errMsg
          })
        }
      }).catch(err => {
        helperServ.showModal({
          title: '异常提示',
          content: err.errMsg
        })
      });
    });
  },
  hideBottomOperBtn: function(e) {
    this.setData({
      btnShow: e.detail.show
    })
  }
})