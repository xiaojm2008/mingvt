const helperServ = require("../../../lib/utils/helper.js");
const commServ = require('../../../lib/manager/comm.js');
const userServ = require('../../../lib/manager/user.js');
const roleServ = require('../../../lib/manager/role.js');
Page({

  /**
   * 页面的初始数据
   */
  frompage: null,
  roleid: null,
  userid: null,
  shopid: null,
  actionFunc: null,
  actionFunc2: null,
  data: {

    action: null,
    //rights: rights
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //console.log(options);
    this.frompage = options.frompage;
    if (this.frompage == "listUser") {
      this.actionFunc = userServ.addUserRight;
      this.actionFunc2 = userServ.getUserRight;
    } else if (this.frompage == "listRole") {
      this.actionFunc = roleServ.addRoleRight;
      this.actionFunc2 = roleServ.getRoleRight;
    }
    this.userid = options.userid ? options.userid : null;
    this.roleid = options.roleid ? options.roleid : null;
    this.shopid = options.shopid;
    var data = {};
    data['avatarurl'] = options.avatarurl?decodeURIComponent(options.avatarurl):'';
    data['username'] = options.username?decodeURIComponent(options.username):'';
    data['phone'] = options.phone?decodeURIComponent(options.phone):'';
    this.setData(data);
    this.loadAction();
  },
  loadAction:function(){
    commServ.action({}).then(res => {
      helperServ.showLoading({ title: '权限加载中...' })
      this.actionFunc2({
        userid: this.userid,
        roleid: this.roleid,
        shopid: this.shopid
      }).then(res2 => {
        helperServ.hideLoading();
        if (!res2.result.rights) {
          helperServ.showModal({ content: res2.result.errMsg || '未知错误' });
          this.setData({
            action: res.result
          })
          return;
        }
        res.result.forEach((v) => {
          v.children.forEach(v1 => {
            var userright = res2.result.rights[`${v.id}_${v1.id}`];
            if (userright) {
              v1.active = true;
              v1.status = userright.status;
              if (userright.roleid){
                v1.roleid = userright.roleid;
              }
            }
          })
        })
        this.setData({
          action: res.result
        })
      }).catch(err => {
        helperServ.showModal({
          content: err.errMsg || err.message || '未知错误'
        });
      })
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
    this.loadAction();
    setTimeout(()=>{
      wx.stopPullDownRefresh() 
    },500);
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
    var c = this.data.action[idx].children[cidx];
    if (c.active && (c.status == '1' || !c.status)) {
      c.status = '0'
    } else if (c.active && c.status == '0') {
      c.status = null;
      c.active = false;
    } else if (!c.active) {
      c.active = true;
      c.status = '1';
    }
    data[`action[${idx}].children[${cidx}].active`] = c.active;
    data[`action[${idx}].children[${cidx}].status`] = c.status;
    this.setData(data);
  },
  saveSelect: function(e) {
    var idx = e.currentTarget.dataset.index;
    helperServ.showLoading();
    var rights = {},
      req = null;
    this.data.action.forEach((v) => {
      v.children.forEach(cv => {
        if (!cv.active) {
          return;
        }
        var k = `${ v.id }_${ cv.id }`;
        rights[k] = {
          type: v.id,
          actionname: cv.id,
          shopid: this.shopid,
          desc: cv.name,
          status: cv.status
        };
        if (this.frompage == 'listRole') {
          rights[k].roleid = this.roleid;
        } else {
          if (!cv.roleid){
            rights[k].userid = this.userid;
          } else {
            rights[k].roleid = cv.roleid;
            rights[k].mod_userid = this.userid;
          }
        }
      });
    });
    req = {
      shopid: this.shopid,
      rights: rights
    };
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
        content: err.errMsg || err.message
      });
    })
  },
  selectAll: function(e) {
    var idx = e.currentTarget.dataset.index,
      data = {};
    this.data.action[idx].children.forEach(v => {
      v.active = !this.data.action[idx].active;
      if (v.active) {
        v.status = '1'
      } else {
        v.status = null;
      };
    });
    data[`action[${idx}].active`] = !this.data.action[idx].active;
    data[`action[${idx}].children`] = this.data.action[idx].children;
    this.setData(data);
  },
  goToListRole: function (e) {
    var info = `&avatarurl=${encodeURIComponent(this.data.avatarurl)}&username=${encodeURIComponent(this.data.username)}&phone=${this.data.phone}`
    helperServ.goToPage("../listRole/listRole?frompage=listUser&userid=" + this.userid + "&shopid=" + this.shopid + info);
  },
})