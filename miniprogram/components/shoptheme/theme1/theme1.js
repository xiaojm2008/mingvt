const helperServ = require("../../../lib/utils/helper.js");
const shopServ = require("../../../lib/manager/shop.js");
const pageServ = require("../../../lib/utils/pagehelper.js");
const cache = require("../../../lib/utils/cache.js");
const xcompon = require("../cfg/xcomponent.js");
const utils = require("../utils/utils.js");
const mytools = require("../template/tools.js");
const themaServ = require("../../../lib/manager/thema.js")
const app = getApp();
var xcontainer = null;

class tempCenter {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.page.addCtrlTogger = this.addCtrlTogger.bind(this);
    this.page.editCtrlTogger = this.editCtrlTogger.bind(this);
    this.page.delCtrlTogger = this.delCtrlTogger.bind(this);
    this.page.operCtrlTogger = this.operCtrlTogger.bind(this);
    this.page.tapNodeTogger = this.tapNodeTogger.bind(this);
    this.page.operNodeTogger = this.operNodeTogger.bind(this);
    this.page.locatedPNodeTogger = this.locatedPNodeTogger.bind(this);
  }
  addCtrlTogger(e) {
    console.log('addCtrlTogger', e);
    this.page.addComponent(e.detail.ckey);
  }
  editCtrlTogger(e) {
    console.log('editCtrlTogger', e);
    this.page.showNodeTree(e.detail.ckey);
  }
  delCtrlTogger(e) {
    console.log('delCtrlTogger', e);
  }
  operCtrlTogger(e) {
    //console.log('operCtrlTogger', e);
    this.page.showPopMenu(e, 'c');
  }
  operNodeTogger(e) {
    //console.log('operNodeTogger', e);
    this.page.showPopMenu(e, 'n');
  }
  tapNodeTogger(e) {
    console.log("tapNodeTogger", e);
    this.page.hideMenu();
    this.page.showMyMover(e);
  }
  locatedPNodeTogger(e) {
    if(!e.detail.ckey){
      helperServ.showToast({title:'ckey undefined'})
      return;
    }
    const ctrl = xcontainer.getCtrl(e.detail.ckey);
    const node = ctrl.getNode(e.detail.nodeindex);
    var pnode = ctrl.getNodeParent(node);
    if (!pnode) {
      pnode = ctrl.getCtrlParentNode();
      if(Array.isArray(pnode) && pnode.length>0){
        pnode = pnode[0];
      }
    }
    this.page.locatedNode(pnode);
  }
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopid: {
      type: "String",
      value: null
    },
    themaid: {
      type: "String",
      value: null
    }
  },
  //当前选择的组件索引
  curSelective: 0,
  /**
   * 组件的初始数据
   */
  data: {
    preview: false,
    sideshow: false,
    windowWidth: app.systemInfo.windowWidth,
    edit: true,
    sortable: false,
    //xdefine=[define,define,define,...]集合
    unitDefines: [],
    //define=[node,node,node,...]：需要显示的节点树集合
    defineNodes: null,
    //define：需要预览的节点树集合
    preDefineNodes: null
  },
  lifetimes: {
    created: function() {
      new tempCenter(this);
      new mytools(this);
      //cache style
      cache.fieldTemplateCache({
        temptype: 'css_style',
        category: null
      }).then(res => {});
    },
    ready: function() {
      this.userInfo = app.getMUser();
      if (!this.userInfo || !this.userInfo.shopinfo) {
        helperServ.showModal({
          content: "获取用户信息失败"
        });
        return;
      }
      if(!this.userInfo.basedir || !this.userInfo.basedir.trim()){
        helperServ.showModal({content:"请先注册登陆哦",success:(ok)=>{
          helperServ.goToPage("/pages/myCenter/myCenter",1);
          return;
        }})
        return;
      }
      if(this.data.shopid && this.data.shopid.trim()){
        this.loadByShopid(this.data.shopid);
      } else if(this.data.themaid && this.data.themaid.trim()) {
        this.loadByThemaid(this.data.themaid);
      } else if(this.userInfo.shopinfo.shopid){
        this.loadByShopid(this.userInfo.shopinfo.shopid);
      } else {
        this.createContainer();
      }
      pageServ.setWinHgh(this,0);
      this.myMover = this.selectComponent("#myMover");
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    loadByShopid:function(shopid){
      this.themaInfo = null;
      this.shopid = shopid;
      helperServ.showLoading();
      shopServ.getShopThema({
        shopid: shopid
      }).then(res => {
        helperServ.hideLoading();
        if (!res.result.data) {
          this.createContainer();
        } else {
          this.createContainer(res.result.data.thema);
        }
      }).catch(err => {
        helperServ.showModal({
          content: err.errMsg || err.message
        });
        helperServ.hideLoading();
      });
    },
    loadByThemaid:function(themaid){
      helperServ.showLoading();
      themaServ.getThemaDetail({
        themaid:themaid
      }).then(res => {
        helperServ.hideLoading();
        if (!res.result.data) {
          this.themaInfo = null;
          helperServ.showModal({
            content:res.result.errMsg
          })
          return;
        }
        this.themaInfo = res.result.data;
        this.createContainer(res.result.data.content);        
      }).catch(err => {
        helperServ.showModal({
          content: err.errMsg || err.message
        });
        helperServ.hideLoading();
      });
    },
    createContainer: function(thema) {
      thema = thema && thema[0];
      if (!thema) {
        xcontainer = utils.createContainer("view", this, {
          name: "布局",
          compflag: '999',
          package: "unitDefines",
          style: {
            /*
            width: app.getWinWidth() + "px",
            height: app.getWinHeight() + "px"*/
          }
        });
        xcontainer.create();
        xcompon.setContainer(xcontainer);
      } else {
        xcompon.loadThema(null, thema, 0, this, "unitDefines");
        xcontainer = xcompon.getContainer();
        xcontainer.create();
      }
    },
    /** 组件节点树选择事件 */
    tapTreeNode: function(e) {
      this.showPopMenu(e);
      //显示属性设置对话框
      //this.showNodePropertyDlg(xcontainer.getCtrl(e.detail.ckey).getNode(e.detail.nodeindex));
    },
    cancel: function(e) {
      var mySide = this.selectComponent("#mySideslip");
      mySide.hide();
      var myMenu = this.selectComponent('#myMenu');
      myMenu.hide();
      this.hideMyMover();
    },
    /**弹出 property 组件 */
    showNodePropertyDlg: function(node) {
      this.hideMenu();
      const myDlg = this.selectComponent('#nodeProperty');
      myDlg.showDlg({
        node: node,
        ctrl: xcontainer.getCtrl(node.CKEY),
        windowHeight: app.getWinHeight() / 2
      });
    },
    /**弹出 property 组件 */
    showCtrlPropertyDlg: function(ckey) {
      this.hideMenu();
      const myDlg = this.selectComponent('#ctrlProperty');
      myDlg.showDlg({
        ctrl: xcontainer.getCtrl(ckey),
        windowHeight: app.getWinHeight() / 2
      });
    },
    showLayoutDlg: function(e1) {
      this.hideMenu();
      this.myDlg = this.selectComponent('#ctrlCenter');
      this.myDlg.showDlg({
        title: '控件中心',
        poptype: 'layout', //《layout》组件
        myStyle: 'height:460px;',
        btntext: ['取消', '确认'],
        cloudPath: this.cloudPath,
        submit: (e, cb) => {
          try {
            if (e.btnindex == 1) {
              if (!e.inputlist || e.inputlist.length == 0) {
                cb();
                return
              } else {
                e.inputlist.forEach(v => {
                  /**
                   *v结构（参考layout.js）：
                    v: {
                      "unitid": subUnit.id,组件单元(分类)ID
                      "compid": ctrl.id 组件(控件)ID
                    }
                   */
                  var ctrl = utils.createComponent(v, this, {});
                  e1.pctrl.addComponent(ctrl, e1.targetNode);
                });
                console.log("***********unitDefines************", this.data.unitDefines);
                cb();
              }
            }
          } catch (err) {
            cb(err);
            helperServ.showModal({
              content: err.message || err.errMsg
            })
          }
        }
      });
    },
    showNodeTree: function(ckey) {
      if (typeof ckey === 'string') {
        this.setData({
          defineNodes: xcontainer.getCtrl(ckey).getDefines() || []
        });
      } else {
        if (Array.isArray(ckey)) {
          this.setData({
            defineNodes: ckey || []
          });
        } else {
          this.setData({
            defineNodes: [ckey] || []
          });
        }
      }
      this.hideMyMover();
      var mySide = this.selectComponent("#mySideslip");
      mySide.show();
      var myMenu = this.selectComponent('#myMenu');
      myMenu.hide();
    },
    showStyleSetDlg: function(ckey) {
      var ctrl = xcontainer.getCtrl(ckey);
    },
    showDelDlg: function(ckey) {
      xcontainer.getCtrl(ckey).destory();
    },
    moveDown: function(ckey) {
      xcontainer.getCtrl(ckey).moveDown(ckey);
    },
    /** 成员节点操作 */
    addChildNode: function(ckey) {
      xcontainer.getCtrl(ckey).addChildNode();
    },
    copyChildNode: function(ckey, nodeindex) {
      xcontainer.getCtrl(ckey).copyChildNode(nodeindex);
    },
    removeChildNode: function(ckey, nodeindex) {
      xcontainer.getCtrl(ckey).removeChildNode(nodeindex);
    },
    addComponent: function(ckey, targetNode) {
      this.showLayoutDlg({
        operflag: 'addCompon',
        targetNode: targetNode,
        pctrl: xcontainer.getCtrl(ckey)
      });
    },
    /* options: {
     *  x: 0
     *  y: 0
     * width: 1
     * height: 1
     * style: 'style'
     * title: 'view',
     * disabled: true,
     * scale: true,
     * scaleTogger: function { },
     * chgTogger: function { },
     * node:
     * }
     */
    /**根据node定位节点 */
    locatedNode: function(node) {
      var nodeTree = null,
        nodeindex = null,
        ctrl = xcontainer.getCtrl(node.CKEY);
      if (xcompon.isCtrlNode(node)) {
        console.log("*****locatedNode 当前节点是控件******", node);
        //获取控件父节点
        node = ctrl.getCtrlParentNode();
      }
      nodeTree = xcompon.getNodeTree(node);
      if (!nodeTree) {
        console.log("*****locatedNode 没有定位成功，重新定位******", node);
        const pNode = ctrl.getNodeParent(node);
        if (!pNode) {
          return;
        }
        nodeTree = xcompon.getNodeTree(pNode);
        if (!nodeTree) {
          console.log("*****locatedNode 没有定位成功，重新定位失败******", node);
          return;
        }
        nodeindex = node.nodeindex;
      }
      setTimeout(() => {
        nodeTree.getEleRect(nodeindex, (nodePosi => {
          this.myMover.show({
            pwidth: 0,
            pheight: 0,
            ptop: 0,
            x: nodePosi.left,
            y: nodePosi.top,
            width: nodePosi.width,
            height: nodePosi.height,
            style: '',
            title: node.name,
            disabled: false,
            scale: true,
            node: node,
            ctrl: ctrl,
            scaleTogger: (e) => {
              //console.log("*****showMyMover:scaleTogger******", e);
            },
            chgTogger: (e) => {
              //console.log("*****showMyMover:chgTogger******", e)
            }
          })
        }));
      }, 100)
    },
    showMyMover: function(e) {
      if (!e.detail.elepos || !e.detail.ckey || e.detail.nodeindex === undefined) {
        return;
      }
      const options = {
        ckey: e.detail.ckey,
        pckey: xcontainer.getCKEY(),
        nodeindex: e.detail.nodeindex,
        fromsrc: e.detail.fromsrc,
        elepos: e.detail.elepos, //节点位置
        pos: e.detail.pos //点击位置
      };
      const ctrl = xcontainer.getCtrl(options.ckey);
      if (!ctrl) {
        return;
      }
      if (xcompon.isContainer(ctrl)) {
        return;
      }
      var node = ctrl.getNode(options.nodeindex);
      if (!node) {
        return;
      }
      /*
      var rootNode = ctrl.getNodeRoot(node);
      if (rootNode.nodeindex === undefined) {
        console.warn(`*****showMyMover 获取到了根节点${rootNode.name} 的nodeindex未定义, getNodeRoot(${node.name}${options.nodeindex})=******`);
        rootNode.nodeindex = '0';
      }*/
      var ctrlPosi = {
        width: 0,
        height: 0,
        top: 0,
        left: 0
      };
      //const rootTree = xcompon.getNodeTree(rootNode);
      //rootTree.getEleRect(null, (ctrlPosi => {
      this.myMover.show({
        x: options.elepos.left,
        y: options.elepos.top,
        pwidth: ctrlPosi.width,
        pheight: ctrlPosi.height,
        ptop: ctrlPosi.top,
        pleft: ctrlPosi.left,
        width: options.elepos.width,
        height: options.elepos.height,
        style: '',
        title: node && ctrl.getNodeName(node),
        disabled: false,
        scale: true,
        node: node,
        ctrl: ctrl,
        scaleTogger: (e) => {
          ctrl.updNodeStyle(node, {
            width: options.elepos.width * e.detail.scale + 'px',
          }, true);
        },
        chgTogger: (e) => {
          return;
          ctrl.updNodeStyle(node, {
            left: e.detail.x + 'px',
            top: e.detail.y + 'px',
            position: 'fixed'
          }, true);
        },
        vTMTogger: (e) => {
          console.log("*****showMyMover:vTMTogger******", e)
        },
        hTMTogger: (e) => {
          console.log("*****showMyMover:hTMTogger******", e)
        }
      })
      //}));
    },
    hideMyMover: function() {
      this.myMover.hide();
    },
    hideMenu: function() {
      var myMenu = this.selectComponent('#myMenu');
      myMenu.hide();
      this.hideSides();
      //this.hideMyMover();
    },
    hideSides: function() {
      var mySide = this.selectComponent("#mySideslip");
      if (mySide.isShow()) {
        mySide.showSides(null);
      }
    },
    getMenuList: function(options) {
      const ckey = options.ckey,
        pckey = options.pckey,
        ctrl = xcontainer.getCtrl(ckey);
      var menulist = [];
      const end = [{
        "id": "preview",
        "text": this.data.preview ? "取消预览" : "预览",
        "togger": (e, menu) => {
          this.preView(pckey);
        },
      }, {
        "id": "cancel",
        "text": "取消",
        "togger": (e, menu) => {
          this.cancel();
        }
      }];

      if (!options.opertype || options.opertype === 'c') {
        if (ckey != pckey) {
          Array.prototype.push.apply(menulist, [{
              "id": "ctrlsetting",
              "text": "控件设置",
              "togger": (e, menu) => {
                this.showCtrlPropertyDlg(ckey);
              }
            }, {
              "id": "nodetrees",
              "text": "我的节点树",
              "togger": (e, menu) => {
                this.showNodeTree(ckey);
              }
            },
            /*
            注意：非容器控件(非xcontainer)中挂‘控件节点’(控件节点：特殊节点，含有define属性而没有children属性的节点)
            又挂‘普通节点’，这样混合着，在移动排序的时候可能有问题。
            */
            {
              "id": "addcomponent",
              "text": "添加新控件",
              "togger": (e, menu) => {
                this.addComponent(ckey);
              }
            },
            {
              "id": "siblingctrl",
              "text": "我的兄弟控件",
              "togger": (e, menu) => {
                this.showNodeTree(ctrl.getSiblingData());
              }
            }, {
              "id": "myparentctrl",
              "text": "我的父控件",
              "togger": (e, menu) => {
                this.showNodeTree(ctrl.getParentData());
              }
            }, {
              "id": "copyChildNode",
              "text": "复制粘贴成员",
              "togger": (e, menu) => {
                //this.addChildrenNode(ckey);
                this.copyChildNode(ckey, options.nodeindex);
              }
            }, {
              "id": "removeChildNode",
              "text": "删除成员",
              "togger": (e, menu) => {
                //this.addChildren(ckey);
                this.removeChildNode(ckey, options.nodeindex);
              }
            }, {
              "id": "movedown",
              "text": "下移控件",
              "togger": (e, menu) => {
                this.moveDown(ckey);
              }
            }, {
              "id": "del",
              "text": "删除当前控件",
              "togger": (e, menu) => {
                this.showDelDlg(ckey);
              }
            }
          ]);
        }
        if (options.fromsrc !== 'tree') {
          Array.prototype.push.apply(menulist, [{
            "id": "addlayout",
            "text": "布局",
            "togger": (e, menu) => {
              this.addComponent(pckey);
            }
          }, {
            "id": "savelayout",
            "text": "保存布局",
            "togger": (e, menu) => {
              this.saveLayout(pckey);
            },
          }]);
        }
      }
      if (!options.opertype || options.opertype === 'n') {
        //控件成员
        const node = ctrl.getNode(options.nodeindex);
        if (!node) {
          helperServ.showModal({
            content: 'node[' + options.nodeindex + ']未定义'
          });
          return;
        }
        if (options.fromsrc === 'tree') {
          Array.prototype.push.apply(menulist, [{
            "id": "locatecurrnode",
            "text": "定位" + node.name,
            "togger": (e, menu) => {
              this.hideSides();
              setTimeout(() => {
                this.locatedNode(node);
              }, 800);
            }
          }]);
        }
        Array.prototype.push.apply(menulist, [{
          "id": "editnodepro",
          "text": "编辑" + node.name,
          "togger": (e, menu) => {
            this.showNodePropertyDlg(node);
          }
        }, {
          "id": "movedown",
          "text": "添加新节点",
          "togger": (e, menu) => {
            this.addComponent(ckey, node);
          }
        }, {
          "id": "delnode",
          "text": "删除" + node.name,
          "togger": (e, menu) => {
            ctrl.removeNode(node);
            //removeChildNode 是删除成员，而不是节点。
            //xcontainer.getCtrl(ckey).removeChildNode(node);
          }
        }, {
          "id": "parentnode",
          "text": "定位" + node.name + "父节点",
          "togger": (e, menu) => {
            var pnode = ctrl.getNodeParent(node);
            if (!pnode) {
              pnode = ctrl.getCtrlParentNode();
            }
            this.locatedNode(pnode);
          }
        }, {
          "id": "sibling",
          "text": node.name + "兄弟",
          "togger": (e, menu) => {
            this.showNodeTree(ctrl.getNodeSibling(node));
          }
        }, {
          "id": "childrennode",
          "text": node.name + "子节点",
          "togger": (e, menu) => {
            this.showNodeTree(ctrl.getNodeChildren(node));
          }
        }, {
          "id": "delnode",
          "text": "下移" + node.name,
          "togger": (e, menu) => {
            ctrl.moveDownNode(node);
            //removeChildNode 是删除成员，而不是节点。
            //xcontainer.getCtrl(ckey).removeChildNode(node);
          }
        }]);
      }
      Array.prototype.push.apply(menulist, end);
      return menulist;
    },
    /**
     * {
     * pos, nodeindex, ckey, pckey
     * }
     */
    _showMenu: function(options) {
      var x = 0,
        y = 0,
        pos = options.pos,
        ctrl = xcontainer.getCtrl(options.ckey);
      if (!ctrl) {
        console.warn("******_showMenu ctrl is null**********", options);
        return;
      }
      var myMenu = this.selectComponent('#myMenu');
      myMenu.setMenu(this.getMenuList(options));
      x = pos.left - myMenu.getWidth(), y = pos.bottom + pos.scrollTop;
      const menuH = myMenu.getHeight();
      if (app.getWinHeight() - pos.bottom < menuH) {
        //如果当前坐标+弹出菜单高度大于剩余可视，那么往上弹
        y -= menuH;
        if (pos.bottom < menuH) {
          y += menuH - pos.bottom;
        }
      }
      if (pos.left < myMenu.getWidth()) {
        x += (myMenu.getWidth() - pos.left);
      }
      // console.log("viewPort", viewPort, pos.bottom, viewPort - pos.bottom, app.systemInfo.windowHeight);
      myMenu.show({
        title: options.opertype === 'c' ? ctrl.compname : ctrl.getNode(options.nodeindex).name,
        ctype: 'cover',
        mask: 'none',
        maxWidth: 180,
        posi: {
          left: x,
          top: y
        },
        myStyle: '',
        className: 'menu-dialog'
      });
    },
    showPopMenu: function(e, opertype) {
      const options = {
        ckey: e.detail.ckey,
        pckey: xcontainer.getCKEY(),
        nodeindex: e.detail.nodeindex,
        opertype: opertype || '',
        fromsrc: e.detail.fromsrc,
        elepos: e.detail.elepos,
        pos: e.detail.pos
      };
      console.log("*******showMenu*********", options);
      if (options.fromsrc !== 'tree') {
        this.hideSides();
      }
      if (!options.ckey) {
        options.ckey = options.pckey;
        options.pos = {
          left: e.touches[e.touches.length - 1].clientX,
          bottom: e.touches[e.touches.length - 1].clientY,
          scrollTop: 0
        }
        this._showMenu(options);
      } else {
        this._showMenu(options);
        return;
      }
    },
    preView: function(ckey) {
      if (this.data.preview) {
        this.setData({
          preview: !this.data.preview
        });
        return;
      }
      var ctrl = xcontainer;
      if (ckey) {
        ctrl = xcontainer.getCtrl(ckey);
      }
      var nodes = ctrl.toNodes();
      console.log("*****************preView toNodes*****************", nodes);
      this.setData({
        preview: !this.data.preview,
        preDefineNodes: nodes
      });
    },
    showSaveLayoutDlg(e){
      var myDlg = this.selectComponent('#myMenu');
      myDlg.hide();
      var catetypes = helperServ.getStorageSync("CACHE_CATEGORY_KEY2").map(v=>{return {code:v.code,name:v.name}});
      myDlg = this.selectComponent('#ctrlCenter');
      myDlg.showDlg({
        title: '请输入相关信息',
        cache: true,
        poptype:"snake",
        cloudPath:this.userInfo.basedir+"thema/",
        inputlist: [{
            "id": "name",
            "name": "主题名称",
            "type": "0",
            "required": "R",
            "length": 20,
            "label": true,
            "value":this.themaInfo.name||"",
            "placeholder": '主题名称'
          },
          {
            "id": "catetype",
            "name": "适用行业",
            "type": "m",
            "required": "O",
            "length": 10,
            "checktype": '1',
            /**多选*/
            "label": true,
            "value":this.themaInfo.catetype||null,
            "checkbox": catetypes,
            "placeholder": '请选择以下一种或多种行业'
          },
          {
            "id": "feetype",
            "name": "是否收费",
            "type": "s",
            "required": "O",
            "length": 20,
            "label": true,
            "value":this.themaInfo.feetype||null,
            "placeholder": ''
          },
          {
            "id": "price",
            "name": "价格",
            "type": "1",
            "required": "C",
            "condition":"feetype==1",
            "length": 30,
            "label": true,
            "value":this.themaInfo.price||"",
            "placeholder": '请输入价格'
          },
          {
           "label": true,
           "id": "picpath",
           "name": "封面",
           "type": "b",
           "required": "R",
           "value":this.themaInfo.picpath||null,
           "placeholder": '请选择一张封面图'
         },{
          "label": false,
          "id": "summary",
          "name": "备注",
          "type": "9",
          "required": "O",
          "placeholder": '请输入备注',
          "value":this.themaInfo.summary||"",
          "length": 500.0
          }
        ],
        btntext: ['取消','确认'],
        submit: (e, cb) => {
          try {
            helperServ.showLoading({content:"正在上传图片..."})
            myDlg.upLoadFile((err,res)=>{
              helperServ.hideLoading();
              if (err) {      
                cb(err, null);
                return;
              }
              var themainfo = {};
              for (var k in e.inputlist) {
                themainfo[k] = e.inputlist[k].value;
              }
              if(this.themaInfo){
                themainfo._id=this.themaInfo._id;
              }
              this._saveLayout(themainfo);
              cb();
            });
          } catch (err) {
            cb(err);
            helperServ.showModal({
              content: err.message || err.errMsg
            })
          }
        }
      });
    },
    saveLayout:function(e){
      if(this.themaInfo){
        this.showSaveLayoutDlg(e);
      } else {
        this.saveToShopThema(e);
      }
    },
    saveToShopThema(e){
      var content = xcontainer.getLayout();
      helperServ.showLoading({
        title: "保存中..."
      });
      shopServ.addShopThema({
          shopid: this.shopid,
          thema: content
      }).then(res => {
        helperServ.hideLoading();
        if (res.result.success) {
          helperServ.showToast({
            title: res.result.errMsg,
            icon: 'none'
          });
        } else {
          helperServ.showModal({
            title: res.result.errMsg || res.errMsg
          });
        }
      }).catch(err => {
        helperServ.hideLoading();
        helperServ.showModal({
          content: err.errMsg || err.message
        });
        return;
      });
    },
    _saveLayout: function(themainfo) {
      themainfo.content = xcontainer.getLayout();
      helperServ.showLoading({
        title: "保存中..."
      });
      //shopServ.addShopThema
      themaServ.addThema({
        thema:themainfo
      }).then(res => {
        helperServ.hideLoading();
        if (res.result.success) {
          helperServ.showToast({
            title: res.result.errMsg,
            icon: 'none'
          });
        } else {
          helperServ.showModal({
            title: res.result.errMsg || res.errMsg
          });
        }
      }).catch(err => {
        helperServ.hideLoading();
        helperServ.showModal({
          content: err.errMsg || err.message
        });
        return;
      });
      //var nodes = xcontainer.toNodes();
      //console.log("*****************saveLayout toNodes*****************", nodes);
    },
    showMenu2: function(e) {
      var myFloatBtn = this.selectComponent("#" + e.currentTarget.id);
      myFloatBtn.getEleRect((pos) => {
        var menulist = [{
            "id": "preview",
            "text": this.data.preview ? "取消预览" : "预览",
            "togger": (e, menu) => {
              this.preView(null);
            },
          },
          {
            "id": "del",
            "text": "保存布局",
            "togger": (e, menu) => {
              this.saveLayout();
            },
          },
          {
            "id": "cancel",
            "text": "取消",
            "togger": (e, menu) => {}
          }
        ];
        if (!this.data.preview) {
          menulist.splice(0, 0, {
            "id": "addcomponent",
            "text": "添加控件",
            "togger": (e, menu) => {
              this.addComponent(xcontainer.getCKEY());
            }
          });
        }
        pageServ.showMenu(this, {
          title: '',
          menuid: '#myMenu',
          menulist: menulist,
          pos: pos,
          yoffset: 0 - pos.height,
          xoffset: 0,
          ctype: "view"
        });
      }, null); //end getRect callback
    },
    floatBtnTogger: function(e) {
      this.showMenu2(e);
    },
    previewNodeTogger: function(e) {
      helperServ.goToPage(e.detail.data.url);
    }
  }
})
/**
 * 
 *     
 * 
 */
/*
  点击位置获取
  if (e.touches && e.touches.length > 0) {
    x = e.touches[e.touches.length - 1].clientX;
    y = e.touches[e.touches.length - 1].clientY;
    console.log("touches", e.touches);
  } else {
    x = e.currentTarget.offsetLeft;
    y = e.detail.y;
  }
  if (index > 2 && index == this.data.shoptheme.length - 1) {
    y -= 200;
  }*/