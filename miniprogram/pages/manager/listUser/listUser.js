const userServ = require('../../../lib/manager/user.js');
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
Page({


  /**
   * 页面的初始数据
   */
  batch_time: -1,
  tmpArr: [],
  data: {
    totalNum: 0,
    loadFinish: false,
    inList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    cache.getDict(["100012", "100013"], (err, res) => {
      this.setData({
        dict: res
      })
      this.loadMore();
    });
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
    this.data.loadFinish = false;
    this.batch_time = -1;
    this.tmpArr = [];
    this.loadMore(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  loadMore: function(isPull) {
    pageServ.loadMore(userServ.listUser, {
      batch_time: this.batch_time,
      orderby_field: "settime",
      orderby_type: "desc",
      status: null,
    }, isPull, this);
  },
  callPhone: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  goToPage: function(e) {
    var page = e.currentTarget.dataset.page;
    helperServ.goToPage(page);
  },
  showAddUserDlg(e) {
    var myDlg = this.selectComponent('#myMenu');
    myDlg.hide();
    var self = this;
    this.myDlg = this.selectComponent('#modalDlg');
    this.myDlg.showDlg({
      title: '新增对话框',
      animationShow:1,
      inputlist: {
        "phone": {
          "id": "phone",
          "name": "电话号码",
          "type": "1",
          "required": "R",
          "length": 13,
          "label": true,
          "placeholder": '请输入对方的电话号码',
          "event": {
            "type": "tap",
            "name": "查询",
            "togger": (e, cb) => {
              helperServ.showLoading({
                title: "查询中..."
              });
              var field = e.currentTarget.dataset.field;
              userServ.getUserInfo({
                phone: field.value
              }).then(res => {
                helperServ.hideLoading();
                if (res.result.data && res.result.data.length > 0) {
                  cb(null, res.result.data[0]);
                } else if (res.result.data.length == 0) {
                  cb("未查询到记录");
                } else {
                  cb(res.result.errMsg);
                }
              }).catch(err => {
                helperServ.hideLoading();
                cb(err.errMsg || err.message);
              })
            }
          }
        },
        "summary": {
          "id": "summary",
          "name": "备注",
          "type": "9",
          "required": "O",
          "length": 200,
          "label": true,
          "placeholder": '备注'
        }
      },
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        if (e.btnindex === 0) {
          wx.hideToast();
          cb();
          return;
        }
        if (!e.inputlist) {
          cb('e');
          return;
        }
        try {
          self.addUser(e.inputlist, cb);
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  },
  addUser: function(inputlist, cb) {
    if (!inputlist.phone.prompt) {
      helperServ.showModal({
        content: '请选查询确认'
      });
      cb('请选查询确认');
      return;
    }
    userServ.addUser({
      phone: inputlist.phone.value,
      summary: inputlist.summary.value
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      cb();
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    });
  },
  updUser: function(inputlist, cb) {
    userServ.updUser({
      userid: inputlist.userinfo.value.userid,
      summary: inputlist.summary.value,
      status: inputlist.status.value
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      cb();
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    });
  },
  showUpdUserDlg: function(index) {
    var user = this.data.inList[index];
    if (!user.avatarurl) {
      user.avatarurl = '../../images/icontab/icon_member.png';
    }
    var self = this;
    this.myDlg = this.selectComponent('#modalDlg');
    this.myDlg.showDlg({
      title: '修改对话框',
      inputlist: {
        "userinfo": {
          "id": "userinfo",
          "name": "用户信息",
          "type": "i", //信息提示
          "required": "O",
          "value": user,
          "label": false,
          "style": "border-bottom:0;"
        },
        "status": {
          "id": "status",
          "name": "状态",
          "label": true,
          "type": "3", //选择框
          "required": "R",
          "dictlist": this.data.dict["100012"],
          "value": user.status
        },
        "summary": {
          "id": "summary",
          "name": "备注",
          "type": "9",
          "required": "O",
          "length": 200,
          "label": true,
          "value": user.summary || '',
          "placeholder": '备注'
        }
      },
      btntext: ['确认'],
      submit: (e, cb) => {
        if (!e.inputlist) {
          wx.hideToast();
          cb('e');
          return;
        }
        try {
          self.updUser(e.inputlist, cb);
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  },
  assignRole: function(index) {
    var user = this.data.inList[index];
    //decodeURIComponent(options.scene)
    var info = `&avatarurl=${encodeURIComponent(user.avatarurl)}&username=${encodeURIComponent(user.username||user.nickname)}&phone=${user.phone}`
    helperServ.goToPage("../listRole/listRole?frompage=listUser&userid=" + user.userid + "&shopid=" + user.shopinfo.shopid + info);
  },
  assignRight: function(index) {
    var user = this.data.inList[index];
    var info = `&avatarurl=${encodeURIComponent(user.avatarurl)}&username=${encodeURIComponent(user.username || user.nickname)}&phone=${user.phone}`
    helperServ.goToPage("../listAction/listAction?frompage=listUser&userid=" + user.userid + "&shopid=" + user.shopinfo.shopid + info);
  },
  showMenu: function(e) {
    var self = this,
      pos = {},
      index = e.currentTarget.dataset.index;
    pos.scrollTop = 0;
    pos.left = e.touches[e.touches.length - 1].clientX;
    pos.bottom = e.touches[e.touches.length - 1].clientY;
    var menulist = [{
        "id": "mod",
        "text": "修改",
        "togger": (e, menu) => {
          self.showUpdUserDlg(index);
        }
      },
      {
        "id": "role",
        "text": "角色分配",
        "togger": (e, menu) => {
          self.assignRole(index);
        },
      },
      {
        "id": "right",
        "text": "权限分配",
        "togger": (e, menu) => {
          self.assignRight(index);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e, menu) => {}
      }
    ];
    pageServ.showMenu(this, {
      title: '操作菜单',
      menuid: '#myMenu',
      menulist: menulist,
      pos: pos,
      yoffset: 0,
      xoffset: 0,
      ctype: "view"
    });
  },
  showOperatedDlg: function(e) {
    var _self = this;
    wx.showActionSheet({
      itemList: ["更新", '角色分配', '权限分配', '取消'],
      success(res) {
        var index = e.currentTarget.dataset.index;
        if (res.tapIndex == 0) {
          _self.showUpdUserDlg(index);
        } else if (res.tapIndex == 1) {
          _self.assignRole(index);
        } else if (res.tapIndex == 2) {
          _self.assignRight(index);
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  }
})