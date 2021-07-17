const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const utils = require("../utils/utils.js");
const pagecfg = require("../cfg/pagecfg.js");
const xnodeconf = require("./xnodeconf.js");
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
class xitemconf extends xnodeconf{
  constructor(pageContext, options) {
    super(pageContext,options);
  }
  sendDataSet(id, value) {
    //栏目名称
    this.page.inputDataSetTogger({
      detail: {
        field: {
          id: id,
          value: value
        }
      }
    });
  }
  _initFieldInfo(fieldinfo,node) {
    this.initItemField(fieldinfo,node);
  }
  initItemField(fieldinfo, node) {
    fieldinfo.dataset = {};
    fieldinfo.dataset["title"] = {
      "seq": 1,
      "id": "title",
      "type": "0",
      "name": "标题",
      "value": node.dataset && node.dataset['title'] ? node.dataset['title'] : '',
      "required": "O",
      "label": true
    };
    
    fieldinfo.dataset["navitype"] = {
      "id": "navitype",
      "name": "选择导航目的",
      "type": "m",
      "required": "R",
      "value": node.dataset && node.dataset['navitype'] ? node.dataset['navitype'] : '',
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
    fieldinfo.dataset["src1"] = {
      "condition": "navitype==1",
      "seq": 0,
      "id": "src1",
      "groupid": "src",
      "name": "类别选择",
      "label": true,
      "type": "0",
      "value": node && node.dataset ? node.dataset['src'] || '' : '',
      "required": "R",
      "prompt": node.dataset && node.dataset['prompt'] ? node.dataset['prompt'] : null,
      "event": {
        "type": "tap",
        "name": "类别选择",
        "togger": (e, cb) => {
          this.page.showMyCategory(e, (node.dataset && node.dataset['prompt'] ? node.dataset['prompt'] : ''), (catenode) => {
            console.log("**************", catenode);
            if (catenode) {
              catenode.url = catenode.code.length > 3 ? pagecfg.goodslist_page : pagecfg.shopcategory_page;
              //var fileID = catenode.img[0].fileID;
              e.currentTarget.dataset.field.value = catenode.img[0].fileID;
              const prompt = {
                type: "b",
                retogger: true, //点击 prompt 项目 还有触发事件      
                text: catenode.code + "-" + catenode.name + "(" + (catenode.summary || '') + ")",
                nodeindex: [catenode.nodeindex] || [0],
                value: catenode.img
              };
              //手动调用，而不是enroll控件事件响应
              this.sendDataSet("title", catenode.name);
              this.sendDataSet("url", catenode.url + "?code=" + catenode.code);
              this.sendDataSet("prompt", prompt);
              cb(null, prompt);
            } else {
              //cb("未选择分类");
            }
            var myDlg = this.page.selectComponent('#myCategory');
            myDlg.hide();
          });
        }
      }
    };
    fieldinfo.dataset["src2"] = {
      "condition": "navitype==2",
      "seq": 0,
      "groupid": "src",
      "id": "src2",
      "name": "商品选择",
      "label": true,
      "type": "0",
      "value": node && node.dataset ? node.dataset['src'] || '' : '',
      "required": "R",
      "prompt": node.dateset && node.dateset['prompt'] ? node.dateset['prompt'] : null,
      "event": {
        "type": "tap",
        "name": "商品选择",
        "togger": (e, cb) => {
          helperServ.goToPage("/components/shoptheme/goodssel/goodssel");
          var currPage = helperServ.getCurrPage();
          var options = currPage.options;
          options.selectedArr=[];
          options.maxlength = 1;
          options.nextPageCallBack = (err, selgoods) => {
            var goods = selgoods && selgoods[0];
            e.currentTarget.dataset.field.value = goods.picpath[0].fileID;
            const prompt = {
              type: "b",
              retogger: true, //点击 prompt 项目 还有触发事件
              text: goods.goodsname + "(价格：" + (goods.price.saleprice || '') + ")",
              selectedArr: selgoods,
              value: goods.picpath
            };
            //手动调用，而不是enroll控件事件响应
            this.sendDataSet("goodsname", goods.goodsname);
            this.sendDataSet("saleprice", "¥"+goods.price.saleprice);
            this.sendDataSet("monthsales", goods.quantity.monthsales > 99999 ? '99999+' : goods.quantity.monthsales||'0');
            this.sendDataSet("url", pagecfg.goodsdetail_page + "?goodsno=" + goods.goodsno);
            this.sendDataSet("prompt", prompt);
            cb(null, prompt);
          }
        }
      }
    };
    fieldinfo.dataset["src3"] = {
      "condition": "navitype==3",
      "seq": 0,
      "id": "src3",
      "groupid": "src",
      "name": "网络地址选择",
      "label": true,
      "type": "0",
      "value": node && node.dataset ? node.dataset['src'] || '' : '',
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
      "condition": "navitype==3",
      "seq": 0,
      "id": "url",
      "name": "页面",
      "label": true,
      "type": "0",
      "value": node && node.dataset ? node.dataset['url'] || '' : '',
      "required": "R"
    };
  }
}

module.exports = xitemconf;