const app = getApp();
var shopServ = require("../../lib/services/shop.js");
const helperServ = require("../../lib/utils/helper.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
     * name:''
     * params:{}
     */
    category: [],
    action: null,
    manager: "trader",
    temptype: 'goodslist',
    defParams:{},
    orderBy:{}
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    shopServ.listCategory({
      shopid: options.shopid
    }).then(res => {
      //helperServ.hideLoading();
      if (res.result.data && res.result.data.length > 0) {
        this.data.category = res.result.data[0].items.map(v => {
          return this.transferCate(v, options.code)
        });
        this.setData({
          category: this.data.category,
          action:"goods.getGoodsList"
        });
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      //helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  transferCate: function(cate,cursel) {
    return {
      name: cate.name,
      params: {
        subid: cate.code
      },
      active: cate.code === cursel,
      items: cate.items && cate.items.map(v => {
        return this.transferCate(v, cursel);
      })
    }
  }
})