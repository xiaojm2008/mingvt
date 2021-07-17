// miniprogram/pages/addAddress/addAddress.js
const pageServ = require('../../lib/utils/pagehelper.js');
var helperServ = require("../../lib/utils/helper.js");
var addressServ = require("../../lib/services/address.js");
var commServ = require("../../lib/services/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address_id:null,
    areainfo: ["广东省", "深圳市", "宝安区"],
    name: '',
    contact: '',
    detailaddress: '',
    is_default: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var addressid = options.addressid;
    if (!addressid || "" === addressid){
      return;
    }
    addressServ.getAddressList({ _id: addressid}).then(res=>{
      var address = res.result.data && res.result.data.length > 0 ? res.result.data[0]:null;
      if(!address){
        return;
      }
      this.setData({
        address_id:address._id,
        name:address.name,
        contact:address.contact,
        detailaddress:address.detailaddress,
        is_default:address.is_default?true:false,
        "areainfo[0]": address.province.text,
        "areainfo[1]": address.city.text,
        "areainfo[2]": address.district.text
        //"areainfo.postcode": address.postcode
      });
    });
  },
/*
  getAreaList: function(params) {
    if (params.areatype == "0") {
      var prov = helperServ.getStorage("prov").then(res => {
        this.setData({
          provinces: res.data
        });
      }).catch(err => {
        commServ.getAreaList(params).then(res => {
          this.setData({
            provinces: res.result.data
          });
          helperServ.setStorage("prov", res.result.data);
        });
      });
    } else if (params.areatype == "1") {
      var prov = helperServ.getStorage(`city_${params.areacode}`).then(res => {
        this.setData({
          cities: res.data
        });
      }).catch(err => {
        commServ.getAreaList(params).then(res => {
          this.setData({
            cities: res.result.data
          });
          helperServ.setStorage(`city_${params.areacode}`, res.result.data);
        });
      });
    } else if (params.areatype == "2") {
      var prov = helperServ.getStorage(`district_${params.areacode}`).then(res => {
        this.setData({
          districts: res.data
        });
      }).catch(err => {
        commServ.getAreaList(params).then(res => {
          this.setData({
            districts: res.result.data
          });
          helperServ.setStorage(`district_${params.areacode}`, res.result.data);
        });
      });
    }
  },
  */
  inputTogger: function (e) {
    pageServ.inputTogger(e, this);
  },
  addAddress: function() {
    var para = {
      province: {
        text: '',
        code: ''
      },
      city: {
        text: '',
        code: ''
      },
      district: {
        text: '',
        code: ''
      }
    };
    var that = this;
    if (!this.check()) {
      return;
    }
    para._id = this.data.address_id;
    para.province.text = this.data.areainfo[0];
    para.city.text = this.data.areainfo[1];
    para.district.text = this.data.areainfo[2];
    //para.province.code = this.data.areainfo.code[0];
    //para.city.code = this.data.areainfo.code[1];
    //para.district.code = this.data.areainfo.code[2];
    para.postcode = this.data.areainfo.postcode;
    para.name = this.data.name;
    para.contact = this.data.contact;
    para.detailaddress = this.data.detailaddress;
    para.is_default = this.data.is_default?1:0;
    addressServ.addAddress({
      address_info: para
    }).then(res => {
      if(!this.data.address_id && res.result._id){
        this.data.address_id = res.result._id;
        helperServ.goBack();
      } else if (this.data.address_id && res.result.stats.updated===1){
        helperServ.goBack();
      }
    });    
  },

  check: function() {
    var data = this.data,
      tip = '';
    if (!tip && !data.name.trim()) {
      tip = '请填写收件人';
    }
    if (!tip && !data.contact) {
      tip = '请填写联系电话';
    }
    if (!tip && !data.areainfo) {
      tip = '请选择省份/城市/地区';
    }
    if (!tip && !data.detailaddress) {
      tip = '请填写详细地址';
    }
    if (tip) {
      helperServ.showModal({
        content: tip
      });
      return false;
    }
    return true;
  },
})