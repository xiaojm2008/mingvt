var commServ = require("../../lib/services/common.js");
var constants = require("../../lib/constants.js");
var cache = require("../../lib/utils/cache.js");
var helperServ = require("../../lib/utils/helper.js");
const pageServ = require('../../lib/utils/pagehelper.js');
var shopServ = require("../../lib/services/shop.js");

const mySeq = require("../../lib/utils/mySeq.js");
const app = getApp();
const topHeight = 48;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: null,
    catetype: '1',
    offsetHeight: topHeight,
    selected: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadCategory(options);
  },
  onReady: function() {
    pageServ.setWinHgh(this);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  tapHandler: function(e) {
    this.setData({
      selected: e.currentTarget.dataset.index
    })
  },
  goToPage: function(e) {
    const cidx = e.currentTarget.dataset.cindex,
      item = this.data.category[this.data.selected].items[cidx];
    var more = this.initMoreOptions(item);
    var params = encodeURIComponent(JSON.stringify({
      condi: more.condi,
      action: "goods.getGoodsList",
      manager: "trader",
      defParams: more.defParams,
      orderBy: {
        orderby_field: "updatetime",
        orderby_type: "desc"
      },
      temptype: "goodslist"
    }));
    helperServ.goToPage("/pages/goodsMore/goodsMore?params=" + params);
  },
  loadCategory: function(options) {
    helperServ.showLoading({
      content: '加载中...'
    });
    shopServ.listCategory({
      shopid: app.globalData.shopid
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.data && res.result.data.length > 0) {
        this.setData({
          //search: this.search.bind(this),
          selected: this.data.selected,
          category: res.result.data[0].items
        });
      } else if(!res.result.data) {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  initMoreOptions: function(curitem) {
    var condi = [],
      category = this.data.category.map(v => {
        return this.transferCate(v, curitem.code, null)
      });
    category.push({
      name: "所有",
      params: {
        subid: ""
      }
    });
    condi.push({
      name: curitem.name || "类别",
      title: "类别",
      items: category
    });
    this.priceTabs(condi);
    this.keyWordsTab(condi);
    return {
      condi: condi,
      defParams: this.initSelectIndex(condi)
    }
  },
  transferCate: function(cate, cursel, p) {
    return {
      name: cate.name,
      params: {
        subid: cate.code
      },
      active: (cate.code === cursel || cursel && (cate.code === cursel.substring(0, 3))),
      items: cate.items && cate.items.map(v => {
        if (v.code === cursel) {
          cate.active = true;
        }
        return this.transferCate(v, cursel, cate);
      }).concat({
        name: "所有",
        params: {
          subid: cate.code
        },
        items: []
      })
    }
  },
  priceTabs(tabs) {
    tabs.push({
      name: "价格区间",
      title: "价格区间",
      items: [{
          params: {
            saleprice: '<100',
          },
          name: "100元以下"
        },
        {
          params: {
            saleprice: '100~1000'
          },
          name: "100~1000元"
        },
        {
          params: {
            saleprice: '1000~5000'
          },
          name: "1000~5000元"
        },
        {
          params: {
            saleprice: '5000~20000'
          },
          name: "5000~20000元"
        },
        {
          params: {
            saleprice: '20000~50000'
          },
          name: "20000~50000元"
        },
        {
          params: {
            saleprice: '>50000'
          },
          name: "50000元以上"
        },
        {
          params: {
            saleprice: ''
          },
          name: "所有",
          items: [],
        }
      ]
    });
  },
  keyWordsTab(tabs) {
    tabs.push({
      name: "关键字",
      title: "关键字",
      items: [{
          params: {
            keywords: '特价',
          },
          name: "特价",
          summary: "特价销售"
        },
        {
          params: {
            keywords: '团购'
          },
          name: "团购",
          summary: "团购活动"
        },
        {
          params: {
            keywords: '今日热搜'
          },
          name: "热门",
          summary: "今日热门"
        },
        {
          params: {
            keywords: '品牌'
          },
          name: "品牌",
          summary: "品牌热销"
        },
        {
          params: {
            keywords: '推荐'
          },
          name: "推荐",
          summary: "今日推荐"
        },
        {
          params: {
            keywords: '折扣'
          },
          name: "折扣",
          summary: "今日折扣"
        },
        {
          params: {
            keywords: ''
          },
          name: "所有",
          items: []
        }
      ]
    });
  },
  initSelectIndex(tabs) {
    if (tabs && tabs.length > 0) {
      var defParams = {};
      tabs.forEach((t, tidx) => {
        //t=>tab
        for (var i = 0; i < t.items.length; i++) {
          var l1 = t.items[i];
          if (l1.active) {
            if (l1.items && l1.items.length > 0) {
              tabs[tidx].l2sel = i;
              var l2sub = l1.items && l1.items.findIndex(l2 => l2.active);
              tabs[tidx].l2subsel = l2sub;
              if (l2sub || l2sub === 0) {
                Object.assign(defParams, l1.items[l2sub].params);
              }
            } else if (l1.params) {
              Object.assign(defParams, l1.params);
            }
            tabs[tidx].catesel = i;
            return;
          }
        }
      });
      return defParams;
    }
    return {};
  },
  selectResult: function(e) {
    console.log('select result', e.detail)
  }
})