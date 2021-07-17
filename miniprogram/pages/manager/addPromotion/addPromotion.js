const helperServ = require('../../../lib/utils/helper.js');
const pageServ = require('../../../lib/utils/pagehelper.js');
const commServ = require('../../../lib/manager/comm.js');
const cache = require("../../../lib/utils/cache.js");
const mixed = require("../../../lib/services/mixed.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const upimg = require("../../../lib/utils/upimg.js");
const constants = require("../../../lib/comm/constants.js");
const restore = require("../../../lib/utils/restore.js");
const goToPage = require('../../../lib/comm/goToPage.js');
const promServ = require('../../../lib/manager/prom.js');
const fieldFormat = require("../../../lib/manager/comm.js").fieldFormat;
const flow = require('../../../lib/comm/addPromotionFlow.js').flow;
Page({

  /**
   * 页面的初始数据
   */
  formOfPromType: {},
  promTemplate: null, //数组类型，不同活动类型（promtype）对应一组输入列表字段
  prom_id: null, //对应数据库_id字段
  promtype: null, //类型
  prom: {},
  dict: {
    100015: null,
    100016: null,
    100017: null,
    100018: null
  },
  //batch_time: 0,
  data: {
    togetherProm: {
      4: true,
      5: true,
      6: true,
      7: true
    },
    activeIndex: 0,
    toggerDisabled: true,
    flows: flow,
    baseTemplate: null,
    promtypeTemplate: null,
    //totalNum: 0,
    //loadFinish: false,
    //inList: [],
  },
  deleteTempExcep: function(temp) {
    delete temp.openid;
    delete temp._id;
    delete temp.temptype;
    delete temp.tempid;
    delete temp.tempdesc;
    //return temp;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.userinfo = helperServ.getUserInfo();
    if (!this.userinfo.shopinfo || !this.userinfo.shopinfo.basedir) {
      helperServ.showModal({
        content: "用户参数异常，请修改重新修改店铺信息",
        success: (res) => {
          if (res.confirm) {
            helperServ.goToPage('/pages/manager/listShop/listShop?frompage=addPromotion');
          }
        }
      });
      return;
    }
    cache.getDict(Object.keys(this.dict), (err, res) => {
      this.setData({
        dict: res
      });
    });
    //加载promotion开头的模板
    mixed.listFieldTemplate({
      temptype: "promotion",
      category: null
    }).then(res => {
      //获取第一个模板
      var tmp = res.result.data && res.result.data.length > 0 ? res.result.data.shift() : null;
      if (tmp) {
        this.deleteTempExcep(tmp); //删除不需要字段
        //存储模板数组
        this.promTemplate = res.result.data;
        if (options.prom_id) {
          //修改
          this.loadPromById(options, tmp);
        } else {
          //新增
          this.setData({
            baseTemplate: tmp
          });
        }
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
        return;
      }
    }).catch(err => {
      //helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    });
  },

  loadPromById: function(options, tmp) {
    this.prom_id = options.prom_id;
    helperServ.showLoading({
      title: '数据加载中...'
    });
    promServ.getPromById({
      prom_id: options.prom_id
    }).then(res => {
      helperServ.hideLoading();
      var prom = res.result.data;
      if (prom) {
        for (var k in prom) {
          tmp[k] ? tmp[k].value = prom[k] : null;
        }
        tmp['promtype'].disabled = true;
        //tmp['promname'].disabled = true;
        this.setData({
          toggerDisabled: false,
          baseTemplate: tmp
        });
        this.prom = prom;
        this.promtype = prom.promtype;
        //初始化promtypeTemplate
        this.setPromTypeTemplate();
      } else {
        helperServ.hideLoading();
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  loadPromGoods: function(isPull) {
    var data = {};
    data['loadFinish'] = false;
    data['inList'] = [];
    data['totalNum'] = 0;
    this.batch_time = 0;
    this.tmpArr = [];
    this.setData(data);
    pageServ.loadMore(promServ.getPromGoods, {
      opertype: constants.OPERTYPE_GOODSPROMS, //主商品活动
      prom_id: this.prom_id,
      goods_id: null,
      goodsno: null,
      goodsname: null,
      promtype: null,
      promfullname: null,
      status: null,
      batch_time: -1,
      orderby_field: "updatetime",
      orderby_type: "desc"
    }, isPull, this);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.activeIndex == 2) {
      this.loadPromGoods();
    }
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  previewImg: function(e) {
    var picpath = this.data.inList[parseInt(e.currentTarget.dataset.index)].prompic;
    helperServ.previewImg(picpath, 0);
  },
  switchFlow: function(e) {
    if (e.detail.index >= 0) {
      this.switchPromForm(e.detail.index);
    }
    //this.selectComponent('#myFlow');
  },
  updBaseTemplate: function() {
    for (var k in this.data.baseTemplate) {
      this.data.baseTemplate[k].value = this.prom[k];
    }
  },
  setPromTypeTemplate: function(activeIndex) {
    if (!this.promTemplate || this.promTemplate.length == 0) {
      helperServ.showModal({
        content: '模板加载失败，请退出后重新进入本页'
      });
      return;
    }
    var temp = this.formOfPromType[this.promtype];
    if (!temp) {
      temp = this.promTemplate.find((v => v.temptype == (activeIndex === 0 ? "promotion" : "promotion_" + this.promtype)));
      console.log("**********", this.promtype, temp);
      if (temp) {
        this.deleteTempExcep(temp);
        this.formOfPromType[this.promtype] = temp;
      }
    }
    if (temp) {
      for (var k in temp) {
        temp[k] ? temp[k].value = this.prom[k] : null;
      }
      if (activeIndex) {
        this.setData({
          activeIndex: activeIndex,
          promtypeTemplate: temp
        })
      } else {
        this.setData({
          promtypeTemplate: temp
        })
      }
    }
  },
  switchPromForm: function(activeIndex) {
    if (activeIndex == 1) {
      //非修改状态下才需要切换
      this.setPromTypeTemplate(activeIndex);
    } else {
      this.setData({
        activeIndex: activeIndex,
      })
      this.onShow();
    }
  },
  upLoadFile: function(cb) {
    var myEnroll = this.selectComponent('#myEnroll');
     //"basedir":"shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000"（shop+userinfo.region+openid+shopid）
    myEnroll.setCloudPath(this.userinfo.shopinfo.basedir + "/promotion/" + (this.prom_id ? this.prom_id + '/' : `new_${helperServ.curDate()}/`));
    myEnroll.upLoadFile((err, res) => {
      if (err) {
        helperServ.showToast({
          icon: 'none',
          title: err
        });
        return;
      }
      if (this.prom_id) {
        return this.updProm(cb);
      }
      this.addProm(cb);
    });
  },
  save: function() {
    if (!this.checkPromInfo()) {
      return;
    }
    this.upLoadFile(() => {
      //可以点击下一个步骤了
      if (this.data.activeIndex === 0 && this.prom._id) {
        this.promtype = this.prom.promtype;
        this.setData({
          toggerDisabled: false
        });
        //helperServ.showModal({content:"基本信息提交成功，请完善活动参数信息"});
      }
      this.switchPromForm(++this.data.activeIndex);
    });
  },
  inputTogger: function(e) {
    var dataid = e.currentTarget.dataset.id,
      temp = e.currentTarget.dataset.temp,
      fieldData = this[dataid];
    if (!fieldData) {
      this[dataid] = {};
    }
    fieldData[e.detail.field.id] = e.detail.field.value;
    this.data[temp][e.detail.field.id].value = e.detail.field.value;    
    //var data = {};
    //data[`${temp}.${e.detail.field.id}.value`] = e.detail.field.value;
    //this.setData(data);
  },
  checkPromInfo: function() {
    var inputlist = this.selectComponent('#myEnroll').getValue();
    if (!inputlist.data) {
      helperServ.showToast({
        title: inputlist.errMsg,
        icon: 'none'
      });
      return false;
    }
    for(var k in inputlist.data){
      this.prom[k] = inputlist.data[k].value;
    }
    return true;
    /*
    inputlist = inputlist.data;
    for (var k in inputlist) {
      this.prom[k] = inputlist[k].value;
    }
    return this.prom;*/
  },
  updProm: function(cb) {
    if (!this.prom) {
      helperServ.showModal({
        content: '参数错误'
      });
      return;
    }
    this.prom['_id'] = this.prom_id;
    helperServ.showLoading({
      title: "处理中..."
    })
    promServ.modProm({
      prom: this.prom
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      helperServ.hideLoading();
      res.result.success == 1 ? cb() : null;
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  addProm: function(cb) {
    if (!this.prom) {
      helperServ.showModal({
        content: '参数错误'
      });
      return;
    }
    helperServ.showLoading({
      title: "处理中..."
    })
    promServ.addProm({
      prom: this.prom
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      helperServ.hideLoading();
      if (res.result.success == 1) {
        for (var k in this.prom) {
          this.data.baseTemplate[k] ? this.data.baseTemplate[k].value = this.prom[k] : null;
        }
        //tmp['promname'].disabled = true;
        this.setData({
          //toggerDisabled: false,
          baseTemplate: this.data.baseTemplate
        });
        //this.promtype = this.prom.promtype;
        this.prom._id = res.result._id;
        this.prom_id = res.result._id;
        cb();
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  goToPage: function(e) {
    if (!this.prom_id) {
      helperServ.showModal({
        content: '请填写并提交活动基本信息'
      });
      return;
    }
    var page = e.currentTarget.dataset.page,
      params = e.currentTarget.dataset.params;
    helperServ.goToPage(`../${page}/${page}?promtype=${this.promtype}&prom_id=${this.prom_id}&addgoods=1&${params}`);
  },
  showMenu: function(e) {
    helperServ.showActionSheet({
      itemList: ['删除', '详细'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.delTogger(e);
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  delTogger: function(e) {
    var goodsindex = e.currentTarget.dataset.goodsindex,
      index = e.currentTarget.dataset.index,
      goodsprom_id = null;
    var item = this.data.inList[index];
    goodsprom_id = item._id;
    if (helperServ.isNNull(goodsindex)) {
      if (item.goods && item.goods.length > 1) {
        helperServ.showModal({
          content: "您需要删除活动下的所有组合商品！"
        })
        return;
      }
    } else {
      item = item.goods[goodsindex];
    }

    helperServ.showModal({
      content: `请确认是否删除商品【${item.goodsname}】活动`,
      success: (res) => {
        if (res.confirm) {
          /**
           *goods_index,
            goodsprom_id
           */
          promServ.delPromGoods({
            goods_index: goodsindex,
            goodsprom_id: goodsprom_id
          }).then(res => {
            helperServ.showModal({
              content: res.result.errMsg
            });
            if (res.result.success == 1) {
              var data = {};
              if (helperServ.isNNull(goodsindex)) {
                this.data.inList.splice(index, 1);
                data["inList"] = this.data.inList;
              } else {
                this.data.inList[index].goods.splice(goodsindex, 1);
                data[`inList[${index}].goods`] = this.data.inList[index].goods;
              }
              this.setData(data);
            }
          }).catch(err => {
            helperServ.showModal({
              content: err.errMsg || err.message
            });
          })
        }
      }
    });
  }
})