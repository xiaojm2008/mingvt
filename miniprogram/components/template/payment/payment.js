var app = getApp();
//var pageServ = require("../../../lib/utils/pagehelper.js");
var helperServ = require("../../../lib/utils/helper.js");
var payServ = require("../../../lib/services/pay.js");
const cache = require("../../../lib/utils/cache.js");
class payment {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.page.rollback = this.rollback.bind(this);
    this.page.goShop = this.goShop.bind(this);
    this.page.goGoodsDetail = this.goGoodsDetail.bind(this);
    this.page.qryOrder = this.qryOrder.bind(this);
    cache.getDict([100031], (err, res) => {
      if (err) {
        helperServ.showToast({
          title:err,
          icon: 'none'
        })
        return;
      }
      var clientcfg = app.getClientCfg();
      this.page.setData({
        "options.dict":res,
        "options.clientcfg.debug":clientcfg?clientcfg.DEBUG:false
      })
    });
  }
  getPayment(e) {
    var index = e.currentTarget.dataset.index;
    var payment = null;
    if (index !== "" && index != null) {
      var curPage = this.page.getCurrentPage();
      payment = curPage.listData && curPage.listData[index];
    } else {
      payment = this.data.payment;
    }
    return payment;
  }

  rollback(e){
    var payment = this.getPayment(e);
    helperServ.showLoading();
    payServ.rollBackStock({_id:payment._id}).then(res=>{
      if(res.result.success==1){
        this.page.refresh()
      }
      helperServ.hideLoading();
      helperServ.showModal({
        content:res.result.errMsg
      })
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({
        content:err.errMsg||err.message
      })
    })
  }
  qryOrder(e){
    var payment = this.getPayment(e);
    this._qryOrder(payment.primary_id,payment.order_id,payment.pay_id);
  }
  goShop(e){
    if(e.currentTarget.dataset.shopid){
      helperServ.goToPage(`/pages/shopDetail/shopDetail?shopid=${e.currentTarget.dataset.shopid}`);
    }
  }
  _qryOrder(_id, order_id, pay_id) {
    var qryParams = {
      primary_id: _id,//对应xlh_orderdetail._id
      order_id:order_id,
      pay_id: pay_id //如果超时了，那么就不会获取到pay_id了
    };
    helperServ.showLoading();
    var p = `/pages/payResult/payResult?_id=${_id}&order_id=${order_id}&pay_id=${pay_id}`;
    payServ.queryOrder(qryParams).then(res => {
      helperServ.hideLoading();
      //pay_status=='1'支付成功，其他失败
      //if (res && res.result && res.result.pay_status == '1') {}
      helperServ.goToPage(p);
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.goToPage(p);
    });
  }
  goGoodsDetail(e){
    helperServ.goToPage(`/pages/goodsDetail/goodsDetail?goodsno=${e.currentTarget.dataset.goodsno}`);
  }
}

module.exports = payment;