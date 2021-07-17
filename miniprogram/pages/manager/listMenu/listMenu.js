const menuServ = require('../../../lib/manager/menu.js');
const helperServ = require("../../../lib/utils/helper.js");
const userServ = require('../../../lib/manager/user.js');
const roleServ = require('../../../lib/manager/role.js');
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menu: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.frompage = options.frompage;
    if (this.frompage == "listUser") {
      this.actionFunc = userServ.addUserMenu;
      this.actionFunc2 = userServ.getUserMenu;
    } else if (this.frompage == "listRole") {
      this.actionFunc = roleServ.addRoleMenu;
      this.actionFunc2 = roleServ.getRoleMenu;
    }
    this.userid = options.userid ? options.userid : null;
    this.roleid = options.roleid ? options.roleid : null;
    this.shopid = options.shopid;
    cache.getDict(["100012", "100013"], (err, res) => {
      this.setData({
        dict: res
      })
    });
    var data = {};
    data['avatarurl'] = options.avatarurl ? decodeURIComponent(options.avatarurl) : '';
    data['username'] = options.username ? decodeURIComponent(options.username) : '';
    data['phone'] = options.phone ? decodeURIComponent(options.phone) : '';
    this.setData(data);
    helperServ.showLoading({
      title: '模块加载中...'
    })
    menuServ.listMenu({}).then(res => {
      if (res.result.data) {
        if (this.frompage != 'listRole') {
          helperServ.hideLoading();
          this.setData({
            menu: res.result.data
          });
          return;
        }
        this.actionFunc2({
          userid: this.userid,
          roleid: this.roleid,
          shopid: this.shopid
        }).then(res2 => {
          helperServ.hideLoading();
          if (!res2.result.menus) {
            helperServ.hideLoading();
            helperServ.showModal({
              content: res2.result.errMsg || '未知错误'
            });
            return;
          }
          /**
           * 100：{
           *  id:100,
           *  name:'父'
           *  children:{
           *    100000:{
           *       id:100000
           *       name:'子'           *       
           *    }
           *  }
           * }
           */
          res.result.data.forEach((v, i) => {
            var c_m = res2.result.menus[v.id];
            if (!c_m || c_m.length == 0) {
              return;
            }
            v.children.forEach(cv => {
              if (c_m.children[cv.id]) {
                cv.active = true;
                cv.status = '1';
              }
            })
          });
          this.setData({
            menu: res.result.data
          })
        }).catch(err => {
          helperServ.hideLoading();
          helperServ.showModal({
            content: err.errMsg || err.message || '未知错误'
          });
        });
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message || '未知错误'
      });
    })
  },
  reloadMenu: function() {
    menuServ.listMenu({}).then(res => {
      if (res.result.data) {
        helperServ.hideLoading();
        this.setData({
          menu: res.result.data
        });
      } else {
        helperServ.showModal({
          content: res.result.errMsg || '未知错误'
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  selectAction: function(e) {
    var idx = e.currentTarget.dataset.index,
      cidx = e.currentTarget.dataset.cindex,
      data = {};
    var c = this.data.menu[idx].children[cidx];
    if(!c){
      return;
    }
    if (c.active && (c.status == '1' || !c.status)) {
      c.status = '0'
    } else if (c.active && c.status == '0') {
      c.status = null;
      c.active = false;
    } else if (!c.active) {
      c.active = true;
      c.status = '1';
    }
    data[`menu[${idx}].children[${cidx}].active`] = c.active;
    data[`menu[${idx}].children[${cidx}].status`] = c.status;
    this.setData(data);
  },
  selectAll: function(e) {
    var idx = e.currentTarget.dataset.index,
      data = {};
    this.data.menu[idx].children.forEach(v => {
      if (!v){
        return;
      }
      v.active = !this.data.menu[idx].active;
      if (v.active) {
        v.status = '1'
      } else {
        v.status = null;
      };
    });
    data[`menu[${idx}].active`] = !this.data.menu[idx].active;
    data[`menu[${idx}].children`] = this.data.menu[idx].children;
    this.setData(data);
  },
  saveSelect: function(e) {
    var idx = e.currentTarget.dataset.index;
    helperServ.showLoading();
    var menu = {},
      req = null;
    this.data.menu.forEach((v) => {
      v.children.forEach(cv => {        
        if (!cv || !cv.active || cv.status != '1') {
          return;
        }
        if (menu[v.id]) {
          menu[v.id].children[cv.id] = cv;
        } else {
          menu[v.id] = {
            id: v.id,
            name: v.name,
            icon: v.icon,
            level: v.level,
            params: v.params,
            seq: v.seq,
            url: v.url,
            status: '1',
            children: {}
          };
          menu[v.id].children[cv.id] = {};
          menu[v.id].children[cv.id] = {
            id: cv.id,
            name: cv.name,
            icon: cv.icon,
            level: cv.level,
            params: cv.params,
            seq: cv.seq,
            status: '1',
            url: cv.url
          };
        }
      });
    });
    req = {
      menus: menu,
      shopid: this.shopid
    }
    if (this.frompage == 'listRole') {
      req.roleid = this.roleid;
    } else {
      req.userid = this.userid;
    }
    this.actionFunc(req).then(res => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      });
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message || '未知'
      });
    })
  },
  delMenuTogger: function(e) {
    this.delMenu(null, this.data.menu[e.currentTarget.dataset.index], () => {});
  },
  delMenu: function(v, pmenu, cb) {
    if (!v && !pmenu) {
      cb('e');
      helperServ.showModal({
        content: '未选择菜单'
      });
      return;
    }
    helperServ.showModal({
      content: `请确认是否删除【${v?v.name.value:pmenu.name}】`,
      success: (res) => {
        if (res.confirm) {
          menuServ.delMenu({
            menu: {
              id: v ? v.id.value : pmenu.id,
              parentid: pmenu ? pmenu.id : null,
              level: v ? v.level.value : pmenu.level || 1
            }
          }).then(res => {
            helperServ.showModal({
              content: res.result.errMsg
            });
            res.result.success == 1 ? this.reloadMenu() : null;
            cb(res.result.success == 1 ? null : res);
          }).catch(err => {
            cb(err);
            helperServ.showModal({
              content: err.errMsg || err.message || '未知'
            });
          })
        }
      }
    });
  },
  updMenu: function(v, pmenu, cb) {
    var menu = {
      parentid: pmenu ? pmenu.id : null,
      originid: v.originid.value,
      id: v.id.value,
      name: v.name.value,
      icon: v.icon.value,
      level: v.level.value,
      params: v.params.value,
      seq: 0,
      url: v.url.value,
      status: v.status.value,
      summary: v.summary.value
    };
    menuServ.modMenu({
      menu: menu
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      res.result.success == 1 ? this.reloadMenu() : null;
      cb(res.result.success == 1 ? null : res);
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message || '未知'
      });
    })

  },
  addMenu: function(v, pmenu, cb) {
    var menu = {
      parentid: pmenu ? pmenu.id : null,
      id: v.id.value,
      name: v.name.value,
      icon: v.icon.value,
      level: v.level.value,
      params: v.params.value,
      seq: 0,
      url: v.url.value,
      status: v.status.value,
      summary: v.summary.value
    };
    if (v.level.value == 1) {
      menu.children = [];
    }
    menuServ.addMenu({
      menu: menu
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      res.result.success == 1 ? this.reloadMenu() : null;
      cb(res.result.success == 1 ? null : res);
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message || '未知'
      });
    })
  },
  showModDlg: function(e) {
    var idx = e.currentTarget.dataset.index,
      cidx = e.currentTarget.dataset.cindex,
      data = {};
    if (!cidx && cidx !== 0) {
      this.data.menu[idx].level = 1;
      this.data.menu[idx].status = '1';
      this.showAddMenuDlg(e, this.data.menu[idx], "修改菜单", null);
    } else {
      var c = this.data.menu[idx].children[cidx];
      if(!c){
        c = {};
        c.id = this.data.menu[idx].id + mySeq.prefixZero(cidx, 3);
        c.level = '2';
        c.status = '1';
      }
      this.showAddMenuDlg(e, c, "修改子菜单", this.data.menu[idx]);
    }
  },
  showAddCMenuDlg: function(e) {
    var idx = e.currentTarget.dataset.index,
      pmenu = this.data.menu[idx], submenuid=0;
    if (pmenu.children && pmenu.children.length > 0){
      if (!pmenu.children[pmenu.children.length - 1]){
        submenuid = pmenu.id +mySeq.prefixZero(pmenu.children.length,3);
      } else {
        submenuid = pmenu.id+mySeq.prefixZero(parseInt(pmenu.children[pmenu.children.length-1].id) + 1,3);
      }
    } else {
      submenuid = pmenu.id +"000";
    }
     
    this.showAddMenuDlg(e, null, "新增子菜单", pmenu,submenuid);
  },
  showAddMenuDlg: function (e, menu, title, pmenu, menuid) {
    var self = this;
    this.myDlg = this.selectComponent('#modalDlg');
    if (!menu && !title && !pmenu && !menuid){
      menuid = mySeq.prefixZero(parseInt(this.data.menu[this.data.menu.length-1].id)+1,3);
    }
    this.myDlg.showDlg({
      title: title ? title : '新增菜单',
      inputlist: {
        "parentid": {
          "id": "parentid",
          "name": "父菜单ID",
          "hidden": true,
          "type": "i", //信息提示
          "required": pmenu ? "R" : null,
          "value": pmenu ? pmenu.id : null
        },
        "originid": {
          "id": "originid",
          "name": "原菜单ID",
          "hidden": true,
          "type": "i", //信息提示
          "required": menu ? "R" : null,
          "value": menu ? menu.id : null
        },
        "id": {
          "id": "id",
          "name": "菜单ID",
          "type": "1", //信息提示
          "required": "R",
          "label": true,
          "value": menu ? menu.id : menuid
        },
        "name": {
          "id": "name",
          "name": "菜单名称",
          "label": true,
          "type": "0",
          "required": "R",
          "value": menu ? menu.name : null
        },
        "level": {
          "id": "level",
          "disabled": pmenu ? true : false,
          "name": "级别",
          "label": true,
          "type": "3",
          "required": "R",
          "dictlist": [{
            code: 1,
            name: "父菜单"
          }, {
            code: 2,
            name: '子菜单'
          }],
          "value": menu ? menu.level : (pmenu ? 2 : 1)
        },
        "url": {
          "id": "url",
          "name": "页面",
          "label": true,
          "type": "0",
          "required": "R",
          "value": menu ? menu.url : null
        },
        "params": {
          "id": "params",
          "name": "页面参数",
          "label": true,
          "type": "0",
          "required": "O",
          "value": menu ? menu.params : null
        },
        "icon": {
          "id": "icon",
          "name": "图标",
          "label": true,
          "type": "0",
          "required": "O",
          "value": menu && menu.icon ? menu.icon : 'icon-checkdevice'
        },
        "status": {
          "id": "status",
          "name": "状态",
          "label": true,
          "type": "3",
          "required": "O",
          "dictlist": this.data.dict["100012"],
          "value": menu ? menu.status : 1
        },
        "summary": {
          "id": "summary",
          "name": "备注",
          "type": "9",
          "required": "O",
          "length": 200,
          "label": false,
          "value": menu ? menu.summary : null,
          "placeholder": '备注'
        }
      },
      btntext: [menu ? '删除' : '取消', '确认'],
      submit: (e, cb) => {
        if (!menu && e.btnindex === 0) {
          cb();
          wx.hideToast();
          return;
        }
        if (!e.inputlist) {
          cb('e');
          return;
        }
        try {
          if (e.btnindex == 1) {
            if (menu) {
              self.updMenu(e.inputlist, pmenu, cb);
            } else {
              self.addMenu(e.inputlist, pmenu, cb);
            }
          } else {
            self.delMenu(e.inputlist, pmenu, cb);
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
  showMenu: function(e) {
    var self = this;
    var index = e.currentTarget.dataset.index,
      cidx = e.currentTarget.dataset.cindex;
    //console.log('showMenu',e);
    var myDlg = this.selectComponent('#menuDlg');
    myDlg.showDlg({
      title: '操作菜单',
      mask: 'none',
      posi: {
        left: `left:${e.currentTarget.offsetLeft}px`,
        top: `top:${50 + e.currentTarget.offsetTop}px`
      },
      className: 'menu-dialog',
      poptype: "menu",
      inputlist: [{
          "id": "mod",
          "text": "修改",
          "togger": (e, menu) => {
            self.showModDlg(e);
          }
        },
        {
          "id": "role",
          "text": "删除",
          "togger": (e, menu) => {
            self.delMenu(e);
          },
        },
        {
          "id": "cancel",
          "text": "取消",
          "togger": (e, menu) => {}
        }
      ]
    });
  },
})