/*!
 * enrolldetail.js
 * xiaojinming - v1.0.0 (2020-03-21)
 * Released under MIT license
 */
const helperServ = require("../../lib/utils/helper.js");
const cache = require("../../lib/utils/cache.js");
const pageServ = require('../../lib/utils/pagehelper.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    height:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationData:null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show:function(options){
      if(!Array.isArray(options.enrollinfo)){
        options.enrollinfo = pageServ.toValues(options.enrollinfo,-1).sort((a,b)=>a.seq-b.seq);
      }
      var dict = options.enrollinfo.filter(v=>v.type==='3'||v.type==='m').map(v=>v.dictlist);
      if(dict.length > 0){
        cache.getDict(dict, (err, res) => {
          if (err) {
            return;
          }
          this.setData({
            dict:res       
            /*showDlg: true,
            options:options*/
          })
        });
      }
      this.setData({
        options:options,
        showDlg: true       
      });
      pageServ.showDlg(this);
    },
    hide(e){
      pageServ.hideDlg({
        showDlg: false
      }, this);
    },
    confirm(e){
      if(this.data.options.togger){
        this.triggerEvent("togger",{
          detail:{
            enrollinfo:this.data.options.enrollinfo
          }
        })
      } else {
        this.hide();
      }
    },
    previewImg(e){
      var id = e.currentTarget.dataset.id,
      index = e.currentTarget.dataset.index,
      img = this.data.options.enrollinfo[id].value;
      helperServ.previewImg(img,index);
    },
    dragStart: function(e) {
      this.startY = e.touches[0].pageY;
    },
    dragMove: function(e) {
      //console.debug("*dragMove*", e);
      this.movedDistance = e.touches[0].pageY - this.startY; //e.touches[0].pageY - this.startY;
    },
    dragEnd: function(e) {
      //console.debug("*dragEnd*", e);
      //this.movedDistance = e.changedTouches[0].pageY - this.startY;//e.touches[0].pageY - this.startY;
      if (this.movedDistance > 200) {
        var data = {};
        this.movedDistance = 0;
        data['showDlg'] = false;
        pageServ.hideDlg(data, this);
      }
    }
  }
})
