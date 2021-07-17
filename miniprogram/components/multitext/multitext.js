// components/mutitext/multitext.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: String,
      value: ''
    },
    className: {
      type: String,
      value: ''
    },
    myStyle:{
      type: String,
      value: ''
    },
    fixed: {
      type: Boolean,
      value: true
    },
    maxlength: {
      type: Number,
      value: 200,
    },
    placeholder: {
      type: String,
      value: null,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    inputstatus: false,
    value: null
  },
  lifetimes: {
    attached: function() {
      wx.onKeyboardHeightChange(res => {      
        if (res.height <= 0 && this.data.inputstatus) {
          this.setData({
            inputstatus: false
          })
        }
      })
      //wx.onKeyboardHeightChange(res=>(function (res, self) { self.onHidden.call(self,res)})(res,this));
    },
    detached: function() {
      //console.log('*****multitext detached 取消软键盘处理**********');
      wx.onKeyboardHeightChange(null);
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //bindblur
    onBindBlur:function(e){
      this.setData({
        inputstatus: false
      })
    },
    onBindFocus: function(e) {
      this.setData({
        inputstatus: true
      })
    },
    inputTogger: function(e) {
      this.triggerEvent("togger", {
        value: e.detail.value
      });
    },
    getValue: function() {
      return this.data.value;
    }
  }
})