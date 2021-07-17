const HaiB = require("../../lib/utils/hb").HB;
const helperServ = require("../../lib/utils/helper.js");
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show:{
      type:Boolean,
      value:false
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
    /**
     * 实现只会调用页面的onShareAppMessage
     */
    onShareAppMessage: function() {
      return {
        title: this.data.options.subname,
        desc: this.data.options.desc,
        path: this.data.options.url+this.data.options.id
      }
    },
    genHB(e){
      if(!this.HB){
        this.HB = new HaiB({pageContext:this});
      }
      this.hide();
      this.showHb();
      this.HB.create({
        hbheight:this.data.options.hbheight,
        company:this.data.options.company,
        subname:this.data.options.subname,
        price:this.data.options.price,
        origin_price:this.data.options.origin_price,
        hbimg: this.data.options.hbimg,
        id :this.data.options.id,
        url:this.data.options.url,
        type:this.data.options.type,
        content:this.data.options.content,
        summary:this.data.options.summary
      })
    },
    save(){
      if(!this.HB){
        helperServ.showToast({
          icon:"none",
          title: '保存失败,HAIBAO NULL'
        })
        return;
      }
      this.HB.save(res => {
        if (res == 1) {
          this.hideHb();
        } else {
          helperServ.showToast({
            icon:"none",
            title: '保存失败'
          })
        }
      })
    },
    show(options){
      var hbheight = 0,winHeight = app.getWinHeight();
      if(options.hbheight && options.hbheight>=400){
        hbheight = options.hbheight;
      } else if(options.hbimg.height){
        hbheight = (options.hbimg.height>=winHeight)?winHeight:options.hbimg.height;
      } else {
        hbheight = 400;
      }
      this.setData({
        hbheight:hbheight,
        options:options,
        show:true
      })
    },
    hide(){
      this.setData({
        show:false
      })
    },
    hideHb(){
      this.setData({
        hbshow:false
      })
    },
    showHb(){
      this.setData({
        hbshow:true
      })
    },
    preventTouchMove(e){

    },
    touchStartHB(e){

    }
  }
})
