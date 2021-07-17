const app = getApp();
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
    show: false,
    posi: {},
    myStyle:'',
    className: '',
    inputlist: {},
    animationShow: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setMenu: function (inputlist,title,width){
      this.data.inputlist = inputlist;
      this.data.title = title;
      this.data.maxWidth=width||0;
    },
    show: function(options, e) {
      if (!options.posi && e) {
        if (e.touches && e.touches.length > 0) {
          x = e.touches[e.touches.length - 1].clientX;
          y = e.touches[e.touches.length - 1].clientY;
          console.log("touches", e.touches);
        } else {
          x = e.currentTarget.offsetLeft;
          y = e.detail.y;
        }
        const menuH = this.getHeight();
        if (app.systemInfo.windowHeight - y < menuH) {
          //如果当前坐标+弹出菜单高度大于剩余可视，那么往上弹
          y -= menuH;
        }
      }
      this.setData({
        title:options.title||this.data.title,
        show: true,
        ctype: options.ctype||'cover',
        mask: options.mask || 'none',
        posi: options.posi || {
          left: x,
          top: y
        },
        animationShow: options.animationShow || null,
        maxWidth:options.maxWidth||this.data.maxWidth||0,
        myStyle: options.myStyle||'',
        className: options.className || '', // ||'center-panel'      
        inputlist: options.inputlist || this.data.inputlist
      })
    },
    hide: function() {
      this.setData({
        show: false
      })
    },
    setWidth:function(width){
      this.data.maxWidth = width;
    },
    getWidth: function() {
      return this.data.maxWidth||120;
    },
    getHeight: function() {
      return this.data.inputlist.length * 41+(this.data.title?52:0);
    },
    menutogger: function(e) {
      var idx = e.currentTarget.dataset.index;
      var menu = this.data.inputlist[idx];// 与var menu = this.properties.inputlist[idx];效果一样
      this.hide();
      if (typeof menu.togger == 'function') {
        menu.togger(e, menu);
      }
    },
  }
})