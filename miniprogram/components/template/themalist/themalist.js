/**
 * 未使用，参考/sub/thema/listThema
 * 
 */
var app = getApp();
//var pageServ = require("../../../lib/utils/pagehelper.js");
var helperServ = require("../../../lib/utils/helper.js");
var payServ = require("../../../lib/services/pay.js");
const cache = require("../../../lib/utils/cache.js");
class themalist {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.page.goDetail = this.goDetail.bind(this);
    cache.getDict([100031], (err, res) => {
      if (err) {
        helperServ.showToast({
          title:err,
          icon: 'none'
        })
        return;
      }
      var clientcfg = app.getClientCfg();
      this.page.setData({
        "options.dict":res,
        "options.clientcfg.debug":clientcfg?clientcfg.DEBUG:false
      })
    });
  }
  getDataItem(e) {
    var index = e.currentTarget.dataset.index;
    var dataitem = null;
    if (index !== "" && index != null) {
      var curPage = this.page.getCurrentPage();
      dataitem = curPage.listData && curPage.listData[index];
    }
    return dataitem;
  }

  goDetail(e){
    helperServ.goToPage(`/pages/shopdecor/shopdecor?themaid=${e.currentTarget.dataset.themaid}`);
  }
}

module.exports = themalist;