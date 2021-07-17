const app = getApp();
const orderServ = require("../../../lib/manager/order.js");
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
class orderdo {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.route = pageContext.route;
    this.page = pageContext;
    this.page.checkLogistics = this.checkLogistics.bind(this);
    this.page.goShop = this.goShop.bind(this);
    this.page.goGoodsDetail = this.goGoodsDetail.bind(this);
    this.page.goOrderDetail = this.goOrderDetail.bind(this);
    this.page.goDelivery = this.goDelivery.bind(this);
    cache.getDict([100006], (err, res) => {
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
  getOrder(e) {
    var index = e.currentTarget.dataset.index;
    var order = null;
    if (index !== "" && index != null) {
      var curPage = this.page.getCurrentPage();
      order = curPage.listData && curPage.listData[index];
    } else {
      order = this.data.orderInfo;
    }
    return order;
  }

  goShop(e) {
    helperServ.goToPage(`/pages/shopDetail/shopDetail?shopid=${e.currentTarget.dataset.shopid}`);
  }
  goGoodsDetail(e) {
    helperServ.goToPage(`/pages/goodsDetail/goodsDetail?goodsno=${e.currentTarget.dataset.goodsno}`);
  }
  goOrderDetail(e) {
    var order = this.getOrder(e);
    var url = `/pages/manager/orderDetail/orderDetail?orderid=${order.order_id}`;
    helperServ.goToPage(url);
  }
  //查看物流信息
  checkLogistics(e) {
    var order = this.getOrder(e);
    helperServ.goToPage("/pages/manager/logisticsPath/logisticsPath?order_id=" + order.order_id);
  }
  //发货页面
  goDelivery(e){
    var order = this.getOrder(e);
    var url = `/pages/manager/doDelivery/doDelivery?orderid=${order.order_id}`;
    helperServ.goToPage(url);
  }
  //退款审核页面
  goDrawback(e){
    //reviewDrawback
  }
  goToOrderDetail(order_id) {
    var p = `/pages/orderDetail/orderDetail?orderid=${order_id}`;
    if (this.route.indexOf('orderDetail') >= 0) {
      this.page.onLoad({
        orderid: order_id
      });
      return;
    }
    helperServ.goToPage(p);
  }
  qryOrder(_id, order_id) {
    helperServ.showLoading({
      title: '正在跳转明细页面...',
    });
    var qryParams = {
      transcode: 'QRY_ORDER',
      _id: _id,
      order_id: order_id
    };
    var p = null;
    orderServ.payOrder(qryParams).then(res => {
      helperServ.hideLoading();
      if (res && res.result && res.result.pay_status == '1') {
        console.log('查询支付结果:', res.result);
        this.goToOrderDetail(order_id);
      } else {
        p = `/pages/payResult/payResult?_id=${_id}&order_id=${order_id}`;
        helperServ.goToPage(p);
      }
    }).catch(err => {
      helperServ.hideLoading();
      p = `/pages/payResult/payResult?_id=${_id}&order_id=${order_id}`;
      helperServ.goToPage(p);
    });
  }
}

module.exports = orderdo;