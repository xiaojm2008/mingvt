var helperServ = require("../../../lib/utils/helper.js");
var pageServ = require("../../../lib/utils/pagehelper.js");
var cache = require("../../../lib/utils/cache.js");
var mySeq = require("../../../lib/utils/mySeq.js");
var upimg = require("../../../lib/utils/upimg.js");
var constants = require("../../../lib/comm/constants.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: null,
    category: [],
    action: null,
    manager: "manager",
    temptype: 'shopimg',
    defParams: {},
    orderBy: {
      orderby_field: "updatetime",
      orderby_type: "desc"
    },
    statusBarHeight: app.systemInfo.statusBarHeight,
    bottomSize: pageServ.getRpx(45 + app.systemInfo.statusBarHeight)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //如果Storage中存储了，那么就不要Cache
    cache.fieldTemplate({
      temptype: "shop_imginfo",
      category: ""
    }, (err, arr) => {
      var tmp = arr.reduce((pre, cur, all) => {
        return pre.concat(Object.values(cur))
      }, []);
      tmp.forEach(v => {
        if (v && v.name && v.id)
          this.data.category.push({
            name: v.name,
            id: v.id,
            params: {
              imgcate: v.id
            }
          })
      });
      if (!err) {
        this.setData({
          category: this.data.category,
          action: "shop.listShopImg",
          defParams:{
            shopid:options.shopid||''
          },
          options: options || null
        })
      } else {
        helperServ.showModal({
          content: err
        });
      }
    });
  },
  goBack: function() {
    helperServ.goBack();
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})