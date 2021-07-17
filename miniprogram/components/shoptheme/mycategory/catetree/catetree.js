// components/shoptheme/mycategory/catetree/catetree.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    node: {
      type: "Object",
      value: null,
    },
    nodeindex: {
      type: "String",
      value: '0'
    },
    myStyle: {
      type: "String",
      value: ''
    },
    tapItemCacllBack: {
      type: Function,
      value: null
    },
  },


  /**
   * 组件的初始数据
   */
  data: {
    //extend: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggle: function (e) {
      if (this.properties.node.items) {
        this.setData({
          "node.extend": !this.data.node.extend,
        })
      }
    },
    tapItem: function (e) {
      console.log('点击nodeindex:', e);
      var node = e.currentTarget.dataset.node;
      this.triggerEvent('taptogger', {
        nodeindex: e.currentTarget.dataset.nodeindex
      });
    },
    toggerDo: function (e) {
      console.log('*****toggerDo*********', e);
      this.triggerEvent('taptogger', {
        nodeindex: e.detail.nodeindex
      });
    },
  }
})
