const orderServ = require("../../../lib/manager/order.js");
const flow = require('../../../lib/comm/deliveryFlow.js');
const goToPage = require('../../../lib/comm/goToPage.js');
const helperServ = require('../../../lib/utils/helper.js');
const pageServ = require('../../../lib/utils/pagehelper.js');
const logisServ = require('../../../lib/manager/logistics.js');
const _doDelivery = require('../../../components/template/dodelivery/dodelivery.js');
const V = require('../../../lib/utils/validate.js');
const app = getApp();
var doDeliveryFormat = null;
require("../../../lib/manager/comm.js").doDeliveryFormat({}).then(res => {
  doDeliveryFormat = res.result;
});

const DODELIVERY_ORDER = "DODELIVERY_ORDER";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logisinfoDlgHgh: app.getWinHeight() - pageServ.getRpx(73) - 40,
    offsetTop: pageServ.getRpx(73),
    activeIndex: 0,
    toggerDisabled: true,
    flows: null,
    expcompy: {
      shippercode: 'SF',
      name: "顺丰"
    },
    sender: {
      address_info: null
    },
    orderDetail: null,
    addservice: {
      name: '',
      value: ''
    },
    /** page 2 */
    //'0':待揽件，'1':已经揽件,2：'已达到'，'3':对方已经确认收件
    category: [{
        name: "待揽件",
        params: {
          status: "0",
          cancelflag: "0",
        }
      },
      {
        name: "已寄出",
        params: {
          status: "1",
          cancelflag: "0",
        }
      },
      {
        name: "对方已收件",
        params: {
          status: "3",
          cancelflag: "0",
        }
      },
      {
        name: "已取消预约",
        params: {
          cancelflag: "1",
        }
      },
      {
        name: "全部",
        params: {
          status: "",
        }
      }
    ],
    action: "logistics.getLogisticsList",
    defParams: {},
    orderBy: {
      orderby_field: ["cancelflag", "updatetime"],
      orderby_type: ["asc", "desc"]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      flows: flow.deliveryFlow
    })
    new _doDelivery(this);
    if(!options.orderid){
      this.switchFlow({
        detail:{index:1}
      })
    }
    /*
    doDeliveryFormat({}).then(res => {
      this.doDeliveryFormat = res.result;
    });*/  

    this.loadOrderDetail(options);
    this.loadStorage();
  },
  loadStorage: function () {
    helperServ.getStorage("EXP_COMPY").then(res => {
      if (res) {
        this.setData({
          expcompy: res,
        })
      }
    }).catch(err => {});
    helperServ.getStorage("SENDER_ADDRESS").then(res => {
      if (res) {
        this.setData({
          'sender.address_info': res
        })
      }
    }).catch(err => {});
    /*
    this.doDeliveryOrder = helperServ.getStorageSync(DODELIVERY_ORDER);
    if (this.doDeliveryOrder) {
      this.data.orderDetail = this.doDeliveryOrder[options.orderid];
    }*/
  },
  loadOrderDetail: function (options) {
    if(!options.orderid){
      return;
    }
    orderServ.getOrderDetail({
      order_id: options.orderid
    }).then(res => {
      if (res.result.data && res.result.data.length >= 0) {
        if (res.result.data.length === 0) {
          wx.showModal({
            content: `订单记录不存在：【${options.orderid}】`,
          })
          return;
        }
        this.setData({
          orderDetail: res.result.data[0],
          total_num: res.result.data[0].goods_info.reduce((pre, cur) => {
            return pre + cur.num;
          }, 0)
        });
      } else {
        wx.showModal({
          content: res.result.errMsg,
        })
      }
    }).catch(err => {
      wx.showModal({
        content: err.errMsg || err.message,
      })
    });
  },

  setGoodsActive: function (e) {
    var index = e.currentTarget.dataset.index,
      data = {};
    if (e.currentTarget.dataset.type == 'logisinfo') {
      data[`logisInfo[1].goods_info[${index}].active`] = !this.data.logisInfo[1].goods_info[index].active;
      if (!this.data.logisInfo[1].goods_info[index].active) {
        data[`gdsselected`] = this.data.gdsselected ? (this.data.gdsselected + 1) : 1;
      } else {
        data[`gdsselected`] = this.data.gdsselected ? (this.data.gdsselected - 1) : 0;
      }
    } else {
      data[`orderDetail.goods_info[${index}].active`] = !this.data.orderDetail.goods_info[index].active;
      if (!this.data.orderDetail.goods_info[index].active) {
        data[`gdsselected`] = this.data.gdsselected ? (this.data.gdsselected + 1) : 1;
      } else {
        data[`gdsselected`] = this.data.gdsselected ? (this.data.gdsselected - 1) : 0;
      }
    }

    this.setData(data);
    //helperServ.setStorage(DODELIVERY_ORDER, this.data.orderDetail);
  },

  inStep1: function () {
    this.refresh(null,{
      status:'0', //等待揽件,
      cancelflag:'0' //
    });
    if (!this.data.orderDetail || !this.data.orderDetail.order_id) {
      return;
    }
    this.getLogisticsInfo(null, this.data.orderDetail.order_id);
  },

  switchFlow: function (e) {
    this.setData({
      activeIndex: e.detail.index
    })
    if(this.data.activeIndex==0){
      if(this.data.orderDetail && this.data.orderDetail.goods_info.length>0){
        this.setData({
          total_num: this.data.orderDetail.goods_info.reduce((pre, cur) => {
            return pre + cur.num;
          }, 0)
        });
      }
    } else if (this.data.activeIndex == 1) {
      this.inStep1();
    } else if (this.data.activeIndex == 2) {
      this.refresh(null,{
        status:'1', //已经揽件，待收,
      });
    }else if (this.data.activeIndex == 3) {
      this.refresh(null,{
        status:'3', //对方已经收件
      });
    }
    else if (this.data.activeIndex == 4) {
      this.refresh(null,{
        status:'', //全部
      });
    }
  },
  inputTogger: function (e) {
    pageServ.inputTogger(e, this);
  },
  chooseAddress: function (e) {
    var currPage = helperServ.getCurrPage();
    var options = currPage.options;
    options.nextPageCallBack = (err, address_info) => {
      this.setData({
        'sender.address_info': address_info
      })
      helperServ.setStorage("SENDER_ADDRESS", address_info);
    }
    helperServ.goToPage("/pages/myAddress/myAddress");
  },
  chooseExpInfo: function (e) {
    var currPage = helperServ.getCurrPage();
    var options = currPage.options;
    options.nextPageCallBack = (err, info) => {
      this.setData({
        'expcompy': {
          color: info.color,
          shippercode: info.code,
          name: info.name
        }
      })
      helperServ.setStorage("EXP_COMPY", this.data.expcompy);
    }
    helperServ.goToPage("/pages/indexlist/indexlist?catetype=expcode");
  },
  clearTimer(){
    if(this.timer){
      console.log("**********clearTimer*******");
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  getLogisticsInfo: function (logis_id, order_id) {
    helperServ.showLoading({
      content: "正在获取预约取件信息..."
    });
    this.data.gdsselected = 0;
    logisServ.getLogisticsDetail({
      logis_id: logis_id,
      order_id: order_id
    }).then(res => {
      helperServ.hideLoading();
      if (!res.result.data || res.result.data.length === 0) {
        helperServ.showToast({
          title: !res.result.data ? res.result.errMsg : "当前订单不存在",
          icon: 'none'
        })
        return;
      } /*else if (res.result.data.length === 1) {
        helperServ.showToast({
          title: "当前订单还没申请预约取件",
          icon: 'none'
        })
        return;
      }*/
      if(res.result.data[0].goods_info){
        //只有订单信息，不需要显示吧
        return;
      }
      this.showDlg({
        currentTarget: {
          dataset: {
            type: "logisinfo"
          }
        }
      });
      this.clearTimer();
      var diff = helperServ.diff(res.result.data[0].updatetime,2*60*60*1000,null,1,this.timer);
      if(diff!="00:00:00"){
        this.timer = setInterval(() => {
          this.setData({
            supetime:helperServ.diff(res.result.data[0].updatetime,2*60*60*1000,null,1,this.timer)
          })
        }, 1000);
      }
      this.setData({
        supetime:diff,
        gdsselected: 0, //商品选择数量
        logisInfo: res.result.data,
        total_num: res.result.data.length===2?res.result.data[1].goods_info.reduce((pre, cur) => {
          return pre + cur.num;
        }, 0):0
      })
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      })
    })
    /*
    logisServ.getOrderDetailByLogisId(
      { logis_id: logis_id }
    ).then(res => {
      if (!res.result.data || res.result.data.length === 0) {
        helperServ.showModal({
          content: !res.result.data ? res.result.errMsg : "获取订单详情失败"
        })
        return;
      }
      this.setData({
        "logisOrderInfo": res.result.data[0],
        "total_num": res.result.data[0].goods_info.reduce((pre, cur) => {
          return pre + cur.num;
        }, 0)
      })
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message
      })
    })*/
  },

  refreshDlg: function (e) {

  },
  showDlg: function (e) {
    var type = e.currentTarget.dataset.type,
      data = {}
    data[type] = null;
    if (this.data[type]) {
      data[type] = false;
      pageServ.hideDlg(data, this);
      this.clearTimer();
      return;
    }
    data[type] = true;
    this.setData(data);
    pageServ.showDlg(this);
  },
  dragStart: function (e) {
    this.startY = e.touches[0].pageY;
  },
  dragMove: function (e) {
    this.movedDistance = e.touches[0].pageY - this.startY; //e.touches[0].pageY - this.startY;
  },
  dragEnd: function (e) {
    //console.debug("*dragEnd*", e);
    //this.movedDistance = e.changedTouches[0].pageY - this.startY;//e.touches[0].pageY - this.startY;
    var data = {},
      type = e.currentTarget.dataset.type;
    if (this.movedDistance > 200) {
      this.movedDistance = 0;
      data[type] = false;
      pageServ.hideDlg(data, this);
      this.clearTimer();
    }
  },

  checkParams: function (params) {
    var field = V.V(doDeliveryFormat, params, "logistics", params, params, null);
    this.data.focusSet = {};
    if (field) {
      this.data.focusSet[helperServ.subStrByPos(field.path, 2)] = true;
      //console.log('*********V.V*********', field, helperServ.subStrByPos(field.path, 2))
      helperServ.showToast({
        title: field.errMsg,
        icon: 'none'
      });
      this.setData({
        "focusSet": this.data.focusSet
      });
      return false;
    }
    this.setData({
      "focusSet": this.data.focusSet
    });
    return true;
  },
  onUnload(){
    this.clearTimer();
  },
  /**
   * 录入单号到系统，需要单号进行物流查询
   */
  _addBN: function (params, cb) {
    logisServ.addBN(params).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      cb ? cb(res.result.success ? null : "err") : null;
    }).catch(err => {
      helperServ.showModal({
        content: err.message || err.errMsg
      })
    });
  },
  showAddBNDlg: function (logisInfo) {
    this.myDlg = this.selectComponent('#modalDlg');
    this.myDlg.showDlg({
      title: '运单录入框',
      inputlist: {
        "BN": {
          "id": "BN",
          "name": "运单号",
          "type": "0",
          "required": "R",
          "label": true,
          "value": logisInfo.BN,
          "placeholder": '请输入运单号',
          "prompt": {
            "type": "0",
            "value": "请于请在快递小哥揽件后填写快递单上的单号，以供客户实时查询物流轨迹"
          },
          "event": {
            "type": "tap",
            "name": "扫一扫",
            "togger": (e, cb) => {
              helperServ.scanCode({
                success(res) {
                  //res.result
                  console.log(res)
                  const prompt = {
                    type: "0",
                    retogger: true, //true:对type='b','a','5'类型字段会有触发事件,其他字段则会重新更新field.value的值。      
                    text: "扫描成功",
                    value: res.result
                  };
                  e.currentTarget.dataset.field.value = res.result; //需要重新设置field.value才会更新
                  cb(null, prompt);
                }
              })
            }
          }
        },
        "exp_name": {
          "id": "exp_name",
          "name": "快递公司",
          "label": true,
          "disabled": true,
          "type": "0",
          "value": logisInfo.exp_name,
          "required": "R"
        },
        "exp_code": {
          "id": "exp_code",
          "name": "",
          "label": false,
          "hidden": true,
          "disabled": true,
          "type": "0",
          "value": logisInfo.exp_code,
          "required": "R"
        },
        "logis_id": {
          "id": "logis_id",
          "name": "预约揽件流水号",
          "label": true,
          "disabled": true,
          "value": logisInfo.logis_id,
          "type": "0",
          "required": "R"
        },
        "summary": {
          "id": "summary",
          "name": "备注",
          "type": "9", //选择框
          "required": "O",
          "placeholder": '备注信息',
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
        try {
          var params = {};
          for (var k in e.inputlist) {
            params[k] = e.inputlist[k].value
          }
          this._addBN(params, cb);
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  },
  cancelLogistics: function (e) {
    helperServ.showModal({
      content: "您确认取消揽件预约吗，取消后需要重新预约",
      success: (sel) => {
        if (sel.cancel) {
          return;
        }
        helperServ.showLoading();
        logisServ.cancelLogistics({
          order_id: e.currentTarget.dataset.orderid
        }).then(res => {
          helperServ.hideLoading();
          helperServ.showModal({
            content: res.result.errMsg + ":(" + (res.result.retcode || 'None') + ")"
          });
        }).catch(err => {
          helperServ.showModal({
            content: err.errMsg || err.message
          });
        });
      }
    })
  },
  _reDoLogistics:function(logis){
    this.switchFlow({detail: {
      index: 0
    }});
    this.loadOrderDetail({
      orderid:logis.order_id
    });
    helperServ.getStorage("SENDER_ADDRESS").then(res => {
      if (res) {
        this.setData({
          'sender.address_info': res
        })
      }
    }).catch(err => {});
    this.setData({
      expcompy: {
        name:logis.exp_name,
        shippercode:logis.exp_code
      },
    })
  },
  createLogistics: function (e) {
    helperServ.showLoading();
    var o = this.data.orderDetail;
    var params = {
      "order_id": o.order_id,
      "shopid": o.shopid,
      "data": {
        "ordercode": o.order_id,
        "shippercode": this.data.expcompy.shippercode,
        "shippername": this.data.expcompy.name,
        "sender": {
          "company": o.shopname || '',
          "username": this.data.sender.address_info ? this.data.sender.address_info.name : '',
          "phone": this.data.sender.address_info ? this.data.sender.address_info.contact : '',
          "province": this.data.sender.address_info ? this.data.sender.address_info.province.text : '',
          "city": this.data.sender.address_info ? this.data.sender.address_info.city.text : '',
          "area": this.data.sender.address_info ? this.data.sender.address_info.district.text : '',
          "detail": this.data.sender.address_info ? this.data.sender.address_info.detailaddress : ''
        },
        "receiver": {
          "company": "",
          "username": o.address_info ? o.address_info.name : '',
          "phone": o.address_info ? o.address_info.contact : '',
          "province": o.address_info ? o.address_info.province.text : '',
          "city": o.address_info ? o.address_info.city.text : '',
          "area": o.address_info ? o.address_info.district.text : '',
          "detail": o.address_info ? o.address_info.detailaddress : ''
        },
        "addservice": !this.data.addService || !this.data.addService.name || !this.data.addService.name.trim() ? null : [{
          "name": this.data.addService.name.trim(),
          "value": "1020"
        }],
        "weight": o.weight || 0,
        "num": o.pack_num || 1,
        "volumn": o.volumn || 0,
        "remark": "无"
      }
    }
    console.debug('logistics', params);
    if (!this.checkParams(params)) {
      return;
    }
    logisServ.createLogistics(params).then(res => {
      helperServ.hideLoading();
      if (res.result.success) {
        helperServ.showModal({
          content: res.result.errMsg,
          success: (cfm) => {
            if (cfm.confirm) {
              this.switchFlow({
                detail: {
                  index: this.data.activeIndex + 1
                }
              })
            }
          }
        });
      } else {
        helperServ.showModal({
          content: res.result.errMsg + ":(" + (res.result.retcode || '') + ")"
        });
      }
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    });
  },
  /** step 2 */
  /*适配 components/shoptheme/swiperlist 控件中的 getCurrentPage 。
  该方法将在components/template/dodelivery/dodelivery.js getLogis 中调用
  */
  getCurrentPage() {
    return this.data;
  },
  // 刷新数据
  refresh(e,_qryParams) {
    if(_qryParams){
      this._qryParams = Object.assign({},_qryParams, {
        orderby_field: "updatetime",
        orderby_type: "desc"
      });  
    }
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
    pageServ.loadMore2("manager", "logistics.getLogisticsList", params, isPull, this, (err, res) => {
      if (err) {
        return;
      }
    });
  }
  /**step 2 end */
})