var pageServ = require("../../../lib/utils/pagehelper.js");
const xcompon = require("../cfg/xcomponent.js");
Component({
  options: {
    pureDataPattern: /^_/ // 指定所有 _ 开头的数据字段为纯数据字段
  },
  /**
   * 组件的属性列表
   */
  properties: {
    node: {
      type: Object,
      value: null
    },
    nodeindex: {
      type: String,
      value: ''
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    _posi: {
      top: 0, //y
      left: 0, //x
      width: 0,
      heigth: 0
    }
  },
  lifetimes: {
    ready() {
      xcompon.addNodeTree(this.properties.node, this.properties.nodeindex, this);
      /*
      this.getEleRect(null, posi => {
        this.setData({
          _posi: posi
        });
       // console.log("*******NodeTree lifetimes ready ******", posi);
       xcompon.addNodeTree(this.properties.node, this.properties.nodeindex, this);
      })*/
      if (this.properties.node.template) {
        //"../template/swiperlist.js"
        //new require(node.template + ".js")(this, node);
      }
    },
    detached: function() {
      xcompon.removeNodeTree(this.properties.node, this.properties.nodeindex);
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    editCtrl(e) {
      console.log('editCtrl', e);
      this.triggerEvent('editCtrl', {
        ckey: e.currentTarget.dataset.ckey
      });
    },
    addCtrl(e) {
      console.log('addCtrl', e);
      this.triggerEvent('addCtrl', {
        ckey: e.currentTarget.dataset.ckey
      });
    },
    delCtrl(e) {
      console.log('delCtrl', e);
      this.triggerEvent('delCtrl', {
        ckey: e.currentTarget.dataset.ckey
      });
    },
    operCtrl(e) {
      console.log('operCtrl', e);
      pageServ.getEleRect("#" + e.currentTarget.id, this, (pos) => {
        this.triggerEvent('operCtrl', {
          pos: pos,
          ckey: e.currentTarget.dataset.ckey
        });
      });
    },
    tapNode(e) {
      console.log("tapNode", e);
      this.setData({
        show: !this.data.show
      });
      var x = e.touches[e.touches.length - 1].clientX,
        y = e.touches[e.touches.length - 1].clientY;
      pageServ.getEleRect("#" + e.currentTarget.id, this, (pos) => {
        this.triggerEvent('tapNode', {
          pos: {
            left: x,
            bottom: y,
            scrollTop: 0
          },
          elepos: pos,
          ckey: e.currentTarget.dataset.ckey,
          nodeindex: e.currentTarget.dataset.nodeindex
        });
      });
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
        pos: e.detail.pos,
        ckey: e.detail.ckey
      });
    },
    tapNodeTogger(e) {
      this.triggerEvent('tapNode', {
        pos: e.detail.pos,
        elepos: e.detail.elepos,
        ckey: e.detail.ckey,
        nodeindex: e.detail.nodeindex
      });
    },
    getEleRect: function(nodeindex, cb) {
      var id = null;
      if (nodeindex) {
        id = Array.isArray(nodeindex) ? `#nid_${nodeindex.join('_')}` : `#nid_${nodeindex}`;
      } else {
        id = Array.isArray(this.properties.nodeindex) ? `#nid_${this.properties.nodeindex.join('_')}` : `#nid_${this.properties.nodeindex}`;
      }
      return pageServ.getEleRect(id, this, (posi) => {
        cb(posi);
      });
    }
  }
})