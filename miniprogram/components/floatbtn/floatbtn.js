const app = getApp();
var pageServ = require("../../lib/utils/pagehelper.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    moveable: {
      type: 'Boolean',
      value: false
    },
    compid: {
      type: 'String',
      value: '',
    }
  },

  /**
   * 组件的初始数据
   */
  posi:null,
  data: {
    buttonTop: '',
    buttonLeft: '',
    windowHeight: app.getWinHeight(),
    windowWidth: app.systemInfo.windowWidth
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getEleRect: function(cb) {
      return pageServ.getEleRect('#' + this.properties.compid, this, (posi) => {
        this.posi = posi;
        this.setData({
          buttonTop:posi.top,
          buttonLeft:posi.left
        });
        cb(posi);
      });
    },
    tapTogger: function(e) {
      this.triggerEvent("togger", {

      });
    },
    buttonStart: function(e) {
      this.startPoint = e.touches[0];
      console.log("******buttonStart******", e,this.posi)
    },
    buttonMove: function(e) {
      //21 = 控件宽度一半
      /*
      this.setData({
        buttonTop: e.touches[e.touches.length - 1].clientY - 21,
        buttonLeft: e.touches[e.touches.length - 1].clientX - 21
      })*/
      var endPoint = e.touches[e.touches.length - 1]
      var translateX = endPoint.clientX - this.startPoint.clientX
      var translateY = endPoint.clientY - this.startPoint.clientY
      this.startPoint = endPoint
      var buttonTop = this.data.buttonTop + translateY
      var buttonLeft = this.data.buttonLeft + translateX
      //判断是移动否超出屏幕
      if (buttonLeft + 50 >= this.data.windowWidth) {
        buttonLeft = this.data.windowWidth - 50;
      }
      if (buttonLeft <= 0) {
        buttonLeft = 0;
      }
      if (buttonTop <= 0) {
        buttonTop = 0
      }
      if (buttonTop + 50 >= this.data.windowHeight) {
        buttonTop = this.data.windowHeight - 50;
      }
      this.setData({
        buttonTop: buttonTop,
        buttonLeft: buttonLeft
      })
    },

    buttonEnd: function(e) {

    }
  }
})