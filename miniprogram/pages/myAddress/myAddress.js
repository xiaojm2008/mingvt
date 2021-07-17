// miniprogram/pages/myAddress/myAddress.js
var helperServ = require("../../lib/utils/helper.js");
var addressServ = require("../../lib/services/address.js");
var loginServ = require("../../lib/services/login.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectAddressId: '',
    orderId: '',
    addressList: [],
    afterInitial: false,
    isFromBack: false,
    from: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      selectAddressId: options.addressid ? options.addressid : null
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    console.log("onshow");
    this.getAddressList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  getAddressList: function() {
    addressServ.getAddressList({}).then(res => {
      if (!res.result.data) {
        wx.showModal({
          title: '系统提示',
          content: res.result.errMsg,
        })
        return;
      }
      this.setData({
        addressList: res.result.data
      });
    });
  },
  deleteAddress: function(e) {
    var _id = null;
    if (typeof e != "string") {
      _id = e.currentTarget.dataset.id;
    } else {
      _id = e;
    }
    addressServ.deleteAddress({
      _id: _id
    }).then(res => {
      this.getAddressList();
    });
  },
  editAddress: function(e) {
    var _id = null;
    if (typeof e != "string") {
      _id = e.currentTarget.dataset.id;
    } else {
      _id = e;
    };
    helperServ.goToPage('/pages/addAddress/addAddress?addressid=' + _id);
  },
  addAddress: function() {
    helperServ.goToPage('/pages/addAddress/addAddress');
  },
  selectAddress: function(e) {
    var address_info = null;
    var idx = e && e.currentTarget ? e.currentTarget.dataset.index : null;
    if (idx || idx === 0) {
      address_info = this.data.addressList[idx];
    } else {
      //来源于微信地址选择
      address_info = e;
    }
    var prevPage = helperServ.getPrePage();
    if (prevPage.options.nextPageCallBack) {
      prevPage.options.nextPageCallBack(null, address_info);
      helperServ.goBack();
    } else {
      prevPage.setData({
        "orderInfo.address_info": address_info
      });
      //helperServ.goBack();
    }
    var addressId = e && e.currentTarget ? e.currentTarget.dataset.id : null;
    if (addressId) {
      this.setData({
        selectAddressId: addressId
      });
    }
  },
  showOperatedDlg: function(e) {
    helperServ.showActionSheet({
      itemList: ["修改", '删除'],
      success:(res)=> {
        var _id = e.currentTarget.dataset.id;
        console.log(res.tapIndex, _id);
        if (res.tapIndex == 0) {
          this.editAddress(_id);
        } else {
          this.deleteAddress(_id);
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  chooseWxAddress: function(e) {
    var self = this;
    loginServ.checkAuth("scope.address").then(res => {
      if (res.code == '1') {
        wx.chooseAddress({
          success(res) {
            var addr = {
              district: {},
              city: {},
              province: {}
            };
            addr.province.text = res.provinceName;
            addr.city.text = res.cityName;
            addr.district.text = res.countyName;
            addr.province.code = '';
            addr.city.code = '';
            addr.district.code = '';
            addr.postcode = res.postalCode;

            addr.name = res.userName;
            addr.contact = res.telNumber;
            addr.detailaddress = res.detailInfo;
            addr.is_default = '1';
            self.selectAddress(addr);
          },
          fail() {

          }
        });
      } else {
        helperServ.showModal({
          content: res.errMsg
        });
      }
    }).catch(err => {});
  }
})