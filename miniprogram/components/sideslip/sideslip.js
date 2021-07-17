const app = getApp();
const ratio = 0.2;
const offsetY = 80; //轴偏移
Component({
  options: {
    multipleSlots: true //在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    slide:{
      type:'Boolean',
      value:false
    },
    scale:{
      type:'Number',
      value:0.75
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //open: false,
    mark: 0,
    newmark: 0,
    startmark: 0,
    endmark: 0,
    windowWidth: app.systemInfo.windowWidth,
    staus: 1,
    translate: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    isShow:function(){
      return this.data.staus =='2';
    },
    showSides: function(e) {
      console.log("************showSides************");
      if (this.isShow()) {
        this.hide();
      } else {
        this.show();
      }
    },
    hide:function(e){
      this.setData({
        translate: 'transform: translateX(0px)'
      })
      this.data.staus = '1';
    },
    show:function(e){
      this.setData({
        translate: 'transform: translateX(' + this.data.windowWidth * this.properties.scale + 'px)'
      })
      this.data.staus = '2';
    },
    /**
     * staus = 1指默认状态,就是左侧隐藏情况
     * staus = 2指屏幕滑动到右边的状态
     */
    tap_start: function(e) {
      console.log("*****tap_start*****")
      //this.data.markY = this.data.newmarkY = e.touches[0].pageY;
      //
      this.data.startmark = e.touches[0].pageX;
      this.data.startmarkY = e.touches[0].pageY;
      this.data.newmark = this.data.startmark;
      this.data.newmarkY = this.data.startmarkY;
      this.data.mark = this.data.newmark; //这个mark必须在移动后更新为上一次移动前的X坐标

    },
    tap_drag: function(e) {
      /*
       * 手指从左向右移动
       * @newmark是指移动的最新点的x轴坐标 ， @mark是指原点x轴坐标
       */
      console.log("*****tap_drag*****")
      this.data.newmark = e.touches[0].pageX;
      this.data.newmarkY = e.touches[0].pageY;
      if (Math.abs(this.data.newmarkY - this.data.startmarkY) >= offsetY) {
        console.log("*****tap_drag offsetY*****", Math.abs(this.data.newmarkY - this.data.startmarkY))
        return;
      }
      /*
      if (this.data.staus == 1) {
        //默认左侧隐藏情况下，只有从左往右滑动才能显示
        if (this.data.mark < this.data.newmark && this.data.windowWidth * 0.75 > Math.abs(this.data.newmark - this.data.startmark)) {
          this.setData({
            translate: 'transform: translateX(' + (this.data.newmark - this.data.startmark) + 'px)'
          })
        } else if (this.data.mark > this.data.newmark && this.data.newmark > this.data.startmark){
          this.setData({
            translate: 'transform: translateX(' + (this.data.newmark - this.data.startmark) + 'px)'
          })
        }
      } else {
        if (this.data.mark > this.data.newmark && this.data.windowWidth * 0.75 > (this.data.startmark - this.data.newmark) ) {
          this.setData({
            translate: 'transform: translateX(' + (this.data.newmark + this.data.windowWidth * 0.75 - this.data.startmark) + 'px)'
          })
        }
      }
      //这个mark必须在移动后更新为上一次移动前newmark
      this.data.mark = this.data.newmark;
      */
      /*
       * 手指从左向右移动
       * @newmark是指移动的最新点的x轴坐标 ， @mark是指原点x轴坐标
       */
      if (this.data.mark < this.data.newmark) {
        if (this.data.staus == 1) {
          if (this.data.windowWidth * this.properties.scale > Math.abs(this.data.newmark - this.data.startmark)) {
            this.setData({
              translate: 'transform: translateX(' + Math.abs(this.data.newmark - this.data.startmark) + 'px)'
            })
          } 
        }
      }
      /*
       * 手指从右向左移动
       * @newmark是指移动的最新点的x轴坐标 ， @mark是指原点x轴坐标
       */
      if (this.data.mark > this.data.newmark) {
        if (this.data.staus == 1 && this.data.newmark - this.data.startmark >= 0) {       
            this.setData({
              translate: 'transform: translateX(' + (this.data.newmark - this.data.startmark) + 'px)'
            })          
        } else if (this.data.staus == 2 && this.data.startmark - this.data.newmark <= this.data.windowWidth * this.properties.scale) {
          this.setData({
            translate: 'transform: translateX(' + (this.data.newmark + this.data.windowWidth * this.properties.scale - this.data.startmark) + 'px)'
          })
        }
      }
      this.data.mark = this.data.newmark;
    },
    tap_end: function (e) {
      console.log("*****tap_end*****")
      if (Math.abs(this.data.newmarkY - this.data.startmarkY) >= offsetY) {
        console.log("*****tap_end offsetY*****", Math.abs(this.data.newmarkY - this.data.startmarkY))
        return;
      }
      console.log("*****tap_end2*****")
      if (this.data.staus == 1 && this.data.startmark < this.data.newmark) {
        if (Math.abs(this.data.newmark - this.data.startmark) < (this.data.windowWidth * ratio)) {
          this.setData({
            translate: 'transform: translateX(0px)'
          })
          this.data.staus = 1;
        } else {
          this.setData({
            translate: 'transform: translateX(' + this.data.windowWidth * this.properties.scale + 'px)'
          })
          this.data.staus = 2;
        }
      } else if(this.data.staus == 2) {
        if (Math.abs(this.data.newmark - this.data.startmark) < (this.data.windowWidth * ratio)) {
          this.setData({
            translate: 'transform: translateX(' + this.data.windowWidth * this.properties.scale + 'px)'
          })
          this.data.staus = 2;
        } else {
          this.setData({
            translate: 'transform: translateX(0px)'
          })
          this.data.staus = 1;
        }
      }

      this.data.mark = 0;
      this.data.newmark = 0;
    },
    /*
    tap_end: function(e) {
      if (Math.abs(this.data.newmarkY - this.data.startmarkY) >= offsetY) {
        console.log("*****tap_end offsetY*****", Math.abs(this.data.newmarkY - this.data.startmarkY))
        return;
      }
      if (this.data.staus == 1 && this.data.startmark < this.data.newmark) {
        if (this.data.newmark - this.data.startmark < this.data.windowWidth * ratio) {
          this.setData({
            translate: 'transform: translateX(0px)'
          })
          this.data.staus = 1;
        } else {
          this.setData({
            translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
          })
          this.data.staus = 2;
        }

      } else {
        if (this.data.startmark > this.data.newmark) {
          if (this.data.startmark - this.data.newmark < this.data.windowWidth * ratio) {
            this.setData({
              translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
            })
            this.data.staus = 2;
          } else {
            this.setData({
              translate: 'transform: translateX(0px)'
            })
            this.data.staus = 1;
          }
        }
      }
      /*
      if (this.data.staus == 1 && this.data.startmark < this.data.newmark) {
        if (Math.abs(this.data.newmark - this.data.startmark) < (this.data.windowWidth * ratio)) {
          this.setData({
            translate: 'transform: translateX(0px)'
          })
          this.data.staus = 1;
        } else {
          this.setData({
            translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
          })
          this.data.staus = 2;
        }
      } else {
        if (Math.abs(this.data.newmark - this.data.startmark) < (this.data.windowWidth * ratio)) {
          this.setData({
            translate: 'transform: translateX(' + this.data.windowWidth * 0.75 + 'px)'
          })
          this.data.staus = 2;
        } else {
          this.setData({
            translate: 'transform: translateX(0px)'
          })
          this.data.staus = 1;
        }
      }
     
      this.data.mark = 0;
      //this.startmark = 0;
      this.data.newmark = 0;
    } */
  }
})