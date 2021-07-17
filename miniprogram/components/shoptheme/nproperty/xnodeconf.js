const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const utils = require("../utils/utils.js");
const pagecfg = require("../cfg/pagecfg.js");
const app = getApp();
  /**node 数据结构：
   * node:{
   *  name:"",
   *  children:[{...}],
   *  attrs:{
   *    style:"",
   *    src:"",
   *    ...
   *  }
   *  dataset:{
   *   prompt:{},
   *   name:
   *   url:
   *   saleprice:
   *   stock:
   *   goodsname:
   *   ...
   *  }
   *  ...
   * }
   * 
   */
class xnodeconf {
  constructor(pageContext, options) {
    const userinfo = app.getMUser();
    this.shopid = userinfo.shopinfo.shopid;
    this.page = pageContext;
    this.node = options.node;
    this.ctrl = options.ctrl;
    /**
     * 初始化配置
     */
    this.initFieldInfo();
  }
  setData(data) {
    this.page.setData(data);
  }
  initFieldInfo() {
    //var baseComp = utils.getBaseComponents(node);
    var node = this.node,
      fieldinfo = {
        name: node.name,
        dataset:{},
        property: {},
        style: {}
      };
    //组件Style配置
    var resStyle = cache.fieldTemplate({
      temptype: 'css_style',
      category: null
    });
    if (resStyle) {
      this.initStyleField(fieldinfo, node, {
        data: resStyle
      });
    } 
    this._initFieldInfo(fieldinfo, node);
    helperServ.showLoading();
    //组件属性配置
    cache.fieldTemplate({
      temptype: `layout_${node.name}`,
      category: null
    }, (err, resAttrs) => {
      helperServ.hideLoading();
      if (!err) {
        this.initPropertyField(fieldinfo, node, {
          data: resAttrs
        });
        this.setData({       
          fieldinfo: fieldinfo
        })
      }
    });
  }

  _initFieldInfo(fieldinfo,node){
    //其他特别节点
    if (node.name == 'image') {
      this.initImageField(fieldinfo, node);
    } else if (node.name == 'text') {
      //文本节点
      this.initTextField(fieldinfo, node);
    }
  }

  initTextField(fieldinfo, node) {
    fieldinfo.property["title"] = {
      "seq": 1,
      "id": "title",
      "type": "0",
      "name": "文本内容",
      "value": node.attrs && node.attrs['title'] ? node.attrs['title'] : '',
      "required": "O",
      "label": true
    };
  }

  initImageField(fieldinfo, node) {
    fieldinfo.property["imagetype"] = {
      "id": "imagetype",
      "name": "选择图片",
      "type": "m",
      "required": "R",
      "value": node.attrs && node.attrs['imagetype'] ? node.attrs['imagetype'] : '',
      "length": 10,
      "checktype": '0', //单选
      "label": false,
      "checkbox": [
        {
          code: '1',
          name: "店铺图片"
        },
        {
          code: '2',
          name: "网络图片"
        }
      ],
      "placeholder": '请选择'
    };
    fieldinfo.property["src1"] = {
      "condition": "imagetype==1",
      "seq": 0,
      "id": "src1",
      "groupid": "src",
      "name": "店铺图片",
      "label": true,
      "type": "0",
      "value": node && node.attrs ? node.attrs['src'] || '' : '',
      "required": "R",
      "prompt": node.dataset && node.dataset['prompt'] ? node.dataset['prompt'] : null,
      "event": {
        "type": "tap",
        "name": "店铺图片",
        "togger": (e, cb) => {
          helperServ.goToPage("/pages/manager/shopImg/shopImg?upshow=1&shopid=" + app.getMUser().shopinfo.shopid);
          var currPage = helperServ.getCurrPage();
          var options = currPage.options;
          options.nextPageCallBack = (err, fileID) => {
            e.currentTarget.dataset.field.value = fileID;
            const prompt = {
              type: "b",
              retogger: true, //点击 prompt 项目 还有触发事件             
              value: [{ fileID: fileID}]
            };   
            cb(null, prompt);
          }
        }
      }
    };
    /*
    fieldinfo.property["src2"] = {
      "condition": "imagetype==2",
      "seq": 0,
      "groupid": "src",
      "id": "src2",
      "name": "上传图片",
      "label": true,
      "type": "b",
      "out": "1",
      "value": node && node.attrs ? node.attrs['src'] || '' : '',
      "required": "R"
    };*/
    fieldinfo.property["src2"] = {
      "condition": "imagetype==2",
      "seq": 0,
      "id": "src2",
      "groupid": "src",
      "name": "网络图片",
      "label": true,
      "type": "0",
      "value": node && node.attrs ? node.attrs['src'] || '' : '',
      "required": "R",
      "prompt": node.dataset&&node.dataset['prompt'] ? node.dataset['prompt'] : null,
      "event": {
        "type": "tap",
        "name": "验证",
        "togger": (e, cb) => {
          var field = e.currentTarget.dataset.field;        
          const prompt = {
            type: "b",
            retogger: true, //点击 prompt 项目 还有触发事件
            text: field.value,
            value: [{
              fileID: field.value
            }]
          };
          cb(null, prompt);
        }
      }
    };
    fieldinfo.dataset["url"] = {
      "seq": 0,
      "id": "url",
      "name": "页面",
      "label": true,
      "suffixvalue":`?shopid=${this.shopid}`,
      "suffix": [{"code":"?shopid=" +this.shopid ,name:"当前店铺"}],
      "type": "0",
      "value": node && node.dataset ? node.dataset['url'] || '' : '',
      "required": "O"
    };
  }
  /**
   * 属性输入配置字段
   */
  initPropertyField(fieldinfo, node, res) {
    if (!res.data || !node.attrs) {
      return;
    }
    var hasSrc = false;
    for (var p in node.attrs) {
      if (p == 'style') {
        continue;
      }
      var sysdef = res.data[0],
        userdef = res.data[1];
      var property = sysdef[p];
      if (property) {
        property.tempid = 0;
        property.value = node.attrs[p];
        fieldinfo.property[property.id] = property;
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
        fieldinfo.property[property.id] = property;
      }
    }

  }
  /**
   * 样式输入字段配置
   */
  initStyleField(fieldinfo, node, res) {
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
      fieldinfo.style[p.id] = p;
    }
  }
}

module.exports = xnodeconf;