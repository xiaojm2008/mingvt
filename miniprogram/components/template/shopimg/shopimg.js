var helperServ = require("../../../lib/utils/helper.js");
class shopimg {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.page.goShopPic = this.goShopPic.bind(this);
    this.page.oneSelectTap = this.oneSelectTap.bind(this);
  }
  goShopPic() {
    var cur = this.page.getCurrentPage();
    helperServ.goToPage("/pages/manager/shopPic/shopPic?shopid=" + this.page.data.options.shopid + "&imgcate=" + cur.params.imgcate);
  }
  oneSelectTap(e) {
    if(this.page.data.options.upshow){
      this._oneSelectTap(e);
    } else {
      //this._oneSelectTap(e);
    }
  }
  _oneSelectTap(e) {
    var index = e.currentTarget.dataset.index;
    var imginfo = this.page.getCurrentPage().listData[index];
    var prePage = helperServ.getPrePage();
    if (prePage) {
      var options = prePage.options;
      options.nextPageCallBack ? options.nextPageCallBack(null, imginfo.fileID) : null;
      helperServ.goBack();
    } else {
      helperServ.showModal({
        content: '获取上一页面失败,请返回重试！'
      });
    }
  }
}

module.exports = shopimg;