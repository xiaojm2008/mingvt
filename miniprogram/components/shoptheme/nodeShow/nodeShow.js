var helperServ = require("../../../lib/utils/helper.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    node: {
      type: Object,
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    tapNode:function(e){
      this.triggerEvent("taptogger", {
        data: {
          url: e.currentTarget.dataset.url || '/pages/home/home'
        }
      });
    },
    tapTogger:function(e){
      this.triggerEvent("taptogger", {
        data: {
          url: e.detail.data.url
        }
      });
    }
  }
})