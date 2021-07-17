const helperServ = require('../../lib/utils/helper.js');
const pageServ = require('../../lib/utils/pagehelper.js');
const cache = require("../../lib/utils/cache.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    /**
     * name:''
     * params:{}
     */
    category: [],
    action: null,
    manager: "trader",
    temptype: 'promcenter',
    defParams: {},
    orderBy: {
      orderby_field:"updatetime",
      orderby_type:"desc"
    },
    statusBarHeight: app.systemInfo.statusBarHeight,
    bottomSize: pageServ.getRpx(45 + app.systemInfo.statusBarHeight)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cache.getDict(["100016"], (err, res) => {
      this.setData({
        category: res["100016"].map(v=>{
          return {
            name:v.name,
            desc:v.desc,
            params:{
              code:v.code
            }
          }
        }),
        action:"prom.getPromList",
        defParams:{
          shopid: options.shopid||''
        }
      });
    });
  },
  goBack:function(e){
    helperServ.goBack();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})