/**
 * 基础组件对象
 *    {
        "id": "grid",
        "unitid":"sys_template",
        "type": "grid",
        "name": "网格",
        "define": [{
          "id": "container",
          "name": "view",
          "block": true,
          "type": "",
          "text": "",
          "attrs": {
            "style": "height:365px",
            "class": "fu-grid",
          },
          "children": [{
              "id": "1",
              "name": "view",
              "block": true,
              "attrs": {
                "class": "item",
              },
              "children": [{
                "name": "image",
                "attrs": {
                  "src": "/images/pic.png",
                  "mode": "scaleToFill",
                  "style": "height:100%;width:100%;"
                }
              }, {
                "name": "text",
                "attrs": {
                  "class": "text line-clamp",
                  "style": "width:98%;"
                },
                "children": [{
                  "id": "1111",
                  "type": "text",
                  "text": "标题",
                }]
              }]
            },
            {
              "id": "1",
              "name": "view",
              "block": true,
              "attrs": {
                "class": "item",
              },
              "children": [{
                "name": "image",
                "attrs": {
                  "src": "/images/pic.png",
                  "mode": "scaleToFill",
                  "style": "height:100%;width:100%;"
                }
              }, {
                "name": "text",
                "attrs": {
                  "class": "text line-clamp",
                  "style": "width:98%;"
                },
                "children": [{
                  "id": "1111",
                  "type": "text",
                  "text": "标题",
                }]
              }]
            },
            {
              "id": "1",
              "name": "view",
              "block": true,
              "attrs": {
                "class": "item",
              },
              "children": [{
                "name": "image",
                "attrs": {
                  "src": "/images/pic.png",
                  "mode": "scaleToFill",
                  "style": "height:100%;width:100%;"
                }
              }, {
                "name": "text",
                "attrs": {
                  "class": "text line-clamp",
                  "style": "width:98%;"
                },
                "children": [{
                  "id": "1111",
                  "type": "text",
                  "text": "标题",
                }]
              }]
            },
            {
              "id": "1",
              "name": "view",
              "block": true,
              "attrs": {
                "class": "item",
              },
              "children": [{
                "name": "image",
                "attrs": {
                  "src": "/images/pic.png",
                  "mode": "scaleToFill",
                  "style": "height:100%;width:100%;"
                }
              }, {
                "name": "text",
                "attrs": {
                  "class": "text line-clamp",
                  "style": "width:98%;"
                },
                "children": [{
                  "id": "1111",
                  "type": "text",
                  "text": "标题",
                }]
              }]
            },
            {
              "id": "1",
              "name": "view",
              "block": true,
              "attrs": {
                "class": "item",
              },
              "children": [{
                "name": "image",
                "attrs": {
                  "src": "/images/pic.png",
                  "mode": "scaleToFill",
                  "style": "height:100%;width:100%;"
                }
              }, {
                "name": "text",
                "attrs": {
                  "class": "text line-clamp",
                  "style": "width:98%;"
                },
                "children": [{
                  "id": "1111",
                  "type": "text",
                  "text": "标题",
                }]
              }]
            },
            {
              "id": "1",
              "name": "view",
              "block": true,
              "attrs": {
                "class": "item",
              },
              "children": [{
                "name": "image",
                "attrs": {
                  "src": "/images/pic.png",
                  "mode": "scaleToFill",
                  "style": "height:100%;width:100%;"
                }
              }, {
                "name": "text",
                "attrs": {
                  "class": "text line-clamp",
                  "style": "width:98%;"
                },
                "children": [{
                  "id": "1111",
                  "type": "text",
                  "text": "标题",
                }]
              }]
            }
          ]
        }]
      }
 */

const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");

class xcomponent {
  constructor(pageContext, options) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.basepackage = options.package;
    this.options = options;
    //控件DOM树中ID,即元素ID
    this.domid = options.domid || mySeq.S4();
    this.components = [];
    this.CKEY = xcomponent.addMap(this, this.options.meta && this.options.meta.CKEY);
    this.init();
  }
  initFromMeta() {
    this.options.meta = this.options.meta || {};
    //1：基本组件对象， 2：自定义业务组件 ,999：顶层容器组件
    this.compflag = this.options.compflag || this.options.meta.compflag || '1';
    this.compid = this.options.id || this.options.meta.id || ''; //控件(组件)ID
    //分类ID,譬如base_components（基本组件类）biz_components(业务组件类)
    this.unitid = this.options.unitid || this.options.meta.unitid || '';
    this.comptype = this.options.type || this.options.meta.type || ''; //控件(组件)类型,一般有用户user和系统system
    this.compname = this.options.name || this.options.meta.name || ''; //控件(组件)名称  
    this.config = this.options.config || this.options.meta.config || ''; //控件(组件)名称  
    if (this.options.attrs || this.options.meta.attrs) {
      this.attrs = JSON.parse(JSON.stringify(this.options.attrs || this.options.meta.attrs)) || null;
    } else {
      this.attrs = null;
    }
    this.style = Object.assign({}, this.options.style || this.options.meta.style) || null;
    /*
      posiofitem:譬如子元素位置[0,0]。从define（Array）开始计算,
      表示define[0].children[0]下面就是成员对象
      若posiofitem配置等于null(undefine),define数组成员就是子元素上一级节点（即父节点位置）。
      那么define[0].children[0].children就是所有成员节点
    */
    this.posiofitem = this.options.posiofitem || this.options.meta.posiofitem || '';
    this.initlen = this.options.initlen || this.getCLength();
    this.unitname = this.options.unitname || "基础组件"; //组件分类名称
  }
  init() {
    this.initFromMeta();
    //长度等于-1的是不能有子元素的
    if (this.initlen === -1) {
      this.xdefine = this.makeXdefine();
      return;
    }
    this.exproperty = {}, this.exitemstylecfg = {};
    this.makeExProperty(this.exproperty);
    this.makeExItemStyleCfg(this.exitemstylecfg);
    this.xdefine = this.makeXdefine();
    //初始化父节点/子成员（规则重复元素）等信息
    this.initParentNode();
    console.log("********init xdefine********", this.xdefine);
  }
  initParentNode() {
    /**
     * 获取父亲节点指针
     */
    this.parentOfItem = this.getItemParentNode();
    this.initParentAttrs();
    /**
     * 获取第一个子成员节点
     */
    this.itemDefine = this.parentOfItem.children && this.parentOfItem.children.length ? this.parentOfItem.children[0] : null;
  }
  create() {
    var posi = 0,
      data = {},
      packdata = this.getPackageData();
    if (!packdata) {
      posi = 0;
    } else {
      posi = packdata.length;
    }
    data[`${this.getPackage()}[${posi}]`] = this.xdefine;
    this.page.setData(data);
    this.xdefine.posi = posi;
    console.log(`********create xdefine(${this.getPackage() }[${ posi }])********`, this.xdefine);
  }
  /**
   *重建xdefine后重画
   */
  update() {
    const posi = this.getPosi(),
      pack = this.getPackage();
    if (posi === undefined) {
      console.warn("****************update exception****************", this.getXdefine());
      return;
    }
    var data = {};
    data[`${pack}[${posi}]`] = this.getXdefine();
    this.page.setData(data);
    console.log(`**update(${pack}[${posi})]***`, pageServ.getData(`${pack}[${posi}]`, this.page));
  }
  destory() {
    /** getPackageData 其实就是 getSiblingData，他们返回结果是一样的 */
    var packdat = this.getPackageData();
    console.log(`*******destory[${this.getPosi()}]:[${this.getSiblingData().length == packdat.length}]*******`, packdat);
    packdat.splice(this.getPosi(), 1);
    //调整posi
    this.adjustPosi(packdat, this.getPosi());
    var data = {};
    data[this.getPackage()] = packdat;
    this.page.setData(data);
    /*
      1.不需要，参考 moveDown 中的注释，我们不根据posi来定位控件，
    我根据ckey来找控件,posi和nodeindex一样只定位控件在父节点（控件）中的位置。
    所以 this.components 其实是没有用的数组，可以删除
    * 2.上面1有問題，this.remove() 還是需要的，如果刪除了一個空件節點，那麽,需要調整posi位置。要不沒有辦法定位
    * 但是在moveDown，moveNodeDown 方法中，我們限制了控件節點與非控件節點不能交換位置。
      3.如果混合节点下，this.remove还是有问题，第2点不对，可以用adjustPosi来调整posi
    */
    //this.remove();
    xcomponent.delMap(this);
  }
  /**
   * 调整POSI
   * siblingNode:需要调整的兄弟节点
   * removePosi:已经被移除的控件节点位置
   * 这样调整后，那么就没有必要调用 this.remove();了
   */
  adjustPosi(siblingNode, removePosi) {
    siblingNode.forEach((v, posi) => {
      if (xcomponent.isCtrlNode(v) && posi >= removePosi) {
        v.posi = v.posi - 1;
      }
    });
  }

  adjustCtrlNodePosi(siblingNode) {
    siblingNode.forEach((v, posi) => {
      if (xcomponent.isCtrlNode(v)) {
        v.posi = posi;
      }
    });
  }
  remove() {
    if (!this.getCKEY()) {
      return;
    }
    var pCtrl = this.getParentCtrl();
    pCtrl.delOne(this.getPosi());
  }
  delOne(posi) {
    if (this.components.length > 0) {
      this.components.splice(posi, 1);
      this.components.forEach((v, i) => {
        v.setPosi(i);
      })
    }
  }
  spliceCtrl(posi, num, willAdd) {
    if (!willAdd) {
      this.components.splice(posi, num >= 0 ? num : 1);
    } else {
      this.components.splice(posi, num >= 0 ? num : 1, willAdd);
    }
  }

  makeXdefine() {
    if (this.options.meta.CKEY) {
      return this.options.meta;
    } else {
      return {
        "id": this.compid,
        "unitid": this.unitid,
        "CKEY": this.CKEY,
        "type": this.comptype,
        "name": this.compname,
        "attrs": this.attrs,
        "style": this.style,
        "posi": -1,
        "posiofitem": this.posiofitem,
        "compflag": this.compflag,
        "define": this.options.meta.define.map((item, i) => {
          //item.id = this.domid + i;
          item.CKEY = this.getCKEY();
          return this.copyNode(item, null, i);
        })
      };
    }
  }
  getName() {
    return this.compname;
  }

  /** 包 */
  /* 删除，修改为动态计算，适应控件位置调整（改变posi）的时候不出错。
  getPackage() {
    return this.package;
  }*/

  /**
   * 基准Package
   */
  setBasePackage(pack) {
    this.basepackage = pack;
  }
  getBasePackage() {
    return this.basepackage;
  }
  getPackage() {
    if (!this.parentCtrl) {
      return this.getBasePackage();
    }
    return this.parentCtrl.getCPackage();
  }
  getPackageData() {
    return pageServ.getData(this.getPackage(), this.page);
  }
  /**
   * 当前元素define   * 
   */
  getDPackage() {
    return `${this.getPackage()}[${this.getPosi()}].define`;
  }
  getDPackageData() {
    const cpack = this.getDPackage();
    return pageServ.getData(cpack, this.page);
  }
  /**
   * 获取所有子元素包
   * fetch children node package( )
   * 
   */
  getCPackage() {
    var pack = this.getDPackage();
    if (!this.posiofitem) {
      return pack;
    }
    this.posiofitem.forEach((v, i) => {
      pack += `[${v}].children`
    });
    return pack;
  }
  /**
   * 获取子元素节点数据
   * fetch children node data
   * 注意区别于 getNodeChildren(node) 
   */
  getCPackageData() {
    const spack = this.getCPackage();
    return pageServ.getData(spack, this.page);
  }
  getChildrenData() {
    const spack = this.getCPackage();
    return pageServ.getData(spack, this.page);
  }
  /**
   * 获取当前子节点长度
   * 
   */
  getChildLength() {
    const d = this.getChildrenData();
    if (d) {
      return d.length;
    }
    return 0;
  }
  /**
   * 获取兄弟节点长度
   */
  getSiblingLength() {
    return this.getParentCtrl().getChildLength();
  }
  /**
   * 获取兄弟节点数据
   * 注意区别于 getNodeSibling
   */
  getSiblingData() {
    return this.getParentCtrl().getChildrenData();
  }
  /**
   * 获取父亲节点
   * 注意区别于 getNodeParent(node),getNodeRoot,getRootNode,getRoot
   */
  getParentData() {
    return this.getParentCtrl().getDefines();
  }
  /**
   * 获取当前控件长度
   * 
   */
  getCtrlLength() {
    return this.components.length;
  }
  setXdefine(xdefine) {
    this.xdefine = xdefine;
  }
  getXdefine() {
    return this.xdefine;
  }
  /*
  getDefine() {
    //ctrl.xdefine && ctrl.xdefine.length > 0 ? ctrl.xdefine[0] : ctrl.xdefine
    return this.xdefine.define[0];
  }*/
  /** 返回节点定义数组
   * define结构:
   * define:
   * [{
        "name": "view",        
        "attrs": {
          "class": "x-row",
        },
        "children": [{
          "desc": "主题样式",
          "name": "text",
          "attrs": {
            "class": "x-subject",
          }
        }],
        "desc": "行样式"
      },
      ...]
   */
  getDefines() {
    //ctrl.xdefine && ctrl.xdefine.length > 0 ? ctrl.xdefine[0] : ctrl.xdefine
    return this.xdefine.define;
  }
  getRoots() {
    return this.getDefines();
  }
  getAttrs() {
    return this.attrs;
  }
  initParentAttrs() {
    this.parentOfItem.attrs = this.parentOfItem.attrs || {};
    if (this.options.style) {
      this.parentOfItem.attrs.style = this.updStyle2(this.parentOfItem.attrs.style, this.options.style, true);
    }
    this.itemStyle = this.parseStyle(this.parentOfItem.attrs.style);
    this.itemAttrs = null;
    for (var k in this.parentOfItem.attrs) {
      if (k == 'styletext' || k == 'style') {
        continue;
      }
      if (!this.itemAttrs) {
        this.itemAttrs = {};
      }
      this.itemAttrs[k] = this.parentOfItem.attrs[k];
    }
  }
  getCLength() {
    var parent = this.options.meta.define;
    if (this.posiofitem) {
      this.posiofitem.forEach((v, i) => {
        if (i === 0) {
          parent = parent[v];
        } else {
          parent = parent.children[v];
        }
      })
      return parent.children ? parent.children.length : 0;
    } else {
      return -1;
    }
  }
  /*获取需要被加入的控件的父控件节点位置
   * 将一个组件添加到另外一个组件下。先获取需要加到原Ctrl哪个地方
   * 即：getItemParentNode
   */
  getItemParentNode() {
    var parent = this.getDefines();
    if (this.posiofitem && Array.isArray(this.posiofitem)) {
      this.posiofitem.forEach((v, i) => {
        if (i === 0) {
          parent = parent[v];
        } else {
          parent = parent.children[v];
        }
      })
    }
    return parent;
  }


  setParentCtrl(ctrl) {
    this.parentCtrl = ctrl;
  }
  getParentCtrl() {
    return this.parentCtrl ? this.parentCtrl : xcomponent.getContainer();
  }
  /**
   * 获取当前控件在父控件中的节点位置
   */
  getCtrlParentNode() {
    return this.getParentCtrl().getItemParentNode();
  }
  /** 
   * 该方法没有用，至少限制不用在把ctrl push到this.components 
   * 参考 delOne destory remove moveDown 等方法的注释
   */
  _addComponent(ctrl) {
    this.components.push(ctrl);
  }
  /**
   * 
   * 如果targetNode不空，那么就是把ctrl加到targetNode下面，
   * 否则添加到parentOfItem下（即作为控件的成员，参考 addChildNode）
   * 注意：1.控件也是可以作为节点的，他只是特殊的含有define属性而没有children属性的节点（参考 isCtrlNode ）
   *      2.非容器控件(非xcontainer)中挂‘控件节点’又挂‘普通节点’，这样混合着，在移动排序的时候可能有问题。
   */
  addComponent(ctrl, targetNode, noUpd) {
    if (targetNode) {
      /*添加ctrl中的节点数据到当前控件targetNode节点下。
      原来ctrl.CKEY不需要了,需要复用this.CKEY.nodeindex，需要在当前控件中计算。不能从0开始。
      */
      this.addNode(ctrl, targetNode, noUpd);
      return;
    }
    /*添加控件，区别在nodetree(nodeParse)组件中解析不一样,如果添加了控件，
    那么判断child.define是否存在，若存在，那么就是一个控件。
    那么nodeindex重新从0开始计算，CKEY重新分配。这样好处在nodeindex太长。
    注意：控件也是可以作为节点的，他只是特殊的含有define属性而没有children属性的节点
    
    ctrl.setPackage(this.getCPackage());
    更新视图基于Package，如果控件在页面的 posi 调整了，那么posi需要调整。
    但是基准package在挂接的时候就已经设置了。后面的都是基于package更新，
    如果调整控件位置而不修改package那么会有问题。
    所以只在创建顶层容器控件xcontainer的时候设置他的package（基准package）
    后续挂接的控件或者节点都动态计算package.
    */
    //ctrl.setPackage(this.getCPackage());动态计算
    //获取子节点长度，而不是getLength()获取控件长度
    const len = this.getChildLength();
    ctrl.setPosi(len);
    var x = ctrl.getXdefine();
    console.log(`***********addComponent toXdefine(in position ${len})***********`, x);
    this.addChildNode(x, noUpd);
    ctrl.setParentCtrl(this);
    this._addComponent(ctrl);
  }
  getNodeName(node) {
    return node.name;
  }
  getNodeDesc(node) {
    return node.desc;
  }
  getNodeMarker(node) {
    return node.name + ":" + node.nodeindex;
  }
  _getNode(node, nodeidx, deep) {
    if (deep == nodeidx.length - 1) {
      return node[nodeidx[deep]];
      //cur.parent = p;
    }
    //p = node[nodeidx[deep]];
    return this._getNode(node[nodeidx[deep]].children, nodeidx, ++deep);
  }
  /**获取节点 */
  getNode(nodeindex) {
    var deep = 0,
      node;
    nodeindex = isNaN(nodeindex) && !Array.isArray(nodeindex) ? nodeindex.split('_') : nodeindex;
    if (Array.isArray(nodeindex)) {
      node = this._getNode(this.getDefines(), nodeindex, deep);
    } else {
      node = this.getDefines()[nodeindex];
    }
    //节点索引数组
    node.nodeindex = nodeindex;
    //组件在当前页面索引
    //node.unitindex = this.getPosi();
    return node;
  }
  getNodePosi(node) {
    return parseInt(node.nodeindex[node.nodeindex.length - 1]);
  }
  setNodeIndex(node, nodeindex) {
    if (!isNaN(nodeindex)) {
      node.nodeindex = nodeindex;
    } else if (Array.isArray(nodeindex)) {
      node.nodeindex = [...nodeindex];
    } else {
      node.nodeindex = nodeindex.split('_');
    }
  }
  getNodeRoot(node) {
    if (!isNaN(node.nodeindex)) {
      return this.getCtrlParentNode();
    }
    return this.getNode(node.nodeindex[0]);
  }
  /**
   * 获取节点父亲节点
   * 注意
   * 1.区别于 getParentData
   * 2.如果node.nodeindex==='0','1','2'...等待数字
   * 那么当前是define下的第一个节点了。处理和node.nodeindex===undefined一致
   * 都需要定位到他的控件节点，也就是当前控件节点的挂接处，可以根据  
   * pnode = ctrl.getCtrlParentNode()
   * 获取控件节点挂接处。
   */
  getNodeParent(node) {
    /**
     * node.nodeindex 在this.getNode中会转换为数组
     */
    if (Array.isArray(node.nodeindex)) {
      if (node.nodeindex.length === 1) {
        return null;
      }
      const pnodeindex = [];
      node.nodeindex.forEach((v, i, arr) => {
        if (i < arr.length - 1) {
          pnodeindex.push(v);
        }
      })

      return this.getNode(pnodeindex);
    } else {
      /*本身就是define[0]下面的节点即（ node = this.getDefines()[0];）
      如果需要删除this.getDefines()[0]，那么他的父亲是另外一个控件了，而不是一个node。
      这样的话就调用他this.destory();来执行自己销毁
      */
      return null;
    }
  }
  /**
   * 获取节点兄弟节点
   * 注意区别于 getSiblingData 方法
   */
  getNodeSibling(node) {
    var p = this.getNodeParent(node);
    return p && p.children;
  }
  /*
   * 获取节点兄弟子节点
   */
  getNodeChildren(node) {
    return node && node.children;
  }

  removeNodeByIndex(nodeindex) {
    var node = this.getNode(nodeindex);
    var pnode = this.getNodeParent(node);
    console.log("***********removeNodeByIndex pnode**************", nodeindex, node, pnode);
    if (!pnode) {
      this.destory();
      return;
    }
    pnode.children.splice(node.nodeindex[node.nodeindex.length - 1], 1);
    //节点下面有可能有控件节点，那么需要调整他们的posi
    this.adjustPosi(pnode.children, node.nodeindex[node.nodeindex.length - 1]);
    //this.setNode(pnode); 这个一步其实可以不用。
    this.updNode(pnode);
  }
  /**
   * 删除指定节点，譬如text,icon,image,view,swiper等
   */
  removeNode(node) {
    var pnode = this.getNodeParent(node);
    console.log("***********removeNode node pnode**************", node, pnode);
    if (!pnode) {
      this.destory();
      return;
    }
    pnode.children.splice(node.nodeindex[node.nodeindex.length - 1], 1);
    //this.setNode(pnode); 这个一步其实可以不用。
    this.adjustPosi(pnode.children, node.nodeindex[node.nodeindex.length - 1]);
    this.updNode(pnode);
  }
  /**
   * xcomponent中有三种类型的节点（控件节点，普通节点，成员节点）
   * 新增普通节点（一般节点）
   * 把srcCtrl添加到当前控件的targetNode节点下，并作为当前控件的节点的一个节点。
   * nodeindex继承targetNode继续编号
   * noUpd 是否更新到视图（默认：更新）
   */
  addNode(srcCtrl, targetNode, noUpd) {
    //var srcnode = srcCtrl.getRootNode();getRoots()
    var srcnode = srcCtrl.getDefines()
    //srcnode.CKEY = this.CKEY;
    targetNode.children = targetNode.children || [];
    var len = targetNode.children.length;
    srcnode.forEach((v, i) => {
      targetNode.children.push(this.copyNode(v, targetNode, len + i));
    });
    this.setNode(targetNode);
    this.updNode(targetNode);
  }
  /** 
   * xcomponent中有三种类型的节点（控件节点，普通节点，成员节点）
   * 删除成员节点（parentOfItem 下面的节点，成员节点下可能是一个自定义控件，参考 addChildNode）,
   * parentOfItem 根据getItemParentNode计算
   * getItemParentNode 在控件创建 initParentNode 中调用
   * 附：新增成员节点 addChildNode 方法
   * 
   * */
  removeChildNode(nodeindex) {
    console.log("***********removeChildNode curnode**************", nodeindex)
    var p = this.parentOfItem;
    if (!p) {
      this.destory();
      return;
    }
    if (!p.children || !p.children.length) {
      helperServ.showModal({
        content: "成员不存在！"
      });
      return;
    }
    if (isNaN(nodeindex)) {
      if (!Array.isArray(nodeindex)) {
        nodeindex = nodeindex.split("_");
      }
      if (!this.posiofitem) {
        //define就是成员，没有容器，或者容器就是page，顶层节点（this.node.nodeindex[0]）对应的成员节点
        nodeindex = nodeindex[0];
      } else {
        nodeindex = nodeindex[this.posiofitem.length];
      }
    }
    console.log("removeChildNode(nodeindex=):", nodeindex);
    p.children.splice(nodeindex, 1);
    this.setExPropertyValue("length", p.children.length);
    //更新视图
    this.update();
  }
  /**
   * 复制黏贴当前节点
   */
  copyChildNode(nodeindex) {
    var p = this.parentOfItem;
    if (!p) {
      return;
    }
    if (isNaN(nodeindex)) {
      if (!Array.isArray(nodeindex)) {
        nodeindex = nodeindex.split("_");
      }
      if (!this.posiofitem) {
        //define就是成员，没有容器，或者容器就是page，顶层节点（this.node.nodeindex[0]）对应的成员节点
        nodeindex = nodeindex[0];
      } else {
        nodeindex = nodeindex[this.posiofitem.length];
      }
    }
    var child = p.children[nodeindex];
    this.addChildNode(this.copyNode(child, p, p.children.length));
  }
  /**
   * 在控件 parentOfItem下面新增加新的控件（节点）
   * 作为成员节点
   * xcomponent中有三种类型的节点（控件节点，普通节点，成员节点）
   *  
   */
  addChildNode(child, noUpd) {
    var p = this.parentOfItem;
    if (!p) {
      helperServ.showModal({
        content: "当前不是容器控件，不能添加子控件！"
      });
      return;
    }
    if ((!p.children || !p.children.length) && !this.itemDefine) {
      if (!child) {
        helperServ.showModal({
          content: "配置错误，成员不存在！"
        });
        return;
      } else {
        p.children = [];
        //this.itemDefine = child;
      }
    }
    p.children.push(child || this.copyNode(this.itemDefine, p, p.children.length));

    this.setExPropertyValue("length", p.children.length);
    //更新视图
    !noUpd ? this.update() : null;
  }
  isItemNode(node) {
    if (!this.posiofitem || !node.nodeindex) {
      return false;
    }
    return (isNaN(node.nodeindex) && node.nodeindex.length - 1) == this.posiofitem.length;
  }

  getCKEY() {
    return this.CKEY;
  }
  getPosi() {
    return this.getXdefine().posi;
  }
  setPosi(posi) {
    this.getXdefine().posi = posi;
  }
  getChildrens() {
    return this.parentOfItem ? this.parentOfItem.children : null;
  }

  isBizComponent() {
    return this.unitid === 'biz_components';
  }
  getCtrlByPosi(posi) {
    return this.components[posi];
  }
  getCtrl(ckey) {
    return xcomponent.componentsMap[ckey];
  }

  /*
    copyNode(_nodes, pnode, idx) {
      return {
        id: idx >= 0 && pnode ? pnode.id + "_" + idx : _nodes.id,
        idx: idx >= 0 && pnode ? pnode.idx + "_" + idx : 0,
        name: _nodes.name ? _nodes.name : "view",
        fileID: _nodes.fileID || null,
        title: _nodes.title || null,
        attrs: Object.assign({}, _nodes.attrs),
        children: _nodes.children && _nodes.children.map((v, i) => {
          return this.copyNode(v, _nodes, i)
        }),
        type: _nodes.type == 'text' ? _nodes.type : '',
        text: _nodes.type == 'text' ? _nodes.text : ''
      }
    }
  */
  /**
   * _nodes:需要复制的节点
   * pnode:当前节点需要复制到该节点的children下
   * idx:_nodes在pnode.children下的位置。从0开始。
   * 
   */
  copyNode(_nodes, pnode, idx) {
    return Object.assign({}, _nodes, {
      CKEY: this.CKEY,
      id: pnode && pnode.children && pnode.children.length > 0 ? pnode.id + "_" + idx : ('m' + idx) || 'n0',
      attrs: Object.assign({}, _nodes.attrs),
      children: _nodes.children && _nodes.children.map((v, i) => {
        //_nodes.id = idx >= 0 && pnode ? pnode.id + "_" + idx : _nodes.id;
        _nodes.id = pnode && pnode.children && pnode.children.length > 0 ? pnode.id + "_" + idx : ('m' + idx) || 'n0';
        return this.copyNode(v, _nodes, i)
      })
    });
  }
  getExPropertyCfg() {
    return this.exproperty;
  }
  getExItemStyleCfg() {
    return this.exitemstylecfg;
  }
  setExItemStyleCfgValue(style) {
    var upd = false;
    for (var k in style) {
      this.exitemstylecfg[k].value = style[k];
      if(!upd){
        upd = true
      }
    }
    return upd;
  }
  getExItemStyle() {
    var map = {},
      empty = true,
      items = this.getExItemStyleCfg();
    for (var k in items) {
      const v = items[k].value;
      if (v && v.trim() !== '') {
        map[k] = v;
        empty = false;
      }
    }
    return empty ? '' : map;
  }

  getExItemStyleStr() {
    var style = "",
      items = this.getExItemStyleCfg();
    for (var k in items) {
      //childflag=1:成员style,childflag=2:成员attribute
      const v = items[k].value;
      if ((k == 'styletext' || k == 'style') && v) {
        style += `${v};`
      } else if (v) {
        style += `${k}:${v};`;
      }
    }
    return style;
  }
  getItemStyle() {
    return this.itemStyle;
  }
  getItemStyleStr() {
    this.styleToStr(this.getItemStyle());
  }
  setExPropertyValue(key, value) {
    if (this.exproperty && this.exproperty[key]) {
      //类型检查略
      this.exproperty[key].value = value;
    };
  }
  getExPropertyValue(key){
    if (this.exproperty && this.exproperty[key]) {
      return this.exproperty[key].value;
    }
    return null;
  }
  /** 容器特有自定义属性 */
  makeExProperty(exproperty) {
    exproperty["length"] = {
      "seq": 0,
      "id": "length",
      "type": "1",
      "disabled": true,
      "name": "成员数量",
      "value": this.initlen || 0,
      "required": "R",
      "label": true
    };
  }
  setLength(length) {
    var parentOfItem = this.parentOfItem.children;
    if (!parentOfItem) {
      return;
    }
    /**把参数更新到xdefine,update才能生效 */
    if (parentOfItem.length != length) {
      //有修改
      if (parentOfItem.length > length) {
        parentOfItem.splice(length, parentOfItem.length - length);
      } else if (parentOfItem.length < length) {
        //define.children.splice(define.children.length, 0, )
        var len = parentOfItem.length,
          children = [],
          itemStyle = this.getItemStyleStr() + this.getExItemStyleStr();
        //itemStyle = this.getItemsStyle();
        for (var i = 0; i < length - len; i++) {
          var child = this.copyNode(this.itemDefine, this.parentOfItem, len + i);
          child.attrs = child.attrs || {};
          child.attrs.style = itemStyle;
          child.subinfo = "索引" + (len + i);
          //console.log("---------addChild---------", child);
          parentOfItem.push(child);
        }
      }
    }
  }
  fillData(child, dat) {
    if (child.children) {
      child.children.forEach((v, i) => {
        this.fillData(v, dat);
      });
    }
    if (child.attrs && child.attrs.vfor) {
      const vfor = this.getAttrsValKey(child.attrs.vfor);
      if (vfor) {
        child.value = dat[vfor];
      } else {
        helperServ.showToast({
          title: child.attrs.vfor + "表达错误"
        })
        return;
      }
    } else if (dat[child.name]) {
      child.value = dat[child.name];
    }
  }
  setData(data) {
    var upd = false;
    if (data && Array.isArray(data) && this.parentOfItem) {
      //填充的子成员
      var children = this.parentOfItem.children,
        len = children.length,
        exItemStyle = this.getExItemStyle();
      for (var i = 0; i < data.length; i++) {
        var v = data[i],
          child = children[i];
        if (!child) {
          return;
        }
        if (exItemStyle) {
          child.attrs = child.attrs || {};
          child.attrs.style = this.updStyle2(child.attrs.style, exItemStyle, true);
        }
        if (v.url) {
          child.url = v.url;
          child.event = true;
        } else{
          child.url = '';
          child.event = false;
        }
        this.fillData(child, v);
        if (!upd) {
          upd = true;
        }
      };
    }
    return upd;
  }
  formatAttrs(value, fmt) {
    if (!fmt || fmt.length === 0) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(v => {
        return fmt.reduce((pre, cur, arr) => {
          pre[cur] = v[cur];
          return pre;
        }, {});
      });
    } else if (typeof value === "object") {
      return fmt.reduce((pre, cur, arr) => {
        pre[cur] = value[cur];
        return pre;
      }, {});
    } else {
      return value;
    }
  }
  getAttrsValKey(vfor) {
    const start = vfor.indexOf("${");
    if (start >= 0) {
      const end = vfor.lastIndexOf("}");
      return vfor.substring(start + 2, end);
    }
    return '';
  }
  _setAttrs(attrs) {
    var upd = false;
    if (attrs.datasource) {
      upd = this.setData(attrs.datasource);
    }
    var defines = this.getDPackageData();
    defines.forEach(v => {
      for (var k in attrs) {
        if (v.attrs[k] != undefined) {
          var vkey = null;
          if (typeof v.attrs[k] === "object") {
            vkey = this.getAttrsValKey(v.attrs[k].vfor);
          }
          if (vkey) {
            v.attrs[k].value = this.formatAttrs(attrs[vkey], v.attrs[k].format);
          } else {
            v.attrs[k] = attrs[k];
          }
          if (!upd) {
            upd = true;
          }
        }
      }
    });
    return upd;
  }
  setAttrs(attrs) {
    if (attrs) {
      for (var i in attrs) {
        this.attrs[i] = attrs[i];
      }
      return this._setAttrs(attrs);
    }
    return false;
  }
  updExItemStyle() {
    var parentOfItem = this.parentOfItem.children;
    if (!parentOfItem) {
      return;
    }
    var exItemStyle = this.getExItemStyle();
    exItemStyle && parentOfItem.forEach((v, i) => {
      if (xcomponent.isCtrlNode(v)) {
        return;
      } else {
        //console.log("---------updStyle2---------", v, new_map);
        v.attrs.style = this.updStyle2(v.attrs.style, exItemStyle, true);   
      }
    });
  }
  makeExItemStyleCfg(exitemstylecfg) {
    var res = cache.fieldTemplate({
      temptype: 'css_style',
      category: null
    });
    if (!res || res.length < 1) {
      helperServ.showModal({
        content: res.errMsg
      });
      return;
    }
    var sysdef = res[0],
      userdef = res[1];
    exitemstylecfg["height"] = Object.assign({}, sysdef.height, {
      "name": "成员高度",
      "id": "height"
    });
    exitemstylecfg["width"] = Object.assign({}, sysdef.height, {
      "name": "成员宽度",
      "id": "width"
    });
    exitemstylecfg["styletext"] = Object.assign({}, sysdef.styletext, {
      "name": "成员自定义样式",
    });
  }
  fillNodeData(child, dat, data, pack) {
    if (child.children) {
      child.children.forEach((v, i) => {
        return this.fillNodeData(v, dat, data, `${pack}.children[${i}]`);
      });
    }
    if (child.attrs && child.attrs.vfor) {
      const vfor = this.getAttrsValKey(child.attrs.vfor)
      if (vfor) {
        if (child.name === 'text') {
          child.attrs.title = dat[vfor];
          data[pack + ".attrs.title"] = child.attrs.title;
        } else if (child.name === 'image') {
          child.attrs.src = dat[vfor];
          data[pack + ".attrs.src"] = child.attrs.src;
        } else {
          child.attrs.vfor = dat[vfor];
          data[pack + ".attrs." + vfor] = child.attrs.vfor;       
        }
      } else {
        helperServ.showToast({
          title: child.attrs.vfor + "表达是错误"
        })
        return data;
      }
    } else {
      child.attrs = child.attrs || {};
      if (child.name === 'text' && dat["title"]) {
        child.attrs.title = dat["title"];
        data[pack + ".attrs.title"] = child.attrs.title;
      } else if (child.name === 'image' && dat["src"]) {
        child.attrs.src = dat["src"];
        data[pack + ".attrs.src"] = child.attrs.src;
      } 
      if (dat["url"]) {
        child.attrs.url = dat["url"];
        data[pack + ".attrs.url"] = child.attrs.url;
        data[pack + ".event"] = true;
      }
    }
    /*
    if (child.name === 'text' && child.attrs.title) {
      data[pack + ".attrs.title"] = child.attrs.title;
    } else if (child.name === 'image' && child.attrs.src) {
      data[pack + ".attrs.src"] = child.attrs.src;
    } 
    if (child.attrs.url) {
      data[pack + ".attrs.url"] = child.attrs.url;
      data[pack + ".event"] = true;
    }*/
    return data;
  }
  setNode(node) {
    if (Array.isArray(node.nodeindex)) {
      var deep = 0,
        nodePoint = this._getNode(this.xdefine.define, node.nodeindex, deep);
      nodePoint = node;
    }
  }
  /**
   * node:{
   *  name:"",
   *  children:[{...}],
   *  attrs:{
   *    style:"",
   *    src:"",
   *    ...
   *  }
   *  dataset:{
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
  updNodeData(node, dataset) {
    this.updNode(node, {
      data: dataset ? dataset.data : null
    });
  }
  /**
   * noExistsResve:true，更新
   * noExistsResve:false,替换(用新风格替换旧风格)
   * opt:{
   *  style:{
   *  
   *  }
   * }
   */
  updNodeStyle(node, newstyle, noExistsResve) {
    this.updNode(node, {
      style: newstyle,
      noExistsResve: noExistsResve
    });
  }
  updNodeAttrs(node, property) {
    this.updNode(node, {
      property: property
    });
  }
  /*
    详细见nproperty.js中设置
    opt:{
      property:{

      },
      style:{

      },
      dataset:{

      }
    }
  */

  updNode(node, opt) {
    /*
    if (exproperty) {
      //重画控件
      this.setNode(node);
      this.setExProperty(exproperty);
      this.update();
      return;
    }*/
    /*
    if (node.unitindex === undefined) {
      helperServ.showModal({
        content: '组件索引undefine!'
      });
      return;
    }*/
    var data = {},
      key = this.getDPackage(); // `${this.package}[${unitindex}].define`; unitindex = node.unitindex,
    if (Array.isArray(node.nodeindex)) {
      node.nodeindex.forEach((v, i, arr) => {
        if (i === arr.length - 1) {
          key += `[${v}]`
        } else if (i >= 0) {
          key += `[${v}].children`
        }
      });
    } else {
      key += `[${node.nodeindex}]`;
    }
    //console.log("***********updNode nodeindex ,key************", node.nodeindex, key);
    if (opt) {
      if (opt.property) {
        //更新属性
        for (var k in opt.property) {
          data[key + ".attrs." + k] = opt.property[k];
        }
      }
      if (opt.style) {
        //更新style
        node.attrs.style = this.updStyle2(node.attrs.style, opt.style, opt.noExistsResve || true);
        data[key + ".attrs.style"] = node.attrs.style;
      }
      if (opt.data) {
        //更新数据
        //node.dataset = opt.data;
        data[key + ".dataset"] =opt.data;
        //pageServ.setData(key+".dataset",this.getXdefine(),opt.data);
        data = this.fillNodeData(node, opt.data, data, key);
        /*
        if (node.name === 'text') {
          data[key + ".attrs.title"] = node.attrs.title;
        } else if (node.name === 'image') {
          data[key + ".attrs.src"] = node.attrs.src;
        } else {
          data[key + ".value"] = node.value;
        }*/
      }
    } else {
      data[key] = node;
    }
    this.page.setData(data);
    //更新当前xdefine,使得每次更改都生效
    this.setXdefine(this.getPackageData()[this.getPosi()]);
  }
  parseStyle(style) {
    if (!style) {
      return null;
    }
    if (style.indexOf(';') < 0) {
      style = [style];
    } else {
      style = style.split(';');
    }
    var map = {};
    for (var k in style) {
      var v = style[k];
      if (!v) {
        continue;
      }
      v = v.split(':');
      if (v[1]) {
        map[v[0]] = v[1];
      }
    }
    return map;
  }
  updStyle(old_s, new_map, noExistsResve) {
    if (!old_s) {
      //console.log("***updStyle*****",new_map);
      return Object.assign({}, new_map);
    }
    if (old_s.indexOf(';') < 0) {
      old_s = [old_s];
    } else {
      old_s = old_s.split(';');
    }
    var map = {};
    for (var k in old_s) {
      var v = old_s[k];
      if (!v) {
        continue;
      }
      v = v.split(':');
      var n_v = new_map[v[0]];
      if (!n_v) {
        if (noExistsResve && v[1]) {
          //新值不存在，那么旧中保留 
          map[v[0]] = v[1];
        }
        //新值不存在，那么旧中也需要删除
      } else {
        map[v[0]] = n_v;
      }
    }
    return Object.assign(map, new_map);
    //return map;
  }
  styleToStr(map) {
    var s = '';
    for (var k in map) {
      const v = map[k];
      if ((k == 'styletext' || k == 'style') && v) {
        s += `${v};`
      } else if (v) {
        s += `${k}:${v};`;
      }
    }
    return s;
  }
  updStyle2(old_s, new_map, noExistsResve) {
    if (!noExistsResve) {
      //new_map替换原来的old_style
      return this.styleToStr(new_map);
    }
    return this.styleToStr(this.updStyle(old_s, new_map, noExistsResve));
  }
  updSort() {
    //sPackdatArr 获取当前节点的子节点
    var sPackdatArr = this.getChildrenData();
    sPackdatArr.sort((a, b) => {
      return a.posi - b.posi;
    })
    var data = {};
    data[this.getCPackage()] = sPackdatArr;
    this.page.setData(data);
  }
  /**当前控件下移 */
  moveDown() {
    var pCtrl = this.getParentCtrl(),
      startIndex = this.getPosi(),
      parentChildren = pCtrl.getChildrenData(),
      currNode = parentChildren[startIndex],
      len = pCtrl.getChildLength();
    if (startIndex + 1 < len) {
      var nextNode = parentChildren[startIndex + 1];
      /*下面加上判斷的原因，如果当前控件下面有三个子节点，其中二个是组件（一个是节点，当然控件也是节点的一种）
      那么this.components数组中可能只有2个成员，因为节点不会在里面，那么根据posi来删除，有会有问题
      posi其实是控件在上次节点（或控件）中的位置。节点索引（nodeindex）一样用来定位。
      */
      if (xcomponent.isCtrlNode(nextNode)) {
        var nextCtrl = pCtrl.getCtrl(nextNode.CKEY);
        nextCtrl.setPosi(startIndex);
      } else {
        helperServ.showToast({
          title: `您交换了控件节点[${currNode.name}]和普通节点[${nextNode.name}]的位置[${startIndex}<->${startIndex + 1}]！`,
          icon: 'none'
        });
        console.log(`您交换了控件节点[${currNode.name}]和普通节点[${nextNode.name}]的位置[${startIndex}<->${startIndex + 1}]！`);
      }
      //不能用posi來獲取Ctrl,混合子節點（三个子节点，其中二个是组件）的時候有問題。
      //var nextCtrl = pCtrl.getCtrlByPosi(startIndex + 1);
      /*
      if (nextCtrl1.getPosi() != nextCtrl.getPosi()) {
        helperServ.showToast({
          title: `Components[${nextNode.CKEY}] Posi[${nextCtrl1.getPosi()}!= ${nextCtrl.getPosi()}] Exception！`,
          icon: 'none'
        });
        return;
      }*/
      //nextCtrl.setNodeIndex(nextNode, this.getNodePosi(parentChildren[startIndex]));    
      if (xcomponent.isCtrlNode(currNode)) {
        this.setPosi(startIndex + 1);
      } else {
        console.log(`当前节点[${currNode.name}]非控件节点`);
      }
      /*1.那么不调整this.components中控件位置，当然也不有问题，我们不存在根据this.components来找控件。
      我们根据CKEY来定位控件,delOne 方法也需要修改。
        2.上面第一點是錯誤的，需要調整components中控件的位置，destory中remove,delOne方法也需要執行
        3.混合模式下spliceCtrl 調用也可能有問題
      */
      //pCtrl.spliceCtrl(startIndex, 1); //删除当前控件在父控件中的位置
      //pCtrl.spliceCtrl(startIndex + 1, 0, this); //加入到新的位置
      //对父亲节点的子节点排序，即当前节点的兄弟节点排序
      parentChildren.splice(startIndex, 1); //根据位置删除父NODE中的NODE
      parentChildren.splice(startIndex + 1, 0, currNode); //加入到新的位置
      pCtrl.update();
      //this.adjustCtrlNodePosi(parentChildren);
    } else {
      helperServ.showToast({
        title: '当前控件是最后一个控件！！',
        icon: 'none'
      });
    }
  }
  /** 当前节点下移动 */
  moveDownNode(node) {
    //this.getNodeSibling(node);
    var startIndex = this.getNodePosi(node),
      pnode = this.getNodeParent(node);
    if (!pnode) {
      console.log('需要移动当前节点，请使用控件下移');
      helperServ.showToast({
        title: '当前移动的节点是控件',
        icon: 'none'
      });
      this.moveDown();
      return;
      //没有父亲节点，那么这个应该是一个控件加入到DOM树，那么这样只能调整控件位置，使用控件下移
      //pnode = this.getCtrlParentNode();     
    }
    var parentChildren = this.getNodeChildren(pnode),
      len = parentChildren && parentChildren.length;
    if (startIndex + 1 < len) {
      var nextNode = parentChildren[startIndex + 1];
      if (xcomponent.isNode(node) && xcomponent.isNode(nextNode)) {
        this.setNodeIndex(nextNode, node.nodeindex);
        parentChildren.splice(startIndex, 1); //根据位置删除父NODE中的NODE
        parentChildren.splice(startIndex + 1, 0, node); //加入到新的位置
        node.nodeindex[node.nodeindex.length - 1] = (startIndex + 1) + '';
        this.updNode(pnode);
      } else {
        helperServ.showToast({
          title: '控件节点和普通节点不能交换位置！',
          icon: 'none'
        });
        return;
      }
    } else {
      helperServ.showToast({
        title: '当前节点是尾节点！！',
        icon: 'none'
      });
    }
  }
  /**
   * return array
   */
  getLayout() {
    return this.getPackageData();
  }
  /**
   * node:{
   *  id:
   *  name:
   *  attrs:
   *  children:[]
   * }
   * 
   */
  _toNodes(node) {
    if (!node.children) {
      if (node.define) {
        node.children = node.define.map((item, i) => {
          return this.copyNode(item, node, i);
        });
        console.log(`*******_toNodes node.children is undefined but node.define is exists***********`);
      }
    }
    if (node.children) {
      var add = {};
      node.children.forEach((v, i, arr) => {
        if (v.define) {
          add[i] = v.define.map((item, i) => {
            return this.copyNode(item, v, i);
          })
          console.log(`*******_toNodes find define splice ${i}***********`);
        }
      });
      var l = 0;
      for (var k in add) {
        var p = parseInt(k) + l;
        var a1 = add[k];
        l = l + a1.length - 1;
        console.log(`******posi=${p} k=${k} len=${l}******`);
        a1.unshift(p, 1)
        Array.prototype.splice.apply(node.children, a1);
        console.log(`******posi=${p} k=${k} len=${l}****node=`);
      }
    }
    return {
      id: node.id,
      name: node.name,
      attrs: node.attrs,
      value: node.value || '',
      children: node.children && node.children.map((v, i, arr) => {
        if (v.define) {
          /**v的上级结构n(node)：
           * n：{
           *   id:
           *   name:
           *   attrs:
           *   children:[
           *    v=>{id,unitid,type,define:[]},
           *    n=>{id,name,attrs,children:[]}
           *   ]
           * }
           * v的结构：
           * v:{
          *     "id": this.compid,
                "unitid": this.unitid,
                "CKEY": this.CKEY,
                "type": this.comptype,
                "name": this.compname,
                "compflag": this.compflag,
                "define": this.options.meta.define.map((item, i) => {
                  item.id = this.domid + i;
                  item.CKEY = this.getCKEY();
                  return this.copyNode(item, null, i);
                })
              }
            }
            解决：v.define这个数组变成v的上级结构n.children的成员(v或n);
            如果v.define只有一个好办，即v= v.define[0]（v,n都是n.children的成员，可简单替换）
            如果v.define多个：
          */
          //v.define是大于1个长度的数组,不能简单替换
          //v = v.define[0];
          //v.children = v.define;
          //console.log("**************_toNodes define*******", v);
        }
        return this._toNodes(v)
      })
    };
  }
  toNodes() {
    var defines = this.getDefines();
    return defines.map((item, i) => {
      return this._toNodes(this.copyNode(item, null, i));
    });
    /*
    defines.forEach(v => {
      var n = this._toNodes(v);
      console.log("********toNodes******", n);
      nodes.push(n);
    });*/
    //return [this._toNodes(this.getDefines())]; 
  }
}

xcomponent.noContainerMap = {
  "icon": 1,
  "image": 1,
  "text": 1
}
xcomponent.componentsMap = {};
xcomponent.genCKey = () => {
  var key = mySeq.S4();
  if (xcomponent.componentsMap[key]) {
    key = mySeq.S8();
    if (xcomponent.componentsMap[key]) {
      key = mySeq.S12();
      if (xcomponent.componentsMap[key]) {
        key = mySeq.S16();
        if (xcomponent.componentsMap[key]) {
          return null;
        }
      }
    }
  }
  return key;
}
xcomponent.addMap = (ctrl, ckey) => {
  const key = ckey || xcomponent.genCKey();
  if (!key) {
    helperServ.showModal({
      content: 'getCKey Exception!'
    })
    return null;
  }
  xcomponent.componentsMap[key] = ctrl;
  return key;
}
xcomponent.delMap = (ctrl) => {
  delete xcomponent.componentsMap[ctrl.getCKEY()];
}
xcomponent.setContainer = (ctrl) => {
  xcomponent.container = ctrl;
}
xcomponent.getContainer = () => {
  return xcomponent.container;
}
xcomponent.isContainer = (ctrl) => {
  return xcomponent.container.getCKEY() === ctrl.getCKEY();
}
/**
 * 控件也是可以作为节点的挂在其他节点下的，他只是特殊的含有define属性而没有children属性的节点
 * 譬如：顶层容器xcontainer下面的节点都是控件
 * 设计思想容许控件下可以挂控件
 */
xcomponent.isContainerNode = () => {
  return !xcomponent.noContainerMap[this.comptype];
}
xcomponent.isCtrlNode = (node) => {
  return !!node.define;
}
xcomponent.isNode = (node) => {
  return !xcomponent.isCtrlNode(node);
}

xcomponent.loadThema = (parent, node, posi, pageContext, pack) => {
  var ctrl = parent;
  if (node.define && node.define.length > 0) {
    ctrl = new xcomponent(pageContext, Object.assign({
      package: pack
    }, {
      meta: node
    }));
    ctrl.setPosi(node.posi);
    //console.log(`***********loadThema(in position ${posi}<=>${node.posi} ckey=${node.CKEY})***********`);
    ctrl.setParentCtrl(parent);
    if (parent) {
      parent._addComponent(ctrl);
    } else {
      //console.log(`*** ckey=${node.CKEY}:${ctrl.getCKEY()} PARENT***`);
      xcomponent.setContainer(ctrl);
    }
    node.define && node.define.forEach(_node => {
      _node.children && _node.children.forEach((v, i) => {
        xcomponent.loadThema(ctrl, v, i, pageContext, pack);
      });
    })
  } else if (node.children && node.children.length > 0) {
    node.children && node.children.forEach((v, i) => {
      xcomponent.loadThema(ctrl, v, i, pageContext, pack);
    });
  }
}
xcomponent.CTRL_NTREE_ID = "nt_0";
xcomponent.PN_ID = "nid_0";
xcomponent.PRE_ID = "n";
xcomponent.NODE_TREE_MAP = {};
xcomponent.clearNodeTree = function() {
  xcomponent.NODE_TREE_MAP = {};
}
xcomponent.removeNodeTree = function(node, nodeindex) {
  delete xcomponent.NODE_TREE_MAP[xcomponent.PRE_ID + node.CKEY + (Array.isArray(nodeindex) ? nodeindex.join("_") : nodeindex)];
}
xcomponent.addNodeTree = function(node, nodeindex, nodeTree) {
  xcomponent.NODE_TREE_MAP[xcomponent.PRE_ID + node.CKEY + (Array.isArray(nodeindex) ? nodeindex.join("_") : nodeindex)] = nodeTree;
}
xcomponent.getNodeTree = function(node) {
  return xcomponent.NODE_TREE_MAP[xcomponent.PRE_ID + node.CKEY + (Array.isArray(node.nodeindex) ? node.nodeindex.join("_") : node.nodeindex)];
}
module.exports = xcomponent;