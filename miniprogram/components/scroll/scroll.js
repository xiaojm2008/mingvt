const helper = require("../../lib/utils/helper.js");
const app = getApp();
Component({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  properties: {
    // 加载中
    requesting: {
      type: Boolean,
      value: false,
      observer: 'requestingEnd',
    },
    // 加载完毕
    end: {
      type: Boolean,
      value: false,
    },
    // 控制空状态的显示
    emptyShow: {
      type: Boolean,
      value: true,
    },
    // 当前列表长度
    listCount: {
      type: Number,
      value: -1,
    },
    // 空状态的图片
    emptyUrl: {
      type: String,
      value: "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/empty.png"
    },
    // 空状态的文字提示
    emptyText: {
      type: String,
      value: "未找到数据"
    },
    // 是否有header
    hasTop: {
      type: Boolean,
      value: false
    },
    // 下拉刷新的高度
    refreshSize: {
      type: Number,
      value: 80,
      observer: 'refreshChange'
    },
    // 底部高度
    bottomSize: {
      type: Number,
      value: 0,
    },
    // 颜色
    color: {
      type: String,
      value: ""
    },
    /** scroll-view disabled */
    scrolllock: {
      type: Boolean,
      value: false,
     /* observer: 'scrollLockChg'*/
    },
    /**
     * 下拉刷新锁定
     */
    refreshlock:{
      type: Boolean,
      value: false,
      observer: 'refreshLockChg'
    },
    myStyle:{
      type:String,
      value:""
    }
  },
  data: {
    pf:'',//平台ios,android
    /* 未渲染数据 */
    mode: 'more', // refresh 和 more 两种模式
    successShow: false, // 显示success
    successTran: false, // 过度success
    refreshStatus: 1, // 1: 下拉刷新, 2: 松开更新, 3: 加载中, 4: 加载完成
    move: -60, // movable-view 偏移量
    timer: null,
    /* 渲染数据 */
    scrollTop: 0,
    _refreshHgh: 0, // refresh view 高度负值
    _succ_refHgh: 0, // refresh view - success view 高度负值
    //overOnePage: false
  },

  methods: {
    /** Ios 专用处理 
    releaseTopLock:function(){
      this.triggerEvent("releasetop");
    },*/
    refreshLockChg(newV){
      if(newV){
        this.setData({
          pf: app.getPf()
        })
      }
    },
    /*movable-view 必须要	bind:touchend="touchend"，但是 touchend()定义和实现好像不用*/
    touchend() {
    },
    /**
     * 处理 bindscrolltolower 失效情况
     */
    scroll(e) {
      //console.log("***scroll********", e);
      // 可以触发滚动表示超过一屏
      /*
      this.setData({
        overOnePage: true
      });*/
      clearTimeout(this.data.timer);
      this.setData({
        timer: setTimeout(() => {
          this.setData({
            scrollTop: e.detail.scrollTop
          })
        }, 100)
      });
    },
    /**
     * movable-view 滚动监听
     */
    change(e) {
      //console.log("****change*****",e)
      let refreshStatus = this.data.refreshStatus,
        diff = e.detail.y;

      if (refreshStatus >= 3) return;

      if (diff > -10) {
        this.setData({
          refreshStatus: 2
        });
      } else {
        this.setData({
          refreshStatus: 1
        });
      }
    },
    /**
     * movable-view 触摸结束事件
     */
    touchend() {
      let refreshStatus = this.data.refreshStatus;

      if (refreshStatus >= 3) return;

      if (refreshStatus === 2) {
        wx.vibrateShort();
        this.setData({
          refreshStatus: 3,
          move: 0,
          mode: 'refresh'
        });
        this.triggerEvent('refresh');
      } else if (refreshStatus === 1) {
        this.setData({
          move: this.data._refreshHgh
        });
      }
    },
    /**
     * 加载更多
     */
    more() {
      if (!this.properties.end) {
        this.setData({
          mode: 'more'
        });
        this.triggerEvent('more');
      }
    },
    /**
     * 监听 requesting 字段变化, 来处理下拉刷新对应的状态变化
     */
    requestingEnd(newVal, oldVal) {
      if (this.data.mode === 'more') return;
      if (oldVal === true && newVal === false) {
        setTimeout(() => {
          this.setData({
            successShow: true,
            refreshStatus: 4,
            move: this.data._succ_refHgh
          });
          setTimeout(() => {
            this.setData({
              successTran: true,
              move: this.data._refreshHgh
            });
            setTimeout(() => {
              this.setData({
                refreshStatus: 1,
                successShow: false,
                successTran: false,
                move: this.data._refreshHgh
              });
            }, 350)
          }, 1500)
        }, 600)
      } else {
        if (this.data.refreshStatus !== 3) {
          this.setData({
            refreshStatus: 3,
            move: 0
          });
        }
      }
    },
    /**
     * 监听下拉刷新高度变化, 如果改变重新初始化参数, 最小高度80rpx
     */
    refreshChange(newVal, oldVal) {
      if (newVal < 80) {
        this.setData({
          refreshSize: 80
        });
      }
      // 异步加载数据时候, 延迟执行 init 方法, 防止基础库 2.7.1 版本及以下无法正确获取 dom 信息
      setTimeout(() => this.init(), 10);
    },
    getPx(rpx){
      return rpx / 750 * app.systemInfo.windowWidth;
    },
    /**
     * 初始化scroll组件参数, 动态获取 下拉刷新区域 和 success 的高度
     */
    init() {
      /*
      let query = this.createSelectorQuery();
      query.select("#refresh").boundingClientRect();
      query.select("#success").boundingClientRect();
      query.exec((res) => {
        this.setData({
          _refreshHgh: -res[0].height,
          move: -res[0].height,
          _succ_refHgh: res[1].height - res[0].height
        });
      });*/
      var refreshH = this.getPx(this.properties.refreshSize);
      this.setData({
        _refreshHgh: 0-refreshH,
        move: 0-refreshH,
        _succ_refHgh: 35 - refreshH
      });
    },
  },
  ready() {
    this.init();
  }
});