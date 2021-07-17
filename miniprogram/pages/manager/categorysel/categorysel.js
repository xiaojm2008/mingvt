var commServ = require("../../../lib/services/common.js");
var constants = require("../../../lib/constants.js");
var cacheServ = require("../../../lib/utils/cache.js");
var helperServ = require("../../../lib/utils/helper.js");
var pageServ = require("../../../lib/utils/pagehelper.js");
const topHeight = 41;
Page({

  /**
   * 页面的初始数据
   */
  data: {
              //cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/category/美容店.svg
    defaultImg:'cloud://xiaovt-818we.7869-xiaovt-818we/assets/imgs/category/美容店.svg',
    category:null,
    catetype:'1',
    offsetHeight:0,
    selectedArr:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    this.setData({
      selectedArr: options.catetype == '1' ? prevPage.data.goodsinfo.category || [] : prevPage.data.shopinfo.sector || [],
      selected:0,
      offsetHeight: topHeight,
      catetype: options.catetype,
      category: cacheServ.getCategory({ catetype: options.catetype })
    });
    //this.selectAction({currentTarget:{dataset:{index:0}}});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    pageServ.setWinHgh(this);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  tapHandler:function(e){
    this.setData({
      selected:e.currentTarget.dataset.index
    })
  },
  tapCategoryItem:function(e){
    var index = e.currentTarget.dataset.index, item = this.data.selectedArr[index];
    this.data.category[item.selected].items[item.index].active = !item.active;
    this.setData({ selected:item.selected});
    this.selectAction({currentTarget:{dataset:{index:item.index}}});
  },
  selectAction:function(e){
    var index = e.currentTarget.dataset.index,ifind=0,item = this.data.category[this.data.selected].items[index];
    var findI = this.data.selectedArr.find((v, i) => { if (v.code == item.code) { ifind = i; return true; } });
    item.index = index;
    item.selected = this.data.selected; 
    if(item.active){     
      if (findI){
        this.data.selectedArr.splice(ifind, 1);
      } 
      item.active = false;
    } else {
      item.active = true;     
      if (!findI){      
        if (this.data.selectedArr.length > 5) {
          helperServ.showToast({ icon: 'none', title: '最多选择6种分类' });
          return;
        }
        this.data.selectedArr.push({
          index:item.index,
          selected:item.selected,
          active:item.active,
          code:item.code,
          name:item.name
        });
      }
    }    
    var data = {};
    data[`category[${this.data.selected}].items[${index}].active`] = item.active;
    data['selectedArr'] = this.data.selectedArr;
    data["offsetHeight"] = Math.ceil(this.data.selectedArr.length / 3) * topHeight;
    this.setData(data);
    var pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    if(this.data.catetype=='2'){
      prevPage.setData({
        "shopinfo.sector": this.data.selectedArr
      });
    } else {
      prevPage.setData({
        "goodsinfo.category": this.data.selectedArr
      });
    }
  }
})