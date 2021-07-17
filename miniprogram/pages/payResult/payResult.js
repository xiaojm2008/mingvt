var payServ = require("../../lib/services/pay.js");
var helperServ = require("../../lib/utils/helper.js");
//需要在这个页面获取paymentlog流水
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paymentList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...',
    })
    payServ.getPaymentById({
      primary_id: options._id, //对应xlh_orderdetail._id
      order_id: options.order_id,
      pay_id: options.pay_id
    }).then(res => {
      helperServ.hideLoading();
      /**
       *pay_id: 1,
    order_id: 1,
    primary_id: 1, //对应xlh_orderdetail._id
    order_num: 1, //订单数量
    total_pay: 1,
    openid: 1,
    order_openid: 1,
    status: 1,
    errmsg: 1,
    goods_info: 1
       */
      if (!res.result.data || res.result.data.lenght === 0) {
        helperServ.showModal({
          content: "查询不到支付信息"
        })
        return;
      }
      this.setData({
        paymentList: res.result.data
      })
      var payResult =  res.result.data[0];
      setTimeout(()=>{
        //0支付失败，1成功
        if (payResult.status=='0' && payResult.stock_rollback != '1') {
          payServ.rollBackStock({
            _id: payResult._id
          }).then(res => {
            console.log("*******rollBackStock*********", res);
          }).catch(err=> {
            console.log("*******rollBackStock Exception*********", err);
          })
        }
      },100);

    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      })
    })
    /*
    var qryParams = {
      primary_id: options._id,//对应xlh_orderdetail._id
      order_id:options.order_id,
      pay_id: options.pay_id
    };
    var p = null;
    payServ.queryOrder(qryParams).then(res => {
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
    orderServ.payOrder(qryParams).then(res => {
      wx.hideLoading();
      this.setData({
        payResult: res.result
      });
    }).catch(err => {
      wx.hideLoading();
      this.setData({
        payResult: err
      });
    });*/
  },
  goToDetail: function (e) {
    var payResult = this.data.paymentList[e.currentTarget.dataset.index];
    helperServ.goToPage(`/pages/orderDetail/orderDetail?pay_id=${payResult.pay_id}`);
  },
  goToBack: function (e) {
    helperServ.goBack();
  },
})