const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const utils = require("../utils/utils.js");
const pagecfg = require("../cfg/pagecfg.js");
const fieldformat = require("./config/fieldformat.js");
const app = getApp();
const DS_ID = "datasource";
/**
 * 控件的数据:
 * ctrl:{
 *  datasource:{
 *    "navitype":[0],
 *    "data":{
 *  
 *    }
 *  }
 * }
 * 
 */

class xctrlconf {
  constructor(pageContext, options) {
    const userinfo = app.getMUser();
    this.shopid = userinfo.shopinfo.shopid;
    this.page = pageContext;
    this.ctrl = options.ctrl;
    this.attrs = this.ctrl.getAttrs() || {};
    this.toggerMap = {};
    this.addTogger("category", this.dsCategoryTogger);
    this.addTogger("navitype", this.dsNaviTypeTogger);
    this.addTogger("goods", this.dsGoodsTogger);
    this.initFieldInfo();
  }
  dsNaviTypeTogger(e, cb) {
    const v = e.currentTarget.dataset.field.value[0];
    if (v === '1') {
      this.dsCategoryTogger(e, cb);
    } else if (v === '2') {
      this.dsGoodsTogger(e, cb);
    } else if (v === '3') {

    }
  }
  dsCategoryTogger(e, cb) {
    var category = {},
      field = e.currentTarget.dataset.field,
      selArr = this.attrs[DS_ID],
      count = selArr && selArr.length || 0,
      maxlength = this.page.getMaxLength();
    if (selArr && selArr.length > 0) {
      selArr.forEach(v => {
        category[v.code] = v;
      })
    }
    this.page.showMyCategory(e, selArr, (catenode, okBtn) => {
      console.log("**************", catenode);
      if (count > maxlength) {
        --count;
        return;
      } else {
        if (catenode) {
          if (!catenode.active) {
            --count;
            delete category[catenode.code];
          } else if (count < maxlength) {
            ++count;
            category[catenode.code] = catenode;
          }
        }
      }
      console.log("*****showCategoryDlg******", count);
      if (count === maxlength || okBtn) {
        var arr = this.cate2Data(Object.values(category));
        if (arr && arr.length > 0) {
          //有修改
          this.sendField(DS_ID, arr)
        } else {
          arr = selArr;
        }
        var myDlg = this.page.selectComponent('#myCategory');
        myDlg.hide();
        const prompt = {
          type: "m",
          retogger: false, //点击prompt没有触发事件
          navitype: '1',
          value: arr
        };
        cb(null, prompt);
      }
    });
  }
  dsGoodsTogger(e, cb) {
    helperServ.goToPage("/components/shoptheme/goodssel/goodssel");
    var currPage = helperServ.getCurrPage();
    var options = currPage.options,
      field = e.currentTarget.dataset.field;
    options.maxlength = this.page.getMaxLength();
    options.selectedArr = this.attrs[DS_ID],
      options.nextPageCallBack = (err, goods) => {
        const prompt = {
          type: "m",
          retogger: false, //点击 prompt 项目 还有触发事件  
          navitype: "2",
          value: [{
            name: "您已经选择" + goods && goods.length + "件商品"
          }]
        };
        var arr = this.goods2Data(goods);
        if (arr) {
          this.sendField(DS_ID, arr);
        }
        cb(null, prompt);
      }
  }

  addTogger(ename, func) {
    this.toggerMap[ename] = func.bind(this);
  }
  getTogger(ename) {
    return this.toggerMap[ename];
  }
  setData(data) {
    this.page.setData(data);
  }
  sendField(id, value) {
    this.page.inputPropertyTogger({
      detail: {
        field: {
          id: id,
          value: value
        }
      }
    })
  }
  initFieldInfo() {
    var fieldinfo = [];
    this._initFieldInfo(fieldinfo);
    var exproperty = this.ctrl.getExPropertyCfg();
    for (var k in exproperty) {
      exproperty[k].group = "exproperty";
      fieldinfo.push(exproperty[k]);
    }
    var exstylecfg = this.ctrl.getExItemStyleCfg();
    for (var k in exstylecfg) {
      exstylecfg[k].group = "exstyle";
      fieldinfo.push(exstylecfg[k]);
    }
    this.setData({
      fieldinfo: fieldinfo
    })
  }
  _initFieldInfo(fieldinfo) {
    this.initPropertyField(fieldinfo);
  }
  /**
   * 属性输入配置字段
   */
  initPropertyField(fieldinfo) {
    var attrs = this.attrs,
      property = null;
    if (!attrs) {
      return;
    }
    for (var p in attrs) {
      if (p == 'style') {
        continue;
      }
      //property = attrs[p];
      property = Object.assign({},fieldformat[p]);
    
      if (property) {
        if (property.event && property.event.togger && typeof property.event.togger === "string") {
          property.event.togger = this.getTogger(property.event.togger);
        }
        //property.value = attrs[property.id].value
      } else {
        property = {
          id: p,
          name: p,
          type: '0',
          length: 200,
          label: true,
          tempid: 1,
          value: ""
        };
      }
      this.initPropertyVal(property);
      property.group="property"
      fieldinfo.push(property);
    }
  }
  initPropertyVal(property) {
    if (property.type === 'm') {
      if (property.id === DS_ID) {
        property.checkbox = this.attrs[DS_ID];
        property.value = property.checkbox && property.checkbox.map(v => {
          return v.code;
        });
      } else if (this.attrs[property.id]) {
        property.value = this.attrs[property.id];
      }
    } else {
      if (this.attrs[property.id]) {
        property.value = this.attrs[property.id];
      }
    }
  }

  goods2Data(goods) {
    var upd = false,
      arr = goods.map((v => {
        if (v.picpath) {
          if (!upd) {
            upd = true;
          }
          return {
            name: v.goodsname,
            code: v.goodsno,
            goodsno: v.goodsno,
            goodsname: v.goodsname,
            image: v.picpath[1] && v.picpath[1].fileID || v.picpath[2] && v.picpath[2].fileID || v.picpath[0] && v.picpath[0].fileID,
            saleprice: "¥" + v.price.saleprice,
            monthsales: v.quantity.monthsales > 99999 ? '99999+' : v.quantity.monthsales || '0',
            url: pagecfg.goodsdetail_page + "?goodsno=" + v.goodsno
          }
        } else {
          return v;
        }
      }));
    return upd ? arr : null;
  }
  /**
   * data:[{
   *  image:{
   *   src:''
   *  },
   *  text:{
   *   title:''
   *  },
   *  url:'' 
   * }]
   */
  cate2Data(cate) {
    var upd = false,
      arr = cate.map((v => {
        if (v.img) {
          if (!upd) {
            upd = true;
          }
          return {
            code: v.code,
            name: v.name,
            nodeindex: v.nodeindex,
            image: this.ctrl.compid === 'iconcategory' ? v.img[1] && v.img[1].fileID : v.img[0] && v.img[0].fileID,
            text: v.name,
            url: (pagecfg.goodslist_page + "?shopid=" + this.shopid + "&code=" + v.code) || v.url && (v.url + "?shopid=" + this.shopid + "&code=" + v.code)
          }
        } else {
          return v;
        }
      }));
    return upd ? arr : null;
  }
}

module.exports = xctrlconf;