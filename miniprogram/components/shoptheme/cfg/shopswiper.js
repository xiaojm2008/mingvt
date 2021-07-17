/**
 * 每一个特别的组件皆有一个特有的js处理文件，以对特别
 * 店铺轮播组件定义
 */
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const xcomponent = require("./xcomponent.js");
const child_define = {
  "id": null,
  "desc": "图片样式",
  "name": "image",
  "nodeindex": null,
  "attrs": {
    "src": "/images/pic.png",
    "style": "width:100%;"
  },
  "subinfo":"",
  "fileID": "/images/pic.png",
  "mode": "scaleToFill"
};
class shopswiper extends xcomponent {
  constructor(pageContext, options) {
    super(pageContext, options);
  }
  initFromMeta(){
    //this.route = pageContext.route;
    this.compflag = '2'; //2：自定义业务组件
    this.compid = this.options.compid||"shopswiper"; //控件(组件)ID
    this.comptype = this.options.comptype ||"shopswiper"; //控件(组件)类型，一般等于ID
    this.compname = this.options.compname ||"轮播组件"; //控件(组件)名称
    this.unitid = this.options.unitid ||"biz_components"; //组件分类ID,譬如base_components（基本组件类）biz_components(业务组件类)
    this.unitname = this.options.unitname ||"业务组件"; //组件分类名称  
    this.posiofitem = this.options.posiofitem ||[0];//子元素位置[0],表示define[0]下面就是成员对象
    this.initlen = this.options.initlen||0;
  }
  initParentNode(){
    this.parentOfItem = this.getItemParentNode();//this.getParentOfItem();
    this.initParentAttrs();
    //规则重复元素定义
    this.itemDefine = this.parentOfItem.children && this.parentOfItem.children.length ? this.parentOfItem.children[0] : child_define;
  }
  makeXdefine() {
    var def = {
      "id": this.domid,
      "name": "swiper",
      "desc": "轮播样式",
      "CKEY": this.getCKEY(),
      "nodeindex": 0,
      "length": this.exproperty.length.value,
      "attrs": {
        "style": "height:560px",
        "class": "pic-view",
        "display-multiple-items":1,
        "indicator-dots":true,
        "indicator-active-color":"rgb(200,200,169)",
        "indicator-color":"rgb(223, 157, 157)",
        "current":0,
      }
    };
    var children = [],
      itemStyle = this.getItemStyleStr()+this.getExItemStyleStr();
    for (var i = 0; i < def.length; i++) {
      var child = Object.assign({}, child_define, {
        "id": this.domid +"_" + i,
        "CKEY": this.getCKEY(),
        //"nodeindex": 0 + "_" + i, 不能在这里定义，因为节点删除，不会重建Nodeindex，必须在模板里面处理
        "subinfo":"索引"+i,
        "attrs": {
          "style": itemStyle
        }
      });
      children.push(child);
    }
    def.children = children;
    /** compid 组件ID： unitid+compid 唯一*/
    return {
      "id": this.compid,
      "unitid": this.unitid,
      "CKEY": this.getCKEY(),
      "type": this.comptype,
      "name": this.compname,
      "compflag": this.compflag,
      "define": [def]
    };
  }
}

module.exports = shopswiper;