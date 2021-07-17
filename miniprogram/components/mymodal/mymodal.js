const pageServ = require('../../lib/utils/pagehelper.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    show(options){
      this.setData({
        options:options,
        show:true
      })
      this.setData({
        animation:true
      })
    },
    hide(){
      this.setData({
        animation:false
      });
      setTimeout(()=>{
        this.setData({
          show:false
        })
      },200)
      /*pageServ.hideDlg({
        show: false
      }, this);*/
    },
    tapEvent(e){
      var idx = e.currentTarget.dataset.index, tap = this.data.options.data[idx].tap;
      this.hide();
      return tap&&tap(idx);
    },
    preventTouchMove(e){

    },
    touchStartHB(e){

    }
  }
})
