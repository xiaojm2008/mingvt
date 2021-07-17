const MAX_DISPLAY = 4;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    linear:{
      type:Boolean,
      value:false
    },
    flows: {
      type: Object,
      value: []
    },
    begIndex:{
      type: Number,
      value: 0
    },
    endIndex:{
      type: Number,
      value: 3
    },
    activeIndex:{
      type:Number,
      value:0
    },
    toggerDisabled:{
      type:Boolean,
      value:false
    },
    itemWidth: {
      type: Number,
      value: 0
    },
    myStyle:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    num: 0
  },

  lifetimes: {
    created: function() {
      //console.log(`create properties`, this.properties);
      this.properties.endIndex=this.properties.begIndex+3;
    },
    attached: function () {
      var self = this;
      //console.log(`Component Flow attached ${this.properties.activeIndex}`);
      self.setData({
        num: this.properties.activeIndex
      });
    },
    ready:function(){
      this.properties.endIndex = this.properties.begIndex + 3;
    }
  },
  observers: {
    'activeIndex': function (activeIndex) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      //console.log('flow observers activeIndex=', activeIndex);
      this.setData({
        num: activeIndex
      });
      if (activeIndex >= MAX_DISPLAY - 1 
        && this.properties.flows.length > this.properties.endIndex+1
      ){
        this.properties.begIndex = this.properties.begIndex+1;
        this.properties.endIndex = this.properties.endIndex+1;
        this.setData({
          begIndex: this.properties.begIndex,
          endIndex: this.properties.endIndex
        });
      } else if (activeIndex < MAX_DISPLAY - 1
        && this.properties.endIndex > MAX_DISPLAY - 1){
        this.properties.begIndex = this.properties.begIndex - 1;
        this.properties.endIndex = this.properties.endIndex - 1;
        this.setData({
          begIndex: this.properties.begIndex,
          endIndex: this.properties.endIndex
        });
       }
      //console.log(`MAX_DISPLAY ${MAX_DISPLAY} begIndex ${this.properties.begIndex} endIndex ${this.properties.endIndex}`);
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    toggle: function (e) {
      if (this.data.num === e.currentTarget.dataset.index) {
        return false;
      } else {
        this.setData({
          num: e.currentTarget.dataset.index
        })
      }
      this.triggerEvent("togger", { index: this.data.num });
    }
  }
})
