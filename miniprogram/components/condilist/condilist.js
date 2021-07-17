const helperServ = require("../../lib/utils/helper.js");
const pagecfg = require("../shoptheme/cfg/pagecfg.js");
const cache = require("../../lib/utils/cache.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const rpc = require("../../lib/utils/rpc.js");
const PAGE_SIZE = 10;
Component({
  options: {
    pureDataPattern: /^_/
  },
  /**
   * 组件的属性列表
   */
  properties: {
    temptype: {
      type: String,
      value: "goodslist"
    },
    refreshsize: {
      type: Number,
      value: 80
    },
    condi: {
      type: Object,
      value: [],
      observer: 'condiInit',
    },
    defParams:{
      type: Object,
      value: {}
    },
    orderBy:{
      type: Object,
      value: {}
    },
    action: {
      type: String,
      value: "goods.getGoodsList"
    },
    manager: {
      type: String,
      value: "trader"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    requesting: false,
    batch_time: -1,
    loadFinish: false,
    _qryParams: {},
    listData: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    condiInit(newV, oldV) {
      if (!newV || newV.length === 0 || !this.data.action) {
        if(this.data.action){
          Object.assign(this.data._qryParams, this.data.defParams, this.data.orderBy);
          this.refresh();
        }
        return;
      }
      Object.assign(this.data._qryParams, this.data.defParams, this.data.orderBy);
      this.refresh();
    },
    tabTogger(e) {
      console.log("***tabTogger******",e)
      Object.assign(this.data._qryParams, e.detail.item.params, this.data.orderBy);
      this.refresh();
    },
    // 刷新数据
    refresh() {
      this.setData({
        batch_time: -1,
        loadFinish: false
      });
      this.loadMore(this.data._qryParams, true);
    },
    // 加载更多
    more() {
      this.loadMore(this.data._qryParams, false);
    },
    loadMore(params, isPull) {
      let data = {};
      if (!this.data.loadFinish) {
        this.data.batch_time ? this.data.batch_time++ : this.data.batch_time = 1;
        console.log("loadMore", this.data.batch_time);
      }
      data[`batch_time`] = this.data.batch_time;
      data[`requesting`] = true;
      this.setData(data);
      wx.hideNavigationBarLoading()
      params.page_size = PAGE_SIZE;
      params.batch_time = this.data.batch_time;
      rpc.doAction(params, this.properties.action, this.properties.manager).then(res => {
        if (!res.result.data) {
          helperServ.showModal({
            content: res.result.errMsg,
          })
          data[`requesting`] = false;
          data[`loadFinish`] = true;
          this.setData(data);
          return;
        }
        var arr = res.result.data;
        if (!this.data.loadFinish) {
          if (isPull) {
            this.data.listData = arr;
          } else {
            this.data.listData = this.data.listData.concat(arr)
          }
        }
        if (arr.length < PAGE_SIZE) {
          this.data.loadFinish = true;
        } else {
          this.data.loadFinish = false;
        }
        data[`requesting`] = false;
        data[`loadFinish`] = this.data.loadFinish;
        data[`listData`] = this.data.listData;
        this.setData(data);
      }).catch(err => {
        data[`requesting`] = false;
        this.setData(data);
        helperServ.showToast({
          title: err.errMsg || err.message,
          icon: 'none'
        })
      });
    },
    goToGoods(e) {
      helperServ.goToPage(pagecfg.goodsdetail_page + "?goodsno=" + e.currentTarget.dataset.goodsno);
    }
  }
})