//const xcompon = require("../cfg/xcomponent.js");
const utils = require("../utils/utils.js");
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const xctrlconf = require("./xctrlconf.js");
const rpc = require("../../../lib/utils/rpc.js");
const pagecfg = require("../cfg/pagecfg.js");
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dlgid: {
      type: "string",
      value: 'cpropertyid'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    offset: 0,
    showDlg: null,
    windowHeight: 0,
    fieldinfo:null,
    compname: null
  },
  lifetimes: {
    ready: function() {},
    detached:function(){
      if (this.xconfig) {
        delete this.xconfig;
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**调整enroll控件弹出menu位置 */
    adjustDlgPosi: function() {
      this.setData({
        offset: app.getWinHeight() / 2
      })
      return;
      /*
      pageServ.getEleRect('#' + this.properties.dlgid, this, (pos) => {
        if (!pos) {
          return;
        }
        this.setData({
          offset: app.getWinHeight()/2
        })
        console.log("******adjustDlgPosi******", pos, app.getWinHeight());
      });*/
    },
    showDlg: function(options) {
      if (this.data.showDlg) {
        pageServ.hideDlg({
          'showDlg': false
        }, this, this.data.windowHeight);
        return;
      }
      this.ctrl = options.ctrl;
      if (this.xconfig){
        delete this.xconfig;
      }
      this.xconfig = new xctrlconf(this, options);   
      if(this.options){
        delete this.options;
      }   
      this.options={
        property:{},
        exproperty:{},
        exstylecfg: {}
      }
      
      this.setData({
        compname: options.ctrl.compname,
        windowHeight: options.windowHeight,      
        showDlg: true
      });
      pageServ.showDlg(this);
      this.adjustDlgPosi();
    },
    okTogger: function(e) {
      this.updCtrl();
      this.showDlg();
    },
    updCtrl:function(e){
      var upd = this.ctrl.setAttrs(this.options.property)
      upd = upd||this.setExItemStyle();
      if(upd){
        this.ctrl.update();
      }
    },
    setExItemStyle:function(){
      var upd = this.ctrl.setExItemStyleCfgValue(this.options.exstylecfg);
      if(upd){
        this.ctrl.updExItemStyle();
      }
      return upd;
    },
    getMaxLength: function() {
      return this.ctrl.getExPropertyValue("length")||50;
    },
    inputTogger: function(e) {
      //console.log("inputDataSourceTogger", e);
      const group = e.detail.field.group;
      if(group==='exstyle'){
        this.inputExStyleTogger(e);
      } else if(group==='exproperty'){
        this.inputExPropertyTogger(e);
      } else if(group==='property'){
        this.inputPropertyTogger(e);
      } else{
        this.options.extattrs&&(this.options.extattrs[e.detail.field.id] = e.detail.field.value);
      }
    },
    inputExStyleTogger: function (e) {
      const id = e.detail.field.id;
      this.options.exstylecfg[id] = e.detail.field.value;
    },
    inputExPropertyTogger: function (e) {
      const id = e.detail.field.id;
      this.options.exproperty[id] = e.detail.field.value;
    },
    inputPropertyTogger: function (e) {
      const id = e.detail.field.id;
      this.options.property[id] = e.detail.field.value;
    },
    /**
     * cate is Array
     */
    showMyCategory: function (e, cate, cb) {
      var nodeindex = cate&&cate.map(v=>{
        return v.nodeindex;
      });
      var myDlg = this.selectComponent('#myCategory');
      myDlg.show({
        nodeindex: nodeindex,
        callback: cb
      });
    },
    showParameterDlg: function(e) {
      var id = e.currentTarget.id,
        type = e.currentTarget.dataset.type,
        self = this,
        parameter = {},
        dataItem = pageServ.getData(id, this),
        data = {};
      if (Array.isArray(dataItem)) {
        for (var i in dataItem) {
          parameter[dataItem[i].id] = dataItem[i];
        }
      } else {
        parameter = dataItem;
      }
      this.setData({
        parameterType: type
      })
      var myDlg = this.selectComponent('#parameterDlg');
      myDlg.showDlg({
        title: '新增对话框',
        enrollinfo: parameter || {},
        btntext: ['取消', '确认'],
        submit: (e, cb) => {
          if (e.btnindex == 0) {
            cb(null);
            return;
          } else {
            if (e.enrollinfo) {
              for (var k in e.enrollinfo) {
                if (parameter && parameter[k]) {
                  e.enrollinfo[k].value = parameter[k].value;
                }
              }
              data[id] = e.enrollinfo;
              this.setData(data)
            }
            cb(null);
          }
        },
      });
    },
    dragStart: function (e) {
      this.startY = e.touches[0].pageY;
    },
    dragMove: function (e) {
      this.movedDistance = e.touches[0].pageY - this.startY; //e.touches[0].pageY - this.startY;
    },
    dragEnd: function (e) {
      var data = {};
      if (this.movedDistance > 200) {
        this.movedDistance = 0;
        data["showDlg"] = false;
        pageServ.hideDlg(data, this, this.data.windowHeight);
      }
    }
  }
})