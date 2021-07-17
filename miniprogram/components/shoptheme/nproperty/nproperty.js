//const xcompon = require("../cfg/xcomponent.js");
const utils = require("../utils/utils.js");
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const xnodeconf = require("./xnodeconf.js");
const xitemconf = require("./xitemconf.js");
const rpc = require("../../../lib/utils/rpc.js");
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dlgid: {
      type: "string",
      value: 'npropertyid'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    offset: 0,
    showDlg: null,
    windowHeight: 0,
    compname: null,
    nodename: null,
    fieldinfo: null
  },
  lifetimes: {
    ready: function() {
      this.userinfo = app.getMUser();
      this.upCfg = {};
      this.upCfg.cloudpath = this.userinfo.shopinfo.basedir + "/shop/extimg/";
    },
    detached: function () {
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
      pageServ.getEleRect('#' + this.properties.dlgid, this, (pos) => {
        if (!pos) {
          return;
        }
        this.setData({
          offset: pos.top - pos.height
        })
        console.log("******adjustDlgPosi******", pos, app.getWinHeight());
      });
    },
    showDlg: function(options) {
      if (this.data.showDlg) {
        pageServ.hideDlg({
          'showDlg': false
        }, this, this.data.windowHeight);
        return;
      }
      this.node = options.node;
      this.ctrl = options.ctrl;
      this.options = {
        style: {},
        property: {},
        dataset: {}
      };
      if (this.xconfig) {
        delete this.xconfig;
      }
      //输入配置
      if (this.ctrl.isItemNode(this.node)) {
        this.xconfig=new xitemconf(this, options);
      } else {
        this.xconfig=new xnodeconf(this, options);
      }
      this.setData({
        compname: options.ctrl.compname,
        nodename: options.node.name,
        windowHeight: options.windowHeight,
        showDlg: true
      });
      pageServ.showDlg(this);
      this.adjustDlgPosi();
    },
    dragStart: function(e) {
      this.startY = e.touches[0].pageY;
    },
    dragMove: function(e) {
      this.movedDistance = e.touches[0].pageY - this.startY; //e.touches[0].pageY - this.startY;
    },
    dragEnd: function(e) {
      var data = {};
      if (this.movedDistance > 200) {
        this.movedDistance = 0;
        data["showDlg"] = false;
        pageServ.hideDlg(data, this, this.data.windowHeight);
      }
    },
    updNode: function() {
      this.ctrl.updNode(this.node, {
        style: this.options.style,
        property: this.options.property,
        data: this.options.dataset
      });
    },
    delTogger: function(e) {
      /*调用removeNode 比 removeChildNode 合适
      removeChildNode 是删除控件的成员。
      即this.node所在的顶层节点（this.node.nodeindex[0]）对应的成员节点
      this.ctrl.removeChildNode(this.node);
      */
      this.ctrl.removeNode(this.node);
      this.showDlg();
    },
    okTogger: function(e) {
      this.updNode();
      this.showDlg();
      return;
      if (this.options.property.src) {
        if (!this.upCfg.cloudpath) {
          helperServ.showModal({
            content: "上传路径配置错误"
          })
          return;
        }
        pageServ.upLoadFile(this.options.property.src, this.upCfg.cloudpath, (err, res) => {
          if (!res.success) {
            helperServ.showModal({
              content: err
            });
            return;
          }
          this.updNode();
          this.showDlg();
        });

      } else {
        this.updNode();
        this.showDlg();
      }
    },
    inputDataSetTogger: function(e) {
      const id = e.detail.field.id;
      this.options.dataset[id] = e.detail.field.value;
      //this.options.dataset.data[id] = e.detail.field.value;
    },
    inputPropertyTogger: function(e) {
      const id = e.detail.field.id;
      this.options.property[id] = e.detail.field.value;
    },
    /**
     * format:
     * fieldData：{
     * style:{
     *  height:100%,
     *  width:100%,
     *  border:1;
     * }
     * }
     */
    inputStyleTogger: function(e) {
      const id = e.detail.field.id;
      this.options.style[id] = e.detail.field.value;
      /*
      var data = {},
        dataid = e.currentTarget.dataset.id,
        fieldData = pageServ.getData(dataid, this);
      if (!fieldData[e.detail.field.id]) {
        return;
      }
      if (!e.detail.field.type) {
        fieldData[e.detail.field.id].value = e.detail.field.value;
      } else {
        fieldData[e.detail.field.id].text = e.detail.field.value;
      }
      var style = "",
        v = null;
      for (var k in fieldData) {
        v = fieldData[k].value;
        if ((k == 'styletext' || k == 'style') && v) {
          style += `${v};`
        } else if (v) {
          style += `${k}:${v};`;
        }
      }
      this.node.attrs['style'] = style;
      */
    },
    showMyCategory: function(e, remark, cb) {
      var myDlg = this.selectComponent('#myCategory');
      myDlg.show({
        nodeindex: remark.nodeindex,
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
  }
})

/*
textNodeHandle: function(nodeinfo, node) {
  nodeinfo.property["title"] = {
    "seq": 1,
    "id": "title",
    "type": "0",
    "name": "文本内容",
    "value": node.attrs && node.attrs['title'] ? node.attrs['title'] : '',
    "required": "O",
    "label": true
  };
},
sendOtherAttrs: function(catenode, prompt) {
  //栏目名称
  this.inputPropertyTogger({
    detail: {
      field: {
        id: 'title',
        value: prompt.title
      }
    }
  });
  //内部使用
  this.inputPropertyTogger({
    detail: {
      field: {
        id: 'remark',
        value: {
          prompt: prompt,
          nodeindex: catenode.nodeindex || 0
        }
      }
    }
  });
},
imageNodeHandle: function(nodeinfo, node) {
  if (node.attrs && node.attrs['title']) {
    nodeinfo.property["title"] = {
      "seq": 1,
      "id": "title",
      "type": "0",
      "name": "标题",
      "value": node.attrs && node.attrs['title'] ? node.attrs['title'] : '',
      "required": "O",
      "label": true
    };
  }
  nodeinfo.property["navitype"] = {
    "id": "navitype",
    "name": "选择导航目的",
    "type": "m",
    "required": "R",
    "value": node.attrs && node.attrs['navitype'] ? node.attrs['navitype'] : '',
    "length": 10,
    "checktype": '0', //单选
    "label": false,
    "checkbox": [{
        code: '1',
        name: "导航至类别"
      },
      {
        code: '2',
        name: "导航至商品"
      },
      {
        code: '3',
        name: "导航至网络"
      }
    ],
    "placeholder": '请选择导航目的'
  };
  nodeinfo.property["src"] = {
    "condition": "navitype==1",
    "seq": 0,
    "id": "src",
    "groupid": "src",
    "name": "类别选择",
    "label": true,
    "type": "0",
    "value": node && node.attrs ? node.attrs['src'] || '' : '',
    "required": "R",
    "prompt": node.attrs && node.attrs['navitype'] == '1' && node.attrs['remark'] ? node.attrs['remark'].prompt : null,
    "event": {
      "type": "tap",
      "name": "类别选择",
      "togger": (e, cb) => {
        this.showMyCategory(e, (node.attrs && node.attrs['remark'] ? node.attrs['remark'] : ''), (catenode) => {
          console.log("**************", catenode);
          if (catenode) {
            e.currentTarget.dataset.field.value = catenode.img[0].fileID;
            const prompt = {
              type: "b",
              title: catenode.name,
              code: catenode.code,
              text: catenode.code + "-" + catenode.name + "(" + (catenode.summary || '') + ")",
              url: catenode.code.length>3? goodslist_page:shopcategory_page,
              value: catenode.img
            };
            //手动调用，而不是enroll控件事件响应
            this.sendOtherAttrs(catenode, prompt);
            cb(null, prompt);
          } else {
            //cb("未选择分类");
          }
          var myDlg = this.selectComponent('#myCategory');
          myDlg.hide();
        });
      }
    }
  };
  nodeinfo.property["src2"] = {
    "condition": "navitype==2",
    "seq": 0,
    "groupid": "src",
    "id": "src2",
    "name": "商品选择",
    "label": true,
    "type": "0",
    "value": node && node.attrs ? node.attrs['src'] || '' : '',
    "required": "R",
    "prompt": node.attrs && node.attrs['navitype'] == '2' && node.attrs['remark'] ? node.attrs['remark'].prompt : null,
    "event": {
      "type": "tap",
      "name": "商品选择",
      "togger": (e, cb) => {
        helperServ.goToPage("/components/shoptheme/goodssel/goodssel");          
        var currPage = helperServ.getCurrPage();
        var options = currPage.options;
        options.nextPageCallBack = (err, goods) => {
          e.currentTarget.dataset.field.value = goods.picpath[0].fileID;
          const prompt = {
            type: "b",
            title: goods.goodsname,
            goodsno: goods.goodsno,
            text: goods.goodsname + "(价格：" + (goods.price.saleprice || '') + ")",
            value: goods.picpath
          };
          //手动调用，而不是enroll控件事件响应
          this.sendOtherAttrs(goods, prompt);
          cb(null, prompt);
        }            
      }
    }
  };
  nodeinfo.property["src3"] = {
    "condition": "navitype==3",
    "seq": 0,
    "id": "src3",
    "groupid": "src",
    "name": "网络地址选择",
    "label": true,
    "type": "0",
    "value": node && node.attrs ? node.attrs['src'] || '' : '',
    "required": "R",
    "prompt": node.attrs && node.attrs['navitype'] == '3' && node.attrs['remark'] ? node.attrs['remark'].prompt : null,
    "event": {
      "type": "tap",
      "name": "验证",
      "togger": (e, cb) => {
        var field = e.currentTarget.dataset.field;
        const prompt = {
          type: "b",
          title: '',
          text: field.value,
          value: [{
            fileID: field.value
          }]
        };
        cb(null, prompt);
      }
    }
  };
  nodeinfo.property["url"] = {
    "condition": "navitype==3",
    "seq": 0,
    "id": "url",
    "name": "页面",
    "label": true,
    "type": "0",
    "value": node && node.attrs ? node.attrs['url'] || '' : '',
    "required": "R"
  };
},
parseProperty: function(nodeinfo, node, res) {
  if (!res.data || !node.attrs) {
    return;
  }
  var hasSrc = false;
  for (var p in node.attrs) {
    if (p == 'style') {
      continue;
    }
    if (node.name === 'image' && p === "src") {
      hasSrc = true;
      this.imageNodeHandle(nodeinfo, node);
      continue;
    }
    var sysdef = res.data[0],
      userdef = res.data[1];
    var property = sysdef[p];

    if (property) {
      property.tempid = 0;
      property.value = node.attrs[p];
      nodeinfo.property[property.id] = property;
    } else if (userdef) {
      property = userdef[p];
      if (porperty) {
        property.tempid = 1;
        property.value = node.attrs[p];
      } else {
        property = {
          id: p,
          name: p,
          type: '0',
          length: 200,
          label: true,
          tempid: 1,
          value: node.attrs[p]
        };
      }
      nodeinfo.property[property.id] = property;
    }
  }
  if (node.name == 'image' && !hasSrc) {
    this.imageNodeHandle(nodeinfo, node);
  } else if (node.name == 'text') {
    //文本节点
    this.textNodeHandle(nodeinfo, node);
  }
},
parseStyle: function(nodeinfo, node, res) {
  if (!res.data || !node.attrs) {
    return;
  }
  var style = node.attrs['style'];
  if (!style) {
    return;
  }

  var sysdef = res.data[0],
    userdef = res.data[1];
  if (style.indexOf(';') < 0) {
    style = [style];
  } else {
    style = style.split(';');
  }
  for (var k in style) {
    if (!k) {
      continue;
    }
    var tmp = style[k];
    if (!tmp) {
      continue;
    }
    tmp = tmp.split(':');
    var p = sysdef[tmp[0]];
    if (!p) {
      console.log(`********${tmp[0]}未定义**********`)
      p = {
        id: tmp[0],
        name: tmp[0],
        type: '0',
        length: 200,
        label: true,
        tempid: 0,
        value: tmp[1]
      };
    } else {
      var v = tmp[1];
      p.value = v;
      p.tempid = 0;
    }
    nodeinfo.style[p.id] = p;
  }
},
initNodeInfo: function(node) {
  var tasks = [],
    nodeinfo = {
      name: node.name,
      property: {},
      style: {}
    };
  //组件Style配置
  var resStyle = cache.fieldTemplate({
    temptype: 'css_style',
    category: null
  });
  if (resStyle) {
    this.parseStyle(nodeinfo, node, {
      data: resStyle
    });
  }
  var baseComp = utils.getBaseComponents(node);
  helperServ.showLoading();
  //组件属性配置
  cache.fieldTemplate({
    temptype: `layout_${node.name}`,
    category: null
  }, (err, resAttrs) => {
    helperServ.hideLoading();
    if (!err) {
      this.parseProperty(nodeinfo, node, {
        data: resAttrs
      });
      this.setData({
        nodename: baseComp.name,
        nodeinfo: nodeinfo
      })
    }
  });
},*/