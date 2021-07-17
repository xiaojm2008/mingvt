const helperServ = require("../../../lib/utils/helper.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    nodes:{
      type:Array,
      value:null
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
    previewNodeTogger: function (e) {
      this.triggerEvent("taptogger", {
        data:{
          url:e.detail.data.url
        }
      });
    }
  }
})
