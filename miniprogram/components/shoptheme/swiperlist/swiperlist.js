const helperServ = require("../../../lib/utils/helper.js");
const pagecfg = require("../cfg/pagecfg.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const rpc = require("../../../lib/utils/rpc.js");
const ximport = require("../../template/ximport.js");
const PAGE_SIZE = 10;
const SERV_MANAGER = "trader";
Component({
  options: {
    pureDataPattern: /^_/
  },
  /**
   * 组件的属性列表
   */
  properties: {
    category: {
      type: Object,
      value: []   
    },
    action: {
      type: String,
      value: null,
      observer: 'init',
    },
    manager: {
      type: String,
      value: null
    },
    temptype: {
      type: String,
      value: 'goodslist'
    },
    lockflag: {
      type: Boolean,
      value: false,
      observer: 'scrollLock'
    },
    refreshlock: {
      type: Boolean,
      value: false
    },
    refreshSize:{
      type:Number,
      value:80
    },
    defParams: {
      type: Object,
      value: {}
    },
    orderBy: {
      type: Object,
      value: {}
    },
    myStyle:{
      type:String,
      value:""
    },
    bottomSize:{
      type: Number,
      value: 0
    },
    options:{
      type:Object,
      value:null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    scrolllock: ''
  },
  lifetimes: {
    ready() {
      if (this.data.lockflag) {   
        this.observ = wx.createIntersectionObserver(this);
        this.observ.relativeTo("#topview").observe('#swipertab', (res) => {
          //console.log("createIntersectionObserver", res);
          this.setData({
            scrolllock: res.intersectionRatio === 0, // 不相交就不能滚动(>0表示相交，那么就可以滚动)          
          })
        });
      } else {
        this.setData({
          scrolllock: ''
        })
      }
      if (ximport[this.properties.temptype]){
        this.data["_"+this.properties.temptype] = new ximport[this.properties.temptype](this);
      }
    },
    detached() {
      if (this.page) {
        delete this.query;
        delete this.page;
      }
      if (this.observ){
        //console.log("****observ.disconnect****");
        this.observ.disconnect();
      }
      if (this.data["_" + this.properties.temptype]){
        delete this.data["_" + this.properties.temptype];
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /*
    releaseTop() {
      return pageServ.getEleRect("#swipertab", this, (posi) => {
        wx.pageScrollTo({
          scrollTop: posi.scrollTop-2,
          duration: 100,
          success: (res) => {
            console.log(`success:${res}`);
          },
          fail: (err) => {
            console.log("err:" + err);
          }
        }) 
      });
      //this.triggerEvent("releasetop");
    },
    */
    scrollLock(newVal, oldVal) {
      this.setData({
        scrolllock: newVal
      })
    },
    goToGoods(e) {
      helperServ.goToPage(pagecfg.goodsdetail_page + "?goodsno=" + e.currentTarget.dataset.goodsno);
    },
    init() {
      if (!this.properties.action || !this.properties.manager) {
        return;
      }
      var categoryData = [],
        categoryMenu = [],
        curr=0;
      this.properties.category.forEach((v,i) => {
        categoryData.push({
          requesting: false,
          loadFinish: false,
          emptyShow: true,
          params: Object.assign({},this.properties.defParams,v.params,this.properties.orderBy) || {}, //{ subid: v.code}
          page_size: 10,
          batch_time: -1,
          name: v.name || v,
          temptype:v.temptype||'',
          listData: []
        });
        categoryMenu.push(v.name || v);
        if(v.def){
          curr = i;
        }
      });
      this.setData({
        duration: 200, // swiper-item 切换过渡时间
        //showPage: -1,  控制列表空状态的显示时机
        categoryCur: curr,
        categoryMenu: categoryMenu,
        categoryData: categoryData
      })
      this.refresh();
    },

    loadMore(params, isPull) {
      let curPage = this.getCurrentPage(),
        data = {};
      if (!curPage.loadFinish) {
        curPage.batch_time ? curPage.batch_time++ : curPage.batch_time = 1;
        console.log("loadMore", curPage.batch_time);
      }
      data[`categoryData[${this.data.categoryCur}].batch_time`] = curPage.batch_time;
      data[`categoryData[${this.data.categoryCur}].requesting`] = true;
      this.setData(data);
      //wx.hideNavigationBarLoading()
      params.page_size = curPage.page_size ? curPage.page_size : PAGE_SIZE;
      params.batch_time = curPage.batch_time;
      rpc.doAction(params, this.properties.action || 'goods.getGoodsList', this.properties.manager || SERV_MANAGER).then(res => {
        if (!res.result.data) {
          helperServ.showModal({
            content: res.result.errMsg,
          })
          data[`categoryData[${this.data.categoryCur}].requesting`] = false;
          data[`categoryData[${this.data.categoryCur}].loadFinish`] = true;
          this.setData(data);
          return;
        }
        var arr = res.result.data;
        console.log(`1.loadMore Data length: ${arr.length} loadFinish:`);
        if (!curPage.loadFinish) {
          if (isPull) {
            curPage.listData = arr;
          } else {
            curPage.listData = curPage.listData.concat(arr)
          }
        }
        if (arr.length < curPage.page_size) {
          curPage.loadFinish = true;
        } else {
          curPage.loadFinish = false;
        }
        data[`categoryData[${this.data.categoryCur}].requesting`] = false;
        data[`categoryData[${this.data.categoryCur}].loadFinish`] = curPage.loadFinish;
        data[`categoryData[${this.data.categoryCur}].listData`] = curPage.listData;
        this.setData(data);
      }).catch(err => {
        data[`categoryData[${this.data.categoryCur}].requesting`] = false;
        this.setData(data);
        helperServ.showToast({
          title: err.errMsg || err.message,
          icon: 'none'
        })
      });
    },
    // 顶部tab切换事件
    tabTogger(e) {
      this.setData({
        duration: 0
      });
      setTimeout(() => {
        this.setData({
          categoryCur: e.detail.index
        });
      }, 0);
    },
    // 页面滑动切换事件
    swipeChange(e) {
      this.setData({
        duration: 200
      });
      setTimeout(() => {
        this.setData({
          categoryCur: e.detail.current
        });
        this.loadData()
      }, 0);
    },
    // 获取当前激活页面的数据
    getCurrentPage() {
      return this.data.categoryData[this.data.categoryCur]
    },
    // 判断是否为加载新的页面,如果是去加载数据
    loadData() {
      let curPage = this.getCurrentPage();
      if (curPage.listData.length == 0) {
        this.refresh();
      }
    },
    // 刷新数据
    refresh() {
      let curPage = this.getCurrentPage();
      curPage.batch_time = -1;
      curPage.loadFinish = false;
      var data = {};
      data[`categoryData[${this.data.categoryCur}].batch_time`] = curPage.batch_time;
      data[`categoryData[${this.data.categoryCur}].loadFinish`] = false;
      this.setData(data);
      this.loadMore(curPage.params, true);
    },
    // 加载更多
    more() {
      this.loadMore(this.getCurrentPage().params, false);
    }
  }
})