const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require("../../../lib/utils/pagehelper.js");
const cache = require("../../../lib/utils/cache.js");
const cashoutServ = require("../../../lib/manager/cashout.js");
const payServ = require("../../../lib/services/pay.js");
//const CASHOUT_NONE = "0"; //申请提取
const CASHOUT_APPR_SUCC = "1"; //申请提取审批成功
const CASHOUT_APPR_FAIL = "2"; //申请提取审批失败
//const CASHOUT_OK = "3"; //已经提取成功
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabIndex: '0',
    sysadmin:'0',
    dict: {
      "100030": null
    }
  },
  _qryParams: {
    orderby_field: "settime",
    orderby_type: "asc",
    status: "0"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cache.getDict(Object.keys(this.data.dict), (err, res) => {
      if (err) {
        return;
      }
      this.setData({
        dict:res
      })
    });
    this.refresh();
  },
  tabFun: function (e) {
    var status = e.currentTarget.dataset.index;
    this._qryParams.status = status;
    this.setData({
      tabIndex: status
    })
    this.refresh();
  },
  _doAppr: function (msg, status, app) {
    helperServ.showModal({
      content: msg || "请确认是否继续",
      success: (ok) => {
        if (!ok.confirm) {
          return;
        }
        helperServ.showLoading({
          title: "处理中..."
        })
        cashoutServ.cashoutAppr({
          status: status,
          _id: app._id,
          amt: app.amt
        }).then(res => {
          if (res.result.success) {
            this.refresh();
          }
          helperServ.hideLoading();
          helperServ.showModal({
            content: res.result.errMsg
          })
        }).catch(err => {
          helperServ.hideLoading();
          helperServ.showModal({
            content: err.errMsg || err.message
          })
        })
      }
    })
  },
  disPass: function (e) {
    this._doAppr("请确认是否【拒绝】提现申请",CASHOUT_APPR_FAIL, this.data.listData[e.currentTarget.dataset.idx])
  },
  pass: function (e) {
    this._doAppr("请确认是否【通过】提现申请，您选择【通过】后，资金将划转至对方微信钱包！", CASHOUT_APPR_SUCC,this.data.listData[e.currentTarget.dataset.idx])
  },
  goRpt: function () {

  },
  cashout:function(e){
    var app = this.data.listData[e.currentTarget.dataset.idx]
    helperServ.showLoading({title:"提现中..."});
    payServ.cashout({ cashoutid: app._id}).then(res=>{
      if (res.result.success) {
        this.refresh();
      }
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      })
    }).catch(er=>{
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      })
    })
  },
  //trader user.getMyTeamList
  refresh() {
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
    pageServ.loadMore2("manager", "cashout.listCashoutApp", params, isPull, this, (err, res) => {
      if (err) {
        return;
      }
      this.setData({
        sysadmin: res.result.sysadmin||'0'
      })
    });
  },
})