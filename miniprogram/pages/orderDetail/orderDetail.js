// miniprogram/pages/orderDetail/orderDetial.js
var app = getApp();
const cache = require("../../lib/utils/cache.js");
var orderServ = require("../../lib/services/order.js");
var helperServ = require("../../lib/utils/helper.js");
var pageServ = require("../../lib/utils/pagehelper.js");
var goodsServ = require("../../lib/services/goods.js");
var addressServ = require("../../lib/services/address.js");
var orderlist = require("../../components/template/orderlist/orderlist.js");
//var goodsList = require("../../lib/services/goodsList.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressinfo: [],
    orderInfo: {},
    dict: {
      100006: null,
      100007: null,
      100008: null,
      100009: null
    },
    loadFinish: false,
  },
  loadFunc: goodsServ.getGoodsList,
  loadFuncParams: {
    hostsell: '1',
    orderby_field: "updatetime",
    orderby_type: "desc"
  },
  /*
  groupByShop: function(goodsInfo, order) {
    var goodsForShop = {},
      arr = [];
    goodsInfo.forEach((v, i, a) => {
      if (goodsForShop[v.shopid]) {
        goodsForShop[v.shopid].push(v);
      } else {
        goodsForShop[v.shopid] = [v];
      }
    });
    for (var k in goodsForShop) {
      var v = goodsForShop[k];
      arr.push(Object.assign({
        shopid: k,
        shopname: v[0].shopname,
        goodsinfo: v
      }, order));
    }
    return arr;
  },*/
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!this.orderlist) {
      this.orderlist = new orderlist(this);
    }
    this.commLoad(options);
  },
  /**
   * 已经生成了订单数据，待支付
   */
  getOrderDetail: function (options) {
    orderServ.getOrderDetail({
      _id: options._id || '',
      orderid: options.orderid || ''
    }).then(res => {
      var order = !res.result.data || res.result.data.length == 0 ? null : res.result.data[0];
      if (!order) {
        helperServ.showModal({
          content: res.result.errMsg
        });
        return;
      }
      var data = {};
      data['orderInfo'] = order;
      if (!order["address_info"]) {
        this.getDefaultAddress(data);
      }
      this.setData(data);
    }).catch(err => {
      helperServ.showModal({
        content: res.errMsg || err.message
      });
    });
  },
  getOrderDetailByPayId:function(options){
    orderServ.getOrderDetail({
      pay_id: options.pay_id
    }).then(res => {
      var order = !res.result.data || res.result.data.length == 0 ? null : res.result.data;
      if (!order) {
        helperServ.showModal({
          content: res.result.errMsg
        });
        return;
      }
      var data = {};
      data['orderInfo'] = this.groupByShop(order);
      this.setData(data);
    }).catch(err => {
      helperServ.showModal({
        content: res.errMsg || err.message
      });
    });
  },
  groupByShop: function (goodsOrder) {
    var total_pay = 0; //saleprice = 0
    goodsOrder.total_pay = 0;
    goodsOrder.goods_info = goodsOrder.goods_info.sort((a, b) => {
      if (a.shopid < b.shopid)
        return -1;
      else
        return 1;
    });
    goodsOrder.goods_info.forEach((v, i, a) => {
      v.saleprice = parseFloat((v.price * v.num).toFixed(2));
      total_pay += v.saleprice;
      v.total_pay = total_pay;
      if (i == 0 || (a[i - 1].shopid != a[i].shopid)) {
        console.debug(i, v)
      }
      if (a.length == i + 1 || (i + 1 < a.length && a[i].shopid != a[i + 1].shopid)) {
        goodsOrder.total_pay += total_pay;
        total_pay = 0;
      }
    });
    return goodsOrder;
  },
  /**
   * initPendOrder（待生成订单数据）
   * 以下此两种情况：
   * 商品详情页面支付
   * 购物车选择购买
   */
  initPendOrder: function (options) {
    var orderpending = decodeURIComponent(options.orderpending);
    return this.groupByShop(JSON.parse(orderpending));
   /*
    var total_pay = 0,
      saleprice = 0;
    orderpending.total_pay = 0;
    orderpending.goods_info = orderpending.goods_info.sort((a, b) => {
      if (a.shopid < b.shopid)
        return -1;
      else
        return 1;
    });
    orderpending.goods_info.forEach((v, i, a) => {
      v.saleprice = parseFloat((v.price * v.num).toFixed(2));
      total_pay += v.saleprice;
      v.total_pay = total_pay;
      if (i == 0 || (a[i - 1].shopid != a[i].shopid)) {
        console.debug(i, v)
      }
      if (a.length == i + 1 || (i + 1 < a.length && a[i].shopid != a[i + 1].shopid)) {
        orderpending.total_pay += total_pay;
        total_pay = 0;
      }
    });
    return orderpending;
    */
  },

  commLoad: function (options) {
    cache.getDict(Object.keys(this.data.dict), (err, res) => {
      if (err) {
        return;
      }
      this.userInfo = helperServ.getUserInfo();
      if (!this.userInfo.openid) {
        helperServ.showModal({
          content: "用户初始化失败！"
        });
        return;
      }
      var data = {};
      data['dict'] = res;
      data['avatarurl'] = this.userInfo.avatarurl || '/images/ic_user.png';
      if (options.orderpending) {
        data['orderInfo'] = this.initPendOrder(options);
        this.getDefaultAddress(data);
      } else if(options.pay_id){
        this.getOrderDetailByPayId(options);
      } else {
        this.getOrderDetail(options);
      }
      this.setData(data);
    });
  },

  getDefaultAddress: function () {
    addressServ.getAddressList({
      is_default: 1
    }).then(res => {
      if (!res.result.data || res.result.data.length === 0) {
        /*
        data['orderInfo.address_info.name'] = this.userInfo.username || this.userInfo.nickname;
        data['orderInfo.address_info.contact'] = this.userInfo.phone;
        data['orderInfo.address_info.province.text'] = this.userInfo.province;
        data['orderInfo.address_info.city.text'] = this.userInfo.city;
        data['orderInfo.address_info.district.text'] = this.userInfo.district || '';
        data['orderInfo.address_info.detailaddress'] = this.userInfo.detailaddress || '';
        */
        return;
      }
      var data = {};
      data['orderInfo.address_info'] = res.result.data[0];
      this.setData(data);
    }).catch(e => {
      helperServ.showModal({
        content: e.errMsg || e.message,
      })
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    pageServ.setWinHgh(this);
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
    if (this.orderlist) {
      console.log("********orderDetail Unload******");
      delete this.orderlist;
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  tapToItemHandler: function (event) {
    let goodsno = event.currentTarget.dataset.goodsno;
    if (goodsno) {
      helperServ.goToPage('/pages/goodsDetail/goodsDetail?goodsno=' + goodsno);
    }
  },
  showAddressList: function () {
    var _id = this.data.orderInfo.address_info ? this.data.orderInfo.address_info._id : '';
    var currPage = helperServ.getCurrPage();
    var options = currPage.options;
    options.nextPageCallBack = (err, address_info) => {
      this.setData({
        "orderInfo.address_info": address_info
      })
    }
    helperServ.goToPage('/pages/myAddress/myAddress?addressid=' + _id);
  },
  addAddress: function () {
    var orderId = this.data.orderInfo.order_id;
    helperServ.goToPage('/pages/addAddress/addAddress?orderid=' + orderId);
  },
  inputTogger: function (e) {
    var id = e.currentTarget.id,
      v = e.detail.value,
      pack = e.currentTarget.dataset.pack || '',
      data = {};
    data[`${pack}${id}`] = v;
    this.setData(data);
  }
})