const userServ = require('../../../lib/manager/user.js');
const roleServ = require('../../../lib/manager/role.js');
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
Page({


  /**
   * 页面的初始数据
   */
  roleid:null,
  shopid:null,
  batch_time: -1,
  tmpArr: [],
  data: {
    username:null,
    totalNum: 0,
    loadFinish: false,
    inList: [],
    roleUser:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.roleid = options.roleid ? options.roleid : null;
    this.shopid = options.shopid;
    cache.getDict(["100012", "100013"], (err, res) => {
      this.setData({
        dict: res,
        username: options.username ? decodeURIComponent(options.username) : ''
      })
    });
    this.loadRoleUser();
    this.loadMore();
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
  loadRoleUser:function(){
    roleServ.getRoleUser({ roleid: this.roleid, shopid: this.shopid }).then(res => {
      if(!res.result.data){
        helperServ.showModal({
          content: res.result.errMsg
        })
        return;
      }
      var tmp = {};
      res.result.data.forEach(v=>{
        tmp[v.userid] ={active:true,roles:v.roles};
      });
      this.setData({
        roleUser: tmp
      })
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message || '未知错误'
      })
    });
  },
  callPhone: function(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone
    })
  },
  insertUserRole: function (user, index) {
    var roles = {};
    roles[this.roleid] = {
      roleid: this.roleid,
      rolename: this.data.username,
      status: user.active ? '1' : '0'
    }
    helperServ.showLoading();
    userServ.insertUserRole({
      userid: user.userid,
      shopid: user.shopinfo.shopid,
      roles: roles
    }).then(res => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: res.result.errMsg
      })
      if(res.result.success == 1){
        var data={};
        data[`inList[${index}]`] = user;
        data[`roleUser.${user.userid}.active`] = user.active;
        this.setData(data);
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message || '未知错误'
      })
    })
  },
  oneSelectTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.inList,
      data = {};
    if (index !== "" && index != null) {
      var item = list[parseInt(index)];     
      item.active = this.data.roleUser && this.data.roleUser[item.userid] ? !this.data.roleUser[item.userid].active : !item.active;
      this.insertUserRole(item, index);
    }
  },
})