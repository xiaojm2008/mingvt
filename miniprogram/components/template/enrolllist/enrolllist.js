var app = getApp();
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const actionServ = require("../../../lib/services/action.js");
const payServ = require("../../../lib/services/pay.js");

const dict = {
  100015: 0,
  100032: 0,
  100033: 0,
  100034: 0,
  100035: 0,
  100036: 0,
  100037: 0,
  100038: 0,
  100039: 0,
  100040: 0 //记录状态
};
class enrolllist {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;

    this.page.goToPage = this.goToPage.bind(this);
    this.page.onDetail = this.onDetail.bind(this);
    this.page.onMod = this.onMod.bind(this);
    this.page.onPay = this.onPay.bind(this);
    this.page.onDel = this.onDel.bind(this);
    this.page.reFund = this.reFund.bind(this);
    this.page.onSigin = this.onSigin.bind(this);
    this.page.onAppr = this.onAppr.bind(this);
    this.page.onMore = this.onMore.bind(this);
    cache.getDict(Object.keys(dict), (err, res) => {
      if (err) {
        helperServ.showToast({
          title: err,
          icon: 'none'
        })
        return;
      }
      var clientcfg = app.getClientCfg();
      const now = helperServ.dateFormat(new Date(), "yyyy-MM-dd hh:mm");
      //console.log("now",now)
      this.page.setData({
        "options.now": now,
        "options.mymodal": 1,
        /**加载mymodal组件 */
        "options.enrolldetail": 1,
        /**需要加载enrolldetail组件 */
        "options.modaldlg": 1,
        "options.dict": res,
        "options.clientcfg.debug": clientcfg ? clientcfg.DEBUG : false
      })
    });
    pageServ.getSystemInfo({
      success: (res) => {
        this.page.setData({
          "options.windowHeight": res.windowHeight - 40
        })
      }
    })
  }
  goToPage(e) {
    helperServ.goToPage(e.currentTarget.dataset.page);
  }
  callPhone(e) {
    helperServ.callPhone(e.currentTarget.dataset.phone);
  }
  getEnrollInfo(e) {
    var index = e.currentTarget.dataset.index;
    var actioninfo = null;
    if (index !== "" && index != null) {
      var curPage = this.page.getCurrentPage();
      actioninfo = curPage.listData && curPage.listData[index];
    } else {
      actioninfo = this.data.actionInfo;
    }
    return actioninfo;
  }
  onMod(e) {
    var enrollinfo = this.getEnrollInfo(e);
    var params = "?enrollid=" + enrollinfo._id + "&actionid=" + enrollinfo.actionid + "&actionname=" + (enrollinfo.actionname || this.actioninfo.actionname) +
      "&cover=" + (enrollinfo.cover || '') + "&imginfo=" + (enrollinfo.imginfo || '');
    helperServ.goToPage("/act/enrollform/enrollform" + params);
  }
  onDetail(e) {
    var enrollinfo = this.getEnrollInfo(e);
    enrolllist.showDetail(enrollinfo, this.page);
  }
  onAppr(e) {
    var enrollinfo = this.getEnrollInfo(e);
    if (enrollinfo.apprflag === '2') {
      helperServ.showModal({
        content: "您的请求审核没有通过"
      })
      return;
    } else {
      helperServ.showModal({
        content: "您的请求已经审核通过了，请留意活动开始时间"
      })
      return;
    }
  }
  onDel(e) {
    helperServ.showModal({
      content: "请确认是否删除，删除后不能恢复哦",
      success: (ok) => {
        if (ok.cancel) {
          return;
        }
        var enrollinfo = this.getEnrollInfo(e);
        actionServ.doEnrollStatus({
          enrollid: enrollinfo._id,
          enrollstatus: '9'
        }).then(res => {
          if (res.result.success) {
            this.page.refresh();
          }
          helperServ.showModal({
            content: res.result.errMsg
          })
        })
      }
    })
  }
  onComment(e) {
    var enrollinfo = this.getEnrollInfo(e);
  }
  _qryPayResult(pay_id){
    helperServ.showLoading({title:"正在刷新..."})
    payServ.actQueryPayResult({pay_id:pay_id}).then(res=>{
      helperServ.hideLoading();
      //pay_status=='1'支付成功，其他失败
      if (res && res.result && res.result.pay_status == '1') {
        if(!res.result.success){
          
        }
      }
      this.page.refresh();
      helperServ.showModal({content:res.result.errMsg})
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({content:err.errMsg||err.message})
    })
  }
  _onPay(params){
    var payment = Object.assign(params,{
      success: (res2) => {
        console.log('requestPayment success AND QUERY RESULT DO', res2);
        this._qryPayResult(params.pay_id);
      },
      fail: (err) => {
        //取消支付，这个是时候需要回滚库存哦，而且只能回滚一次，不管多少次取消支付。
        console.log('requestPayment fail', err); //err.errMsg
        this._qryPayResult(params.pay_id);
      },
      complete: () => {}
    });

    wx.requestPayment(payment);
  }

  onPay(e) {
    var enrollinfo = this.getEnrollInfo(e);
    helperServ.showLoading({
      title: "正在支付..."
    });
    payServ.actPrePay({
      enrollid: enrollinfo._id
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.success == 1) {
        //this.page.refresh();
        this._onPay(res.result);
        return;
      }
      helperServ.showModal({
        content: res.errMsg
      });
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  }
  _scanSigin(enrollinfo) {
    helperServ.scanCode({
      scanType: ['barCode', 'qrCode'],
      success(res) {
        console.log(res)
        //e.currentTarget.dataset.field.value = res.result; //需要重新设置field.value才会更新
        /**
         * result：所扫码的内容
         * charSet: "UTF-8"
          errMsg: "scanCode:ok"
          path: "pages/signin/signin?scene=88888888"
          rawData: "bDBtOkMySV8rdmMyVz1icXY6S2w9OA=="
          scanType: "WX_CODE"
         */
        if (res.path) {
          var path = res.path[0] != "/" ? ("/" + res.path) : res.path;
          helperServ.goToPage(path + "&enrollid=" + enrollinfo._id);
        } else {
          helperServ.showModal({
            content: "码错误"
          })
        }
      }
    })
  }
  _showInputSignDlg(enrollinfo) {
    var myDlg = this.page.selectComponent('#modalDlg');
    myDlg.showDlg({
      title: '请输入验证码签到',
      cache: '',
      inputlist: [{
          "id": "enrollid",
          "name": "记录ID",
          "type": "0",
          "required": "R",
          "length": 128,
          "hidden": true,
          "disabled": true,
          "value": enrollinfo._id
        },
        {
          "id": "userinfo",
          "name": "用户信息",
          "type": "i",
          "required": "O",
          "value": helperServ.getUserInfo()
        },
        /*
        {
          "id": "phone",
          "name": "电话号码",
          "type": "0",
          "required": "O",
          "length": 20,
          "label": true,
          "disabled":true,
          "hidden":!enrollinfo.phone && !enrollinfo.x_phone,
          "value":enrollinfo.phone||enrollinfo.x_phone
        },*/
        {
          "id": "sigincode",
          "name": "验证码",
          "type": "0",
          "required": "R",
          "length": 10,
          "label": true,
          "placeholder": '请输入验证码'
        }
      ],
      btntext: ['签到'],
      submit: (e, cb) => {
        try {
          var params = {};
          params["enrollid"] = e.inputlist["enrollid"].value;
          params["sigincode"] = e.inputlist["sigincode"].value;
          helperServ.showLoading();
          actionServ.siginIn(params).then(res => {
            helperServ.hideLoading();

            if (res.result.success) {
              this.page.refresh();
            } else {
              helperServ.showModal({
                content: res.result.errMsg
              })
            }
          }).catch(err => {
            helperServ.hideLoading();
            helperServ.showModal({
              content: res.result.errMsg
            })
          })

          cb();
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  }
  onMore(e) {
    var enrollinfo = this.getEnrollInfo(e);
    var operList = [{
        text: {
          name: "详情",
          style: ""
        },
        icon: {
          name: "icon-info",
          style: ""
        },
        tap: (idx) => {
          this.onDetail(e);
        }
      },
      {
        text: {
          name: "修改",
          style: ""
        },
        icon: {
          name: "icon-pencircle",
          style: ""
        },
        tap: (idx) => {
          this.onMod(e);
        }
      },
      {
        text: {
          name: "删除",
          style: ""
        },
        icon: {
          name: "icon-delete",
          style: ""
        },
        tap: (idx) => {
          this.onDel(e);
        }
      }
    ];
    if (enrollinfo.statusdesc != '进行中') {
      operList.splice(1,1);
    }
    if(enrollinfo.paystatus=='1'&&enrollinfo.refundstatus !='1'&&enrollinfo.refundstatus !='2'){
      operList.push({
        text: {
          name: "退款",
          style: ""
        },
        icon: {
          name: "icon-refund",
          style: ""
        },
        tap: (idx) => {
          helperServ.showModal({
            content:"请确认是否退款！",
            success:(ok)=>{
              if(ok.confirm){
                this.reFund(e);
              }
            }
          })          
        }
      })
    }
    this.page.selectComponent("#myModal").show({
      title: {
        name: "更多操作",
        style: ""
      },
      data: operList
    })
  }
  onSigin(e) {
    var enrollinfo = this.getEnrollInfo(e);
    this.page.selectComponent("#myModal").show({
      title: {
        name: "签到",
        style: ""
      },
      data: [{
          text: {
            name: "输入签到码",
            style: ""
          },
          icon: {
            name: "icon-comment",
            style: ""
          },
          tap: (idx) => {
            this._showInputSignDlg(enrollinfo);
          }
        },
        {
          text: {
            name: "扫描签到",
            style: ""
          },
          icon: {
            name: "icon-scan",
            style: ""
          },
          tap: (idx) => {
            this._scanSigin(enrollinfo);
          }
        }
      ]
    })
  }
  reFund(e) {
    var enrollinfo = this.getEnrollInfo(e);
    if(!enrollinfo.pay_id){
      helperServ.showModal({
        content: "您还未支付任何费用"
      });
      return;
    }
    helperServ.showLoading({
      title: "正在申请退款..."
    });
    payServ.actReFund({
      pay_id: enrollinfo.pay_id
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.success == 1) {
        this.page.refresh();
        //this._onPay(res.result);
        return;
      }
      helperServ.showModal({
        content: res.result.errMsg
      });
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  }
  _setAction(_id, status) {
    helperServ.showLoading();
    actionServ.setActionStatus({
      actionid: _id,
      status: status
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.success) {
        this.page.refresh();
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  }
  setAction(_id, status) {
    if (status === '9') {
      helperServ.showModal({
        content: "请确认是否删除该记录",
        success: (ok) => {
          if (ok.confirm) {
            this._setAction(_id, status)
          }
        }
      })
    } else {
      this._setAction(_id, status);
    }
  }
}

enrolllist.showDetail2 = function (enrollinfo, pgContext) {
  helperServ.showLoading({
    title: "数据加载中..."
  })
  /**获取活动的报名表单 */
  actionServ.getEnrollForm({
    actionid: enrollinfo.actionid
  }).then(res => {

    if (!res.result.data) {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      })
      return;
    }
    var enrollform = res.result.data.enrollform;
    /**获取我的报名信息 */
    actionServ.getEnrollInfoDetail({
      enrollid: enrollinfo._id
    }).then(res => {
      helperServ.hideLoading();
      if (!res.result.data) {
        helperServ.showModal({
          content: res.result.errMsg
        })
        return;
      }
      var enrollinfo = res.result.data;
      for (var k in enrollform) {
        enrollform[k].value = enrollinfo[k];
      }
      pgContext.selectComponent("#enrollDetail").show({
        title: "详细",
        type: "1",
        enrollinfo: enrollform
      });

    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.errMsg || err.message
      })
    })

  }).catch(err => {
    helperServ.hideLoading();
    helperServ.showModal({
      content: res.errMsg || err.message
    })
  })
};


enrolllist.showDetail = function (myenroll, pgContext) {
  helperServ.showLoading({
    title: "数据加载中..."
  })
  /**获取我的报名信息 */
  actionServ.getEnrollInfoDetail({
    enrollid: myenroll._id || '',
    actionid: myenroll.actionid || ''
  }).then(res => {
    if (!res.result.data) {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      })
      return;
    }
    var enrollinfo = res.result.data;

    /**获取活动的报名表单 */
    actionServ.getEnrollForm({
      actionid: enrollinfo.actionid
    }).then(res => {
      helperServ.hideLoading();
      if (!res.result.data) {
        helperServ.showModal({
          content: res.result.errMsg
        })
        return;
      }
      var enrollform = res.result.data.enrollform;
      for (var k in enrollform) {
        enrollform[k].value = enrollinfo[k];
      }
      pgContext.selectComponent("#enrollDetail").show(Object.assign({}, {
        title: "详细",
        type: "1",
        enrollinfo: enrollform
      }, myenroll.options || {}));

    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.errMsg || err.message
      })
    })
  }).catch(err => {
    helperServ.hideLoading();
    helperServ.showModal({
      content: res.errMsg || err.message
    })
  })

};
module.exports = enrolllist;