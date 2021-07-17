const app = getApp();
const orderServ = require("../../../lib/services/order.js");
const payServ = require("../../../lib/services/pay.js");
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
class orderlist {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.route = pageContext.route;
    this.page = pageContext;
    this.page.goToPage = this.goToPage.bind(this);
    this.page.remindDelivery = this.remindDelivery.bind(this);
    this.page.cancelOrder = this.cancelOrder.bind(this);
    this.page.addOrder = this.addOrder.bind(this);
    this.page.payOrder = this.payOrder.bind(this);
    this.page.evaluateOrder = this.evaluateOrder.bind(this);
    this.page.applyDrawback = this.applyDrawback.bind(this);
    this.page.checkLogistics = this.checkLogistics.bind(this);
    this.page.sureReceipt = this.sureReceipt.bind(this);
    this.page.goShop = this.goShop.bind(this);
    this.page.goGoodsDetail = this.goGoodsDetail.bind(this);
    this.page.goOrderDetail = this.goOrderDetail.bind(this);
    //this.page.goOrderDetailFromMg = this.goOrderDetailFromMg.bind(this);
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
  /*
{"goodsinfo":[{"goodsno":"S000020190721120922819afe08f39f552","goodsname":"肖锦测试x","model_id":"","model_value":null,"num":1,"price":0},
{"goodsno":"S000020190722093923735b8d615370ce3","goodsname":"多规格产品测试x","model_id":"0,m21,m30","model_value":null,"num":1,"price":0},
{"goodsno":"S0000201907201424131230b668d6955a9","goodsname":"多规格产品测试x","model_id":"modelitem_4","model_value":null,"num":1,"price":0},
{"goodsno":"S000020190720142814415cea02ef569d4","goodsname":"多规格产品测试","model_id":"","model_value":null,"num":1,"price":0}],"transtype":"order","actionname":"addOrder"}
*/
  _addOrder(order) {
    var goodsinfo = order.goods_info.map(v => {
      return {
        //"cover":v.cover,
        "goodsno": v.goodsno,
        "goodsname": v.goodsname,
        "model_id": v.model_id,
        "model_value": v.model_value,
        "models_mainkey": v.models_mainkey||'',
        "models_mainkey_idx": v.models_mainkey_idx,
        "num": v.num,
        "price": v.price
      }
    });
    helperServ.showLoading({
      title: '订单提交中...',
    });
    orderServ.addOrder({
      _id:order._id,
      order_id:order.order_id,
      remark:order.remark||'',
      totalpay:order.total_pay,
      addressinfo:order.address_info,
      goodsinfo: goodsinfo
    }).then(res => {
      if (res.result.success && res.result.order_id) {
        order._id = res.result._id;
        order.order_id = res.result.order_id;
        order.shopid = res.result.shopid;
        //可能存在Merge pay
        this._payOrder(order, 1);
      } else if (res.result.order_id){
        helperServ.showModal({
          content: res.result.errMsg,
          success:(ok=>{
            if (ok.confirm) {
              helperServ.goToPage("/pages/myOrder/myOrder?status=0")
            }
          })
        });        
      } else{
        helperServ.hideLoading();
        helperServ.showModal({
          title: '订单错误',
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        title: '订单错误',
        content: err.errMsg || err.message
      });
    })
  }
  cancelOrder(e) {
    var order = this.getOrder(e);
    helperServ.showModal({
      title: '提示',
      content: '请确认取消该订单，取消后可重新购买',
      success: (res) => {
        if (res.confirm) {
          orderServ.cancelOrder({
            _id: order._id
          }).then(res => {
            helperServ.showModal({
              title: '提示',
              content: '订单已经取消，点击确认返回',
              showCancel: false,
              success: (res) => {
                helperServ.goBack();
              }
            })
          }).catch(err => {

          });
        } else if (res.cancel) {
          return;
        }
      }
    });
  }
  /**
   * 添加/修改订单并支付
   */
  addOrder(e){
    if(e.currentTarget.dataset.mergeflag!='1'){
      helperServ.showModal({content:"页面错误，请联系技术人员！"});
      return;
    }
    var order = this.getOrder(e);
    return this._addOrder(order);
  }

  /**
   * 根据订单的（_id）支付
   */
  payOrder(e) {
    var order = this.getOrder(e);
    if (order._id) {
      //不能DO Merge pay 20200216 xiaojm
      return this._payOrder(order,null);
    } else {
      helperServ.showModal({
        content:"获取订单ID失败"
      })
    }
  }
  _payOrder(order,mergeflag) {
    var _self = this;
    helperServ.showLoading({
      title: '支付中...',
    });
    var reqParams = {
      _id: order._id,
      order_id: order.order_id,
      mergeflag:mergeflag||'',
      shopid:order.shopid,
      openid: order.openid,
      total_pay: order.total_pay
    };
    //unifiedOrder
    payServ.unifiedOrder(reqParams).then(res => {
      helperServ.hideLoading();
      //|| !res.result.success 后台最好不要返回 success
      //要不后面需要调用 Object.assign 注入success函数，会替换的
      //就用pay_id表示成功
      if (!res.result || !res.result.pay_id) {
        //这个时候不需要回滚库存！！！
        helperServ.showModal({
          title: '支付错误',
          content: res.result.errMsg //&& (res.result.errMsg || res.result.message)
        });
        return;
      }
      var payment = Object.assign({
        success: (res2) => {
          console.log('requestPayment success AND QUERY RESULT DO', res2);
          _self.qryOrder(reqParams._id, reqParams.order_id, payment.pay_id,mergeflag);
        },
        fail: (err) => {
          //取消支付，这个是时候需要回滚库存哦，而且只能回滚一次，不管多少次取消支付。
          console.log('requestPayment fail', err); //err.errMsg
          _self.qryOrder(reqParams._id, reqParams.order_id, payment.pay_id,mergeflag);
        },
        complete: () => {}
      },res.result);

      wx.requestPayment(payment);

      //sandbox test
      if (res.result.sandbox) {
        setTimeout(() => {
          _self.qryOrder(reqParams._id, reqParams.order_id, payment.pay_id,mergeflag);
        }, 3000);
      }
    }).catch(err => {
      //异常，这个时候可能是网络超时了,也可能需要处理库存，而且只能回滚一次，不管多少次取消支付。
      //怎样从err中获取是否超时？
      _self.qryOrder(reqParams._id, reqParams.order_id, null,mergeflag);
      console.log('payOrder', err)
      helperServ.showModal({
        title: '支付异常',
        content: err.message
      })
    });
  }
  evaluateOrder(e) {
    var order = this.getOrder(e);
    helperServ.goToPage("/pages/addComment/addComment?_id=" + order._id);
  }
  remindDelivery(e) {
    var order = this.getOrder(e);
    helperServ.showModal({
      title: '系统提示',
      content: '谢谢您对我们的支持，提醒已经发送!',
    })
  }
  applyDrawback(e) {
    var goodsIndex = e.currentTarget.dataset.goodsIndex;
    var order = this.getOrder(e);
    if (goodsIndex !== "" && goodsIndex != null) {
      var goodsInfo = order.goods_info[goodsIndex];
    } else {
      helperServ.showToast({
        title: "选择错误"
      });
    }
  }
  checkLogistics(e) {
    var order = this.getOrder(e);
    helperServ.goToPage(`/pages/logisticsPath/logisticsPath?BN=${order.BN}&exp_code=${order.exp_code}&logis_id=${order.logis_id}`);
  }
  sureReceipt(e) {
    var order = this.getOrder(e);
    helperServ.showModal({
      title: '系统提示',
      content: '请确认是否已经收货',
      success: (res) => {
        if (res.confirm) {
          orderServ.setOrderStatus({
            _id: order._id,
            status: '3' //待评价（即收货确认）
          }).then(res => {
            if(res.result.success){
              this.goToOrderDetail(order._id);
            } else {
              helperServ.showModal({content:res.result.errMsg});
            }
          }).catch(err=>{
            helperServ.showModal({content:err.errMsg||err.message});
          });
        }
      }
    })
  }
  goShop(e){
    helperServ.goToPage(`/pages/shopDetail/shopDetail?shopid=${e.currentTarget.dataset.shopid}`);
  }
  goGoodsDetail(e){
    helperServ.goToPage(`/pages/goodsDetail/goodsDetail?goodsno=${e.currentTarget.dataset.goodsno}`);
  }
  goOrderDetail(e) {
    var order = this.getOrder(e);
    var url = `/pages/orderDetail/orderDetail?_id=${order._id}`;
    helperServ.goToPage(url);
  }
  /*
  goOrderDetailFromMg(e) {
    var order = this.getOrder(e);
    var url = `/pages/orderDetail/orderDetail?orderid=${order.order_id}&manager=1`;
    helperServ.goToPage(url);
  }*/
  qryOrder(_id, order_id, pay_id,mergeflag) {
    helperServ.showLoading({
      title: '支付确认中...',
    });
    var qryParams = {
      mergeflag:mergeflag,
      primary_id: _id,//对应xlh_orderdetail._id
      order_id:order_id,
      pay_id: pay_id //如果超时了，那么就不会获取到pay_id了
    };
    var p = null;
    payServ.queryOrder(qryParams).then(res => {
      helperServ.hideLoading();
      //pay_status=='1'支付成功，其他失败
      if (res && res.result && res.result.pay_status == '1') {
        if(!res.result.success){
          
        } else {
          console.log('查询支付结果:', res.result);
          this.goToOrderDetail(null,res.result.pay_id);
        }
      } else {
        p = `/pages/payResult/payResult?_id=${_id}&order_id=${order_id}&pay_id=${pay_id}`;
        helperServ.goToPage(p);
      }
    }).catch(err => {
      helperServ.hideLoading();
      p = `/pages/payResult/payResult?_id=${_id}&order_id=${order_id}&pay_id=${pay_id}`;
      helperServ.goToPage(p);
    });
  }

  goToOrderDetail(_id, pay_id) {
    var p =  '/pages/orderDetail/orderDetail';
    if(_id){
      p += "?_id="+_id;
    } else if(pay_id){
      p += "?pay_id="+pay_id;
    } else {
      helperServ.showModal({content:"参数错误"})
      return;
    }
    if (helperServ.getCurrPage().route.indexOf('orderDetail') >= 0) {
      //如果当前就是orderDetail页面，那么重加载就可以
      this.page.onLoad({
        orderid: order_id
      });
      return;
    }
    helperServ.goToPage(p);
  }

  goToPage(e) {
    var page = e.currentTarget.dataset.page;
    var params = e.currentTarget.dataset.params;
    var manager = e.currentTarget.dataset.detail ? '/manager' : '';
    params = !!params ? "?" + params : "";
    helperServ.goToPage(`..${manager}/${page}/${page}${params}`);
  }
}

module.exports = orderlist;