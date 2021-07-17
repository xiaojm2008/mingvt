// pages/myCart/myCart.js
var cartServ = require("../../lib/services/cart.js");
var helperServ = require("../../lib/utils/helper.js");
var pageServ = require("../../lib/utils/pagehelper.js");
var orderServ = require("../../lib/services/order.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasTop:true,
    refreshlock:false,//是否禁止下拉刷新
    windowHeight: 0,
    saveHidden: true,
    totalPrice: 0,
    allSelect: true,
    noSelect: false,
    listData: [],
    batch_time: -1,//-1查询所有，0分页
  },
  _qryParams: {
    orderby_field: "updatetime",
    orderby_type: "desc"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var userInfo = helperServ.getUserInfo();
    if (!userInfo) {
      helperServ.goToPage("../login/login");
      return;
    }
    this.refresh();
  },
  // 刷新数据
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
    pageServ.loadMore2("trader", "cart.getCartList", params, isPull, this,(err,res)=>{
      if(err){
        return;
      }
      if (this.data.listData.length===0){
        this.setData({
          refreshlock:false,
          hasTop:false
        })
        return;
      }
      var data={};
      data["hasTop"]=true;
      this.calcTotalPay(false,data);
      this.setData(data);
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
   this.refresh();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  touchS: function() {

  },
  touchM: function() {

  },
  touchE: function() {

  },
  goShoping: function() {
    //helperServ.switchToTab("../index/index");
    helperServ.goToPage("/pages/goodsList/goodsList?shopid="+app.globalData.shopid);
  },
  saveCart: function() {

  },
  editCart: function() {
    if (this.data.listData.length===0){
      return;
    }
    var data={};
    data["saveHidden"] = !this.data.saveHidden;
    if (!this.data.saveHidden) {
      this.data.listData.forEach((item, i) => {
        item.active = item.bactive;
        data[`listData[${i}].active`] = item.active;       
      });
      this.calcTotalPay(false, data);
    } else {
      this.data.listData.forEach((item,i) => {
        //item.active = false;
        data[`listData[${i}].bactive`] = item.active;
        data[`listData[${i}].active`] = false;       
      });     
    }
    data["refreshlock"] = this.data.saveHidden;
    this.setData(data);
  },
  updCart: function(goods, list, index) {
    wx.showLoading({
      title: '请稍等...',
    });
    cartServ.updCart({
      _id: goods._id,
      num: goods.num
    }).then(res => {
      wx.hideLoading();
      if (res.result.stats.updated > 0) {
        var data = {};
        //this.calcTotalPay(false,data);
        data[`listData[${index}].num`] = goods.num;
        this.setData(data);
      }
    }).catch(err => {
      wx.hideLoading();
    });
  },
  decreaseBtnTap: function(e) {
    var index = e.currentTarget.dataset.index;

    if (index === "" || index === null) {
      return;
    }
    var list = this.data.listData;
    var goods = list[parseInt(index)];
    if (goods.num > 1) {
      goods.num--;
      this.updCart(goods, list, index);
    }
  },
  increaseBtnTap: function(e) {
    var index = e.currentTarget.dataset.index;
    if (index === "" || index === null) {
      return;
    }
    var list = this.data.listData;
    var goods = list[parseInt(index)];
    if (goods.num < 99) {
      goods.num++;
      this.updCart(goods, list, index);
    }
  },
  oneSelectTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.listData;
    if (index !== "" && index != null) {
      var goods = list[parseInt(index)],data={};
      goods.active = !goods.active;
      this.calcTotalPay(false, data);
      data[`listData[${index}].active`] = goods.active;
      this.setData(data);
      if (this.data.saveHidden) {
        console.log(`oneSelectTap------${this.data.saveHidden}------`)
        cartServ.updCartItemActive({
          _id: goods._id,
          active: goods.active
        })
      }
    }
  },
  allSelectTap: function(e) {
    var data = {};
    if (this.data.allSelect) {
      this.data.listData.forEach((item, idx, arr) => {
        item.active = false;
        data[`listData[${idx}].active`] = false;
      });    
    } else {
      this.data.listData.forEach((item, idx, arr) => {
        //item.active = true;
        item.active = true;
        data[`listData[${idx}].active`] = item.active;
      });
    }
    data["allSelect"] = !this.data.allSelect;   
    this.calcTotalPay(this.data.allSelect, data);
    this.setData(data);
    if (this.data.saveHidden) {
      //需要计算总金额
      console.log(`allSelectTap ------${this.data.saveHidden}------`);
      cartServ.updCartItemActive({
        all_active: true,
        active: this.data.allSelect
      });
    }
  },
  calcTotalPay:function(clearSel,data){
    if (clearSel){
      data["totalPrice"]=0;
      data["noSelect"] = false;    
    } else{
      var totalPay = 0, selnum=0;
      this.data.listData.forEach((item, idx, arr) => {
        if (item.active) {
          totalPay += parseFloat(item.price) * item.num;
          selnum++;
        }
      });
      data["totalPrice"] = totalPay;
      data["noSelect"] = selnum == 0;
      data["allSelect"] = selnum == this.data.listData.length;
    }
  },
  /*
  setGoodsList: function(goodsList,index) {
    var totalPay = 0;
    var selnum = 0;
    var allSelect = false,
      noneSelect = true;
    (goodsList || []).forEach((item, idx, arr) => {
      if (item.active) {
        totalPay += parseFloat(item.price) * item.num;
        selnum++;
      }
    });
    allSelect = (selnum == goodsList.length ? true : false);
    noneSelect = (selnum == 0 ? true : false);
    totalPay = parseFloat(totalPay.toFixed(2));
    this.setData({
      totalPrice: totalPay,
      allSelect: allSelect,
      noSelect: noneSelect,
      goodsList: goodsList
    });
  },*/
  toPayOrder: function() {
    var that = this;
    var goodsInfo = this.data.listData.filter((item, idx, arr) => {
      return item.active;
    }).map((item, idx, arr) => {
      return {
        cover: item.cover,
        shopid: item.shopid,
        shopname: item.shopname,
        goodsno: item.goodsno,
        goodsname: item.goodsname,
        model_id: item.model_id,
        model_value: item.model_value,
        models_mainkey: item.models_mainkey || '',
        models_mainkey_idx: item.models_mainkey_idx,
        num: item.num,
        price: item.price,
        support_drawback: item.support_drawback || '0'
      };
    });
    if (goodsInfo.length == 0) {
      return;
    }
    var data = encodeURIComponent(JSON.stringify(Object.assign({
      order_id: null,
      shopid: null,
      shopname: null,
      status: '0'
    }, {
      goods_info: goodsInfo
    })));
    var pagePath = '/pages/orderDetail/orderDetail?orderpending=' + data;
    helperServ.goToPage(pagePath);

    orderServ.addOrderPending({
      goodsInfo: goodsInfo
    }).then(res => {}).catch(err => {});
  },
  deleteSelected: function() {
    var goods = this.data.listData.filter((item, idx, arr) => {
      return item.active;
    }).map(item => {
      return item._id
    });
    if (goods.length == 0) {
      return;
    }
    wx.showModal({
      title: '提示',
      content: '您确认删除购物车里的商品吗',
      success: (res) => {
        if (res.cancel) {
          return;
        }
        wx.showToast({
          title: '请求中...',
          icon: 'loading'
        });
        cartServ.delCart({
          openid: null,
          _ids: goods
        }).then(res => {
          wx.hideLoading();
          if (res.result.stats.updated > 0) {
            wx.showModal({
              title: '返回信息',
              content: '删除购物车商品成功',
            });
            /*
            cartServ.getCartList().then(res => {
              this.setGoodsList(res.result ? res.result.data : []);

            });*/
            this.refresh();
          } else {
            wx.showModal({
              title: '返回信息',
              content: '删除购物车商品失败',
            })
          }
        }).catch(err => {
          wx.hideLoading();
          wx.showModal({
            title: '返回信息',
            content: '删除购物车商品失败',
          })
        });
      }
    });
  },
  goGoods: function(event) {
    let goodsno = event.currentTarget.dataset.goodsno;
    if (goodsno) {
      helperServ.goToPage('/pages/goodsDetail/goodsDetail?goodsno=' + goodsno,true);
    }
  }
})