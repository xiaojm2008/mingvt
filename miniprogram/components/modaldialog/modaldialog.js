const restore = require("../../lib/utils/restore.js");
const helperServ = require("../../lib/utils/helper.js");
//const cache = require("../../lib/utils/cache.js");
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
    show: false,
    posi: {},
    title: '请输入',
    className: '',
    myStyle:'',
    inputlist: {},
    menudata: [],
    btntext: null,
    submit: null,
    cancel: null,
    loading: false,
  },
  observers: {},
  lifetimes: {
    ready() {
      /*
      pageServ.getSystemInfo({
        success: (res) => {
          this.setData({
            "height": res.windowHeight - 40
          })
        }
      })*/
    }
  },
  /*
  pageLifetimes:{
    hide:()=>{

    }
  },*/
  /**
   * 组件的方法列表
   */
  methods: {
    setTitle: function(title) {
      this.setData({
        title: title
      })
    },
    setBtnText: function(btntext) {
      this.setData({
        btntext: btntext
      })
    },
    setInputlist: function(inputlist) {
      this.setData({
        inputlist: inputlist
      })
    },
    //动画集0 In,300 Out
    fadeInOut: function(animation, trY) {
      /* animation.opacity(1).rotateX(0).step();
      this.setData({
        animationData: animation.export()
      })
     
      var self = this;
      setTimeout(function () {
        animation.opacity(1).rotateX(0).step();
        self.setData({
          animationData: animation.export()
        })},200);*/
    },
    hideDlg2: function(data) {
      var animation = wx.createAnimation({
          duration: 300, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
          timingFunction: this.timingFunction, //动画的效果 默认值是linear
        }),
        self = this;
      this.fadeInOut(animation, 680); //调用隐藏动画  

      setTimeout(function() {
        self.setData(data)
      }, 300) //先执行下滑动画，再隐藏模块
    },
    showDlg2: function() {
      var animation = wx.createAnimation({
        duration: 300, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
        timingFunction: this.timingFunction, //动画的效果 默认值是 linear ease
      });
      this.fadeInOut(animation, 0); //调用显示动画
    },
    /**
     *  inputtype: inputlist.option.inputtype || 'textarea',
        inputid: inputlist.option.inputid ||'text',
        pack: inputlist.option.pack ||'dialog',
        placeholder: inputlist.option.placeholder ||'请输入',
     */
    showDlg: function(options) {
      this.cloudPath = options.cloudPath;
      if (options.cache) {
        var e_cache = null,
          arrC = restore.getEnrollInfo(null);
        if (arrC) {
          //array to object
          e_cache = arrC.reduce((result, cur) => {
            result[cur.id] = cur;
            return result;
          }, {});
          var id = null;
          for (var k in options.inputlist) {
            id = options.inputlist[k].id;
            e_cache && e_cache[id] && e_cache[id].value ? options.inputlist[k].value = e_cache[id].value : null;
          }
        }
      }
      this.setData({
        show: true,
        loading:false,
        animationShow:options.animationShow?'transform: translateY(100%);':'', /* 非snake专用 */
        mask: options.mask || 'mask',
        posi: options.posi || {},
        animationData:null,
        title: options.title,
        poptype: options.poptype || 'input',
        className: options.className || '', // ||'center-panel'
        myStyle: options.myStyle||'',
        inputlist: options.inputlist||null,
        btntext: options.btntext || ['提交'],
        submit: options.submit || null
      })
      if(options.poptype=='snake'){
        pageServ.showDlg(this);
      } else if (options.animationShow) {
        //有动画
        //this.timingFunction = options.timingFunction || 'linear';
        //this.showDlg2();
        this.setData({
          animationShow:'transition:200ms linear 0ms; transition-property:transform;'
        })
      }
    },
    hideDlg: function() {
      if(this.data.poptype=='snake'){
        pageServ.hideDlg({
          loading: false,
          show: false
        }, this);
      } else if (this.data.animationShow) {
        this.setData({
          animationShow:'transition:200ms linear 0ms; transition-property:transform;transform: translateY(100%)'
        });
        setTimeout(()=>{
          this.setData({
            loading: false,
            show:false
          })
        },200)
      } else {
        this.setData({
          loading: false,
          show: false
        })
      }
    },
    showLoading: function() {
      this.setData({
        loading: true
      })
    },
    hideLoading: function() {
      this.setData({
        loading: false
      })
    },
    clearCache: function() {
      restore.setEnrollInfo(null, null);
    },
    loadCache: function() {

    },
    getArrayValue: function() {
      return this.selectComponent('#myEnroll2').getArrayValue();
    },
    getValue: function(unCheckVal) {
      return this.selectComponent('#myEnroll2').getValue(unCheckVal);
    },
    upLoadFile: function(cb) {
      var myEnroll = this.selectComponent('#myEnroll2')
      if (!this.cloudPath) {
        helperServ.showToast({
          title: "请设置文件路径",
          icon: 'none'
        });
        return;
      }
      myEnroll.setCloudPath(this.cloudPath);
      myEnroll.upLoadFile(cb);
    },
    submit: function(e) {
      e.btnindex = e.currentTarget.dataset.index;
      if (this.data.btntext[e.btnindex] == '取消') {
        this.hideDlg();
        return;
      }
      if (this.data.loading) {
        return;
      }
      this.showLoading();
      if (this.data.poptype == 'input' || this.data.poptype == 'snake') {
        //this.getValue()，不带参数，那么会调用V.V来验证输入值是否合规
        e.inputlist = this.getValue();
        if (!e.inputlist.data) {
          helperServ.showToast({
            title: e.inputlist.errMsg,
            icon: 'none'
          });
          this.hideLoading();
          return;
        }
        e.inputlist = e.inputlist.data;
      } else {
        e.inputlist = this.data.inputlist;
      }
      this.data.submit(e, (err, res) => {
        if (!err) {
          this.clearCache();
          this.hideDlg();
        } else {
          this.hideLoading();
        }
      });
    },
    menutogger: function(e) {
      var idx = e.currentTarget.dataset.index;
      var menu = this.properties.inputlist[idx];
      this.hideDlg();
      if (typeof menu.togger == 'function') {
        menu.togger(e, menu);
      }
    },
    multiCheckTap: function(e) {
      var idx = e.currentTarget.dataset.index,
        item = this.properties.inputlist[idx];
      var data = {};
      data[`inputlist[${idx}].active`] = !item.active;
      this.setData(data);
    },
    /** 底部弹出 poptype=snake */
    dragStart: function(e) {
      this.startY = e.touches[0].pageY;
    },
    dragMove: function(e) {
      //console.debug("*dragMove*", e);
      this.movedDistance = e.touches[0].pageY - this.startY; //e.touches[0].pageY - this.startY;
    },
    dragEnd: function(e) {
      if (this.movedDistance > 200) {
        var data = {};
        this.movedDistance = 0;
        data['show'] = false;
        pageServ.hideDlg(data, this);
      }
    },
    /**
     * 接受来自"layout": "../shoptheme/layout/layout"控件消息
     * this.triggerEvent("togger", {
        ctrl: {
          "unitid": subUnit.id,
          "compid": ctrl.id
        }
      });
     * 
     */
    layoutTogger:function(e){
      var ctrl = e.detail.ctrl;//{id,type,value}
      this.data.inputlist = Array.isArray(ctrl) ? ctrl: [ctrl];
    },
    operItemTap(e){
     var idx= e.currentTarget.dataset.index;
     var item = this.data.inputlist.fields[idx];
     this.data.inputlist.expression = (this.data.inputlist.expression || []);
  
      if(item.id !='C' && item.id !='D'){
        this.data.inputlist.expression.push(this.data.inputlist.fields[idx]);
      } else if(this.data.inputlist.expression && this.data.inputlist.expression.length>0){
        if(item.id ==='C'){
          this.data.inputlist.expression = [];
        } else {
          this.data.inputlist.expression.pop();
        }
      }
   
     this.setData({
      "inputlist.expression":this.data.inputlist.expression
     });
    }
  }
})