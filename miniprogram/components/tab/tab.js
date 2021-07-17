//这是tab.js部分
Component({
  //下面是组件的属性列表
  options: {
    multipleSlots: true //在组件定义时的选项中启用多slot支持
  },
  properties: {
    tabTitle: {
      type: Object,
      value: []
    },
    positionTop: {
      type: String,
      value: "0"
    },
    paddingTop: {
      type: String,
      value: "80rpx"
    },
    initTabIndex:{
      type:Number,
      value:0
    },
    backgroundColor:{
      type: String,
      value: '#fff'
    }
  },
  //组件的初始数据
  data: {
    num: 0
  },
  lifetimes: {
    attached: function () {
      console.log(`Component tab attached ${this.properties.initTabIndex}`);
      this.setData({
        num: this.properties.initTabIndex
      })
    },
  },
  //组件的方法列表
  methods: {
    toggle: function(e) {
      if (this.data.num === e.currentTarget.dataset.index) {
        return false;
      } else {
        this.setData({
          num: e.currentTarget.dataset.index
        })
      }
      this.triggerEvent("togger", { index: this.data.num});
    }
  }
})