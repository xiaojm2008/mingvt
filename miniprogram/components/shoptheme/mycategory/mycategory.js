const app = getApp();
var shopServ = require("../../../lib/services/shop.js");
const helperServ = require("../../../lib/utils/helper.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dlgid: {
      type: "string",
      value: ''
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    selected: 0,
    category: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadCategory: function(activeindex) {
      var userinfo = app.getMUser();
      if (!userinfo) {
        return;
      }
      helperServ.showLoading({
        content: '加载中...'
      });
      shopServ.listCategory({
        shopid: userinfo.shopinfo.shopid
      }).then(res => {
        helperServ.hideLoading();
        if (res.result.data && res.result.data.length > 0) {
          this.data.category = res.result.data[0].items;
          this.setActiveNode(activeindex);
          this.setData({
            selected: this.data.selected,
            category: this.data.category
          });
        } else {
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
    show: function(options) {
      this.loadCategory(options.nodeindex);
      this.tapItemCallBack = options.callback;
      this.maxcount = options.maxcount || 0;
      var windowHeight = options.windowHeight || 350;
      this.setData({
        windowHeight: windowHeight,
        show: true
      })
    },
    hide: function() {
      this.setData({
        show: false
      });
    },
    okTogger: function(e) {
      this.tapItemCallBack ? this.tapItemCallBack(null, true) : null;
      this.hide();
    },
    getNode(node, nodeidx, deep, p) {
      if (deep == nodeidx.length - 1) {
        //获取父节点
        node[nodeidx[deep]].parent = p;
        return node[nodeidx[deep]];
      }
      p = node[nodeidx[deep]];
      return this.getNode(p.items, nodeidx, ++deep, p);
    },
    updNodeSt: function(node) {
      var key = `category`;
      if (Array.isArray(node.nodeindex)) {
        node.nodeindex.forEach((v, i, arr) => {
          if (i === arr.length - 1) {
            key += `[${v}]`
          } else if (i >= 0) {
            key += `[${v}].items`
          }
        });
      } else {
        key += `[${node.nodeindex}]`;
      }
      var data = {};
      console.log("***********nodeindex************", node.nodeindex, key);
      data[key + ".active"] = !node.active;
      data[key + ".extend"] = true;
      this.setData(data);
    },
    setActiveNode: function(nodeindex) {
      var deep = 0,
        node = null,
        p = null;
      if (nodeindex === undefined || nodeindex === '') {
        return;
      }
      nodeindex && nodeindex.forEach(v => {
        if (Array.isArray(v)) {
          node = this.getNode(this.data.category, v, deep, p);
          node.parent.extend = true;
          //必须删除，要不会maxium stack exceeded;
          delete node.parent;
        } else {
          node = this.data.category[v];
        }
        node.active = true;
      });
    },
    tapTreeNode: function(e) {
      var nodeindex = e.detail.nodeindex,
        deep = 0,
        node = null,
        p;
      nodeindex = isNaN(nodeindex) ? nodeindex.split('_') : nodeindex;
      if (Array.isArray(nodeindex)) {
        node = this.getNode(this.data.category, nodeindex, deep, p);
        //必须删除，要不会maxium stack exceeded;
        delete node.parent;
      } else {
        node = this.data.category[nodeindex];
      }
      //存储节点索引与组件索引,在CALLBACK和this.updNodeSt中使用
      node.nodeindex = nodeindex;
      this.updNodeSt(node);
      this.tapItemCallBack ? this.tapItemCallBack(node) : null;
    }
  }
})