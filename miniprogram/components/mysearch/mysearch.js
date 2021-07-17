const pageServ = require('../../lib/utils/pagehelper.js');
const xsearch = require("./xsearch.js");
const actionMap = require("./actionMap.js");
const app = getApp();

Component({
  /*options: {
    addGlobalClass: true
  },*/
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: {
      type: String,
      value: ''
    },
    type: {
      type: String,
      value: ''
    },
    focus: {
      type: Boolean,
      value: false
    },
    placeholder: {
      type: String,
      value: '搜索'
    },
    value: {
      type: String,
      value: ''
    },
    search: {
      type: Function,
      value: null
    },
    throttle: {
      type: Number,
      value: 600
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    offsetY: {
      type: Number,
      value: 0
    },
    cancel: {
      type: Boolean,
      value: true
    },
    /** 搜索的内容 */
    catetype: {
      type: String,
      value: ''
    }
  },
  data: {
    cate:{},
    result: {
      shop: [],
      order: [],
      goods: [],
      prom: []
    },
    loading: false,
    totalNum:0
  },
  lastSearch: Date.now(),
  lifetimes: {
    ready: function() {
      if (typeof this.data.search !== 'function') {
        this.data._xsearch = new xsearch(this);
      }
      pageServ.setWinHgh(this, this.data.offsetY + 1);
      this.setData({
        statusBarHeight: app.systemInfo.statusBarHeight
      })
      this.data._pageSize = parseInt((this.data.windowHeight - 45) / 62);
      for(var k in actionMap){
        this.data.cate[k]=actionMap[k].title;
      }
      this.setData({
        cate: this.data.cate
      })
    },
    detached: function(e) {
      if (this.data._xsearch) {
        delete this.data._xsearch;
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    clearInput: function() {
      console.log("clearInput");
      this.setData({
        value: ''
      });
      //this.triggerEvent('clear');
      this.inputChange({
        detail: {
          value: ''
        }
      }, true);
    },
    inputFocus: function(e) {
      //this.triggerEvent('focus', e.detail);
    },
    inputBlur: function(e) {
      this.setData({
        focus: false
      });
      //this.triggerEvent('blur', e.detail);
    },
    showSrhDlg: function() {
      if (this.data.showSrhDlg) {
        pageServ.hideDlg({
          'focus': false,
          'showSrhDlg': false
        }, this, this.data.windowHeight);
        return;
      }
      this.setData({
        focus: true,
        showSrhDlg: true
      });
      pageServ.showDlg(this);
    },
    setSrhType: function(e) {
      this.setData({
        catetype: e.currentTarget.dataset.catetype
      })
      setTimeout(() => {
        this.setData({
          focus: true
        })
      }, 10)
    },
    showLoading: function() {
      this.setData({
        totalNum: 0,
        loadFinish: false
      })
    },
    hideLoading: function() {
      this.setData({
        loadFinish: true
      })
    },
    searchMore(e) {
      var type = e.currentTarget.dataset.key;
      this.setData({
        catetype: type
      })
      this.refresh();
    },
    refresh() {
      this.setData({
        loadFinish: false
      })
      this.more(null, true);
    },
    more(e, refresh) {
      var type = this.data.catetype;
      /*
      var defParams = {
        orderby_field: "updatetime",
        orderby_type: "desc",
        page_size: this.data._pageSize,      
        batch_time: this.batch_time,
        text: this.data.value
      };
      pageServ.loadMore(actionMap[type].action, Object.assign(defParams, actionMap[type].defParams), refresh, this, `result.${type}`, actionMap[type].transfer);
      */
      this.searchBy(type, this.data.value, this.data._pageSize, refresh);
    },
    inputChange: function(e, dontTriggerInput) {
      if (!e.detail.value || !e.detail.value.trim()) {
        this.setData({
          result: {
            shop: [],
            order: [],
            goods: [],
            prom: []
          },
          loading: false,
          //catetype: '',
          totalNum: 0,
          
        })
        return;
      }
      this.setData({
        value: e.detail.value
      });
      if (!dontTriggerInput) {
        //this.triggerEvent('input', e.detail);
      }
      if (Date.now() - this.lastSearch < this.data.throttle) {
        return;
      }
      this.lastSearch = Date.now();
      if (typeof this.data.search !== 'function') {
        if (this.data.catetype){
          this.refresh();
        } else{
          this.showLoading();
          for(var k in this.data.cate){
            this.searchBy(k, e.detail.value, this.data._pageSize, true);
          }
          //this.searchBy("shop", e.detail.value, this.data._pageSize);
          //this.searchBy("order", e.detail.value, this.data._pageSize);
          //this.searchBy("prom", e.detail.value, this.data._pageSize);
        }
      } else {
        this.data.search(e.detail.value).then(json => {
          this.setData({
            result: json
          });
        }).catch(err => {
          console.log('search error', err);
        });
      }
    },
    selectResult: function(e) {
      var index = e.currentTarget.dataset.index,
        key = e.currentTarget.dataset.key;
      var item = this.data.result[key][index];
      this.goToPage(item, key, index);
      /*
      this.triggerEvent('selectresult', {
        index: index,
        item: item
      });*/
    },
    dragStart: function(e) {
      this.startY = e.touches[0].pageY;
    },
    dragMove: function(e) {
      //console.log("*dragMove*", e);
      this.movedDistance = e.touches[0].pageY - this.startY; //e.touches[0].pageY - this.startY;
    },
    dragEnd: function(e) {
      //console.log("*dragEnd*", e);
      //this.movedDistance = e.changedTouches[0].pageY - this.startY;//e.touches[0].pageY - this.startY;
      var data = {};
      if (this.movedDistance > 200) {
        this.movedDistance = 0;
        data["showSrhDlg"] = false;
        data['focus'] = false;
        pageServ.hideDlg(data, this, this.data.windowHeight);
      }
    }
  }
})