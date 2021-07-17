const helperServ = require("../../../lib/utils/helper.js");
const commServ = require('../../../lib/manager/comm.js');
const userServ = require('../../../lib/manager/user.js');
const roleServ = require('../../../lib/manager/role.js');
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  userid: null,
  shopid: null,
  copy: [],
  data: {
    frompage: null,
    currtab: 0,
    loadFinish: false,
    role: null
  },

  getRoleId: function() {
    return mySeq.S4() + mySeq.S4();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    cache.getDict(["100012"], (err, res) => {
      this.setData({
        dict: res,
        currtab: options.frompage == 'listUser' ? 1 : 0
      })
    });
    var data = {};
    data['frompage'] = options.frompage;
    this.userid = options.userid ? options.userid : null;
    this.shopid = options.shopid || app.getMUser().shopinfo.shopid;
    if (options.frompage == 'listUser') {
      data['loadFinish'] = true;
      data['avatarurl'] = decodeURIComponent(options.avatarurl);
      data['username'] = decodeURIComponent(options.username);
      data['phone'] = decodeURIComponent(options.phone);
      roleServ.listRole({ shopid: this.shopid}).then(res => {
        if (!res.result.data) {
          helperServ.showModal({
            content: res.result.errMsg
          });
          return;
        }
        if (res.result.data.length == 0) {
          data[`role[0]`] = [];
          data[`role[1]`] = [];
          this.setData(data);
          return;
        }
        userServ.getUserRole({
          userid: options.userid,
          shopid: options.shopid
        }).then(res2 => {
          if (!res2.result.data || res2.result.data.length == 0) {
            if (!res2.result.data) {
              helperServ.showModal({
                content: res2.result.errMsg
              });
            }
            this.copy = res.result.data;
            data['role[0]'] = res.result.data;
            data['role[1]'] = res.result.data.map(v => {
              if (v.status == '0') {
                //如果角色已经停了，那灰
                v.style = "background-color:#ccc";
                v.disabled = true;
              }
              console.log('map*******', v)
              return Object.assign({}, v);
            });
            this.setData(data);
            return;
          }
          var copy = [];
          res.result.data.forEach(v => {
            copy.push(Object.assign({}, v, {
              active: v.status == '0' ? true : false
            }));
            if (v.status == '0') {
              v.style = "background-color:#ccc";
              v.disabled = true;
            }
            if (res2.result.data[0].roles[v.roleid]) {
              v.active = true;
              v.status = res2.result.data[0].roles[v.roleid].status;
            }
          });

          data['role[0]'] = copy; //角色维护
          data['role[1]'] = res.result.data; //我的角色
          this.copy = copy;
          this.setData(data);
        }).catch(err => {
          data['loadFinish'] = true;
          this.setData(data);
          helperServ.showModal({
            content: err.errMsg || err.message || '未知错误'
          });
        });
      }).catch(err => {
        data['loadFinish'] = true;
        this.setData(data);
        helperServ.showModal({
          content: res.errMsg || res.message || '未知错误'
        });
      });
    } else {
      roleServ.listRole({shopid:this.shopid}).then(res => {
        data['loadFinish'] = true;
        if (!res.result.data) {
          helperServ.showModal({
            content: res.result.errMsg
          });
          data['role[0]'] = [];
          this.setData(data);
          return;
        }
        data['role[0]'] = res.result.data;
        res.result.data.forEach(v => this.copy.push(v));
        this.setData(data);
      }).catch(err => {
        data['loadFinish'] = true;
        this.setData(data);
        helperServ.showModal({
          content: err.errMsg || err.message || '未知错误'
        });
      });
    }
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
      data = {};
    if (this.data.currtab != 1) {
      this.data.role[this.data.currtab].forEach((v, i) => {
        if (i != idx) {
          v.active = false;
        }
      });
    }
    var c = this.data.role[this.data.currtab][idx];
    if (c.active && (c.status == '1' || !c.status)) {
      c.status = '0'
    } else if (c.active && c.status == '0') {
      c.status = null;
      c.active = false;
    } else if (!c.active) {
      c.active = true;
      c.status = '1';
    }
    if (this.data.currtab != 1) {
      data[`role[${this.data.currtab}]`] = this.data.role[this.data.currtab];
      console.log(`*********`, this.copy, this.data.role[this.data.currtab])
    } else {
      data[`role[${this.data.currtab}][${idx}].active`] = c.active;
      data[`role[${this.data.currtab}][${idx}].status`] = c.status;
    }
    this.setData(data);
    //仅仅角色维护页面使用：currEditSelective
    if (this.data.currtab == 1) {
      return;
    }
    this.currEditSelective = c;
  },
  selectAll: function(e) {
    var data = {};
    this.data.role[this.data.currtab].forEach(v => {
      v.active = !v.active;
      if (v.active) {
        v.status = '1'
      } else {
        v.status = null;
      };
    });
    data[`role[${this.data.currtab}]`] = this.data.role[this.data.currtab];
    this.setData(data);
  },
  initSelective: function(tid) {
    //console.log(`1 initselective${tid}`, this.copy, this.data.role[0]);
    var data = {};
    if (tid != 1) {
      //console.log(`2 initselective${tid}`, this.copy, this.data.role[0]);
      data[`role[0]`] = JSON.parse(JSON.stringify(this.copy));
      this.setData(data);
    } else {

    }
  },
  tabTogger: function(e) {
    var tabid = parseInt(e.currentTarget.dataset.tabid);
    this.initSelective(tabid);
    this.setData({
      currtab: tabid
    });

  },
  delTogger: function(e) {
    if (!this.currEditSelective) {
      helperServ.showModal({
        content: "请选择需要删除的角色"
      })
      return;
    }
    helperServ.showModal({
      content: `请确认是否删除【${this.currEditSelective.rolename}】`,
      success: (res) => {
        if (res.confirm) {
          helperServ.showLoading();
          roleServ.delRole({
            roleid: this.currEditSelective.roleid,
            shopid: this.currEditSelective.shopid
          }).then(res => {
            helperServ.hideLoading();
            helperServ.showModal({
              content: res.result.errMsg
            });
            if (res.result.success == 1) {
              var j = -1;
              this.copy.find((v, i) => {
                if (v.roleid == res.result.roleid) {
                  j = i;
                }
              });
              if(j >=0){
                this.copy.splice(j,1);
                //data[`role[${this.data.currtab}]`] = this.copy;
              }
              var data = {};
              for (var i = 0; i < this.data.role.length; i++) {
                this.data.role[i].find((v, i) => {
                  if (v.roleid == res.result.roleid) {
                    j = i;
                  }
                });
                if (j >= 0) {
                  this.data.role[i].splice(j, 1);
                  data[`role[${i}]`] = this.data.role[i];
                }
              }             
              this.setData(data);
            }
          }).catch(err => {
            helperServ.hideLoading();
            helperServ.showModal({
              content: err.errMsg || err.message || '未知错误'
            });
          })
        } else {

        }
      }
    })
  },
  addRole: function(inputlist, cb) {
    var role = {
      roleid: inputlist.roleid.value,
      shopid: this.shopid,
      rolename: inputlist.rolename.value,
      summary: inputlist.summary.value,
      status: inputlist.status.value
    };
    roleServ.addRole(Object.assign({}, role)).then(res => {
      if (res.result.success == 1) {
        for (var i = 0; i < this.data.role.length; i++) {
          this.data.role[i].unshift(Object.assign({}, role));
        }
        this.copy.unshift(Object.assign({}, role));
        var data = {};
        this.setData({
          role: this.data.role
        });
        this.addTogger(null, role, '新增成功*请设置权限*');
        //cb(null,null);   
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
        cb(res.result.errMsg);
      }
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message || '未知错误'
      });
      cb(err, null);
    });
  },
  updRole: function(inputlist, cb) {
    var role = {
      roleid: inputlist.roleid.value,
      shopid: this.shopid,
      rolename: inputlist.rolename.value,
      summary: inputlist.summary.value,
      status: inputlist.status.value
    };
    roleServ.updRole(Object.assign({}, role)).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      if (res.result.success == 1) {
        var data = {},
          j = 0;
        for (var i = 0; i < this.data.role.length; i++) {
          var target = this.data.role[i].find((v, i) => {
            if (v.roleid == role.roleid) {
              j = i;
              return true;
            }
          });
          if (target) {
            Object.assign(target, role);
            if (i === 1) {
              if (role.status == '0') {
                target.style = "background-color:#ccc";
                target.disabled = true;
              } else {
                target.style = null;
                target.disabled = false;
              }
              data[`role[${i}][${j}]`] = target;
            }
          }
        }
        var tmp = this.copy.find((v, i) => {
          if (v.roleid == role.roleid) {
            j = i;
            return true;
          }
        });
        if (tmp) {
          Object.assign(tmp, role);
          //this.copy[j]=tmp;
          //console.log(`****`,tmp,role,this.copy);
        }
        data[`role[0]`] = JSON.parse(JSON.stringify(this.copy));
        //data[`role[0]`] =this.copy.map(v=>Object.assign({},v));
        this.setData(data);
      }
      cb(null, null);
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message || '未知错误'
      });
      cb(err, null);
    });
  },
  modTogger: function(e) {
    if (!this.currEditSelective) {
      helperServ.showModal({
        content: "请选择需要修改的角色"
      })
      return;
    }
    this.addTogger(e, this.currEditSelective, '角色修改');
  },
  addTogger: function(e, roleinfo, title) {
    var self = this,
      roleid = roleinfo ? roleinfo.roleid : this.getRoleId(),
      rolename = roleinfo ? roleinfo.rolename : null;
    this.myDlg = this.selectComponent('#modalDlg');
    this.myDlg.showDlg({
      title: title ? title : '新增角色',
      inputlist: {
        "roleid": {
          "id": "roleid",
          "name": "角色ID",
          "type": "0",
          "required": "R",
          "label": true,
          "disabled": true,
          "value": roleid
        },
        "rolename": {
          "id": "rolename",
          "name": "角色名称",
          "label": true,
          "type": "0", //选择框
          "required": "R",
          "placeholder": '请角色中文名称',
          "value": rolename
        },
        "rights": {
          "id": "rights",
          "name": "链接信息",
          "label": false,
          "type": "l",
          "required": "O",
          "hidden": roleinfo ? false : true,
          "link": {
            "type": "navigator",
            "items": [{
              "params": `frompage=listRole&roleid=${roleid}&shopid=${this.shopid}&avatarurl=&username=${rolename || '角色菜单'}`,
              "url": "/pages/manager/listMenu/listMenu",
              "name": "菜单设置"
            },{
              "params": `frompage=listRole&roleid=${roleid}&shopid=${this.shopid}&avatarurl=&username=${rolename||'角色权限'}`,
              "url": "/pages/manager/listAction/listAction",
              "name": "权限设置"
            }, {
                "params": `frompage=listRole&roleid=${roleid}&shopid=${this.shopid}&avatarurl=&username=${rolename || '角色用户'}`,
                "url": "/pages/manager/listRoleUser/listRoleUser",
                "name": "角色用户"
              }]
          }
        },
        "status": {
          "id": "status",
          "name": "状态",
          "label": true,
          "type": "3", //选择框
          "required": "R",
          "dictlist": this.data.dict["100012"],
          "value": roleinfo ? roleinfo.status : '1'
        },
        "summary": {
          "id": "summary",
          "name": "备注",
          "type": "9",
          "required": "O",
          "length": 200,
          "label": true,
          "value": roleinfo ? roleinfo.summary : null,
          "placeholder": '角色备注信息'
        }
      },
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        if (e.btnindex === 0) {
          cb();
          wx.hideToast();
          return;
        }
        if (!e.inputlist) {
          cb('e');
          return;
        }   
        try {
          if (roleinfo) {
            self.updRole(e.inputlist, cb);
          } else {
            self.addRole(e.inputlist, cb);
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

  //保存（frompage == listUser）
  saveTogger: function(e) {
    if (this.data.frompage != 'listUser') {
      helperServ.showModal({
        content: '请联系系统管理员'
      });
      return;
    }
    helperServ.showLoading();
    var roles = {};
    this.data.role[1].forEach((v) => {
      if (v.active) {
        roles[v.roleid] = {
          roleid: v.roleid,
          rolename: v.rolename,
          status: v.disabled ? '0' : v.status
        };
      }
    });
    var req = {
      userid: this.userid,
      shopid: this.shopid,
      roles: roles
    };

    userServ.addUserRole(req).then(res => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      });
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
})