const app = getApp();
const mytools = require("../template/tools.js");
Component({
  /**
   * 组件的属性列表
   */

  properties: {
    show: {
      type: Boolean,
      value: ''
    },
    /*
     * options:{
     *  x:0
     *  y:0
     * width:1
     * height:1
     * style:'style'
     * title:'view',
     * disabled:true,
     * scale:true,
     * scaleTogger:function{},
     * chgTogger:function{},
     * node:
     * }
     */
    options: {
      type: Object,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    /*show: '',
    options: null*/
  },
  lifetimes: {
    created() {
      new mytools(this);
      this.options = {};
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    hide() {
      console.log("******hide******");
      this.setData({
        show: ''
        //'options.pstyle': ''
      });
    },
    regEvent(options) {
      this.options.scaleTogger = options.scaleTogger;
      this.options.chgTogger = options.chgTogger;
      this.options.hTMTogger = options.hTMTogger;
      this.options.vTMTogger = options.vTMTogger;
    },
    show(options) {
      this.regEvent(options);
      //var somes = "position:fixed;z-index:10;"
      //var pstyle = options.pwidth > 0 ? `width:${options.pwidth}px;height:${options.pheight}px;top:${options.ptop}px;left:${options.pleft}px;${somes}`:'';
      this.setData({
        show: true,
        winHeight:app.getWinHeight()-30,
        winWidth:app.getWinWidth(),
        options: {
          x: options.x,
          y: options.y,
          //pstyle: pstyle,
          width: options.width,
          height: options.height,
          style: options.style,
          title: options.title,
          disabled: options.disabled,
          scale: options.scale,
          node: options.node
        }
      });
    },
    scaleTogger(e) {
      //console.log("****scaleTogger*****",e)
      this.options.scaleTogger && this.options.scaleTogger(e);
    },
    chgTogger(e) {
      //console.log("****chgTogger*****", e)
      this.options.chgTogger && this.options.chgTogger(e);
    },
    vTouchMove(e){
      //console.log("****vTouchMove*****", e)
      this.options.vTMTogger && this.options.vTMTogger(e);
    },
    hTouchMove(e){
      //console.log("****hTouchMove*****", e)
      this.options.hTMTogger && this.options.hTMTogger(e);
    },
    /** event togger */
    addCtrlTogger(e) {
      this.triggerEvent('addCtrl', {
        ckey: e.detail.ckey
      });
    },
    delCtrlTogger(e) {
      this.triggerEvent('delCtrl', {
        ckey: e.detail.ckey
      });
    },
    editCtrlTogger(e) {
      this.triggerEvent('editCtrl', {
        ckey: e.detail.ckey
      });
    },
    operCtrlTogger(e) {
      this.triggerEvent('operCtrl', {
        fromsrc: "mymover",
        nodeindex: e.detail.nodeindex,
        pos: e.detail.pos,
        ckey: e.detail.ckey
      });
    },
    operNodeTogger(e) {
      this.triggerEvent('operNode', {
        fromsrc: "mymover",
        nodeindex: e.detail.nodeindex,
        pos: e.detail.pos,
        ckey: e.detail.ckey
      });
    },
    locatedPNodeTogger(e) {
      this.triggerEvent('locatedPNode', {
        fromsrc: "mymover",
        nodeindex: e.detail.nodeindex,
        pos: e.detail.pos,
        ckey: e.detail.ckey
      });
    },
  }
})