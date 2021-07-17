var app = getApp();
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const logisServ = require('../../../lib/manager/logistics.js');

class dodelivery {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    //不用 cancelLogistics,页面里面有同名函数
    this.page.doCancelLogistics = this.doCancelLogistics.bind(this);
    this.page.addBN = this.addBN.bind(this);
    this.page.lookLogisPath = this.lookLogisPath.bind(this);
    this.page.showDetail = this.showDetail.bind(this);
    this.page.reDoLogistics = this.reDoLogistics.bind(this);
    var clientcfg = app.getClientCfg();
    if(clientcfg){
      this.page.setData({
        "options.clientcfg.debug":clientcfg.DEBUG
      })
    }
  }
  getLogis(e) {
    var index = e.currentTarget.dataset.index;
    var logis = null;
    if (index !== "" && index != null) {
      var curPage = this.page.getCurrentPage();
      logis = curPage.listData && curPage.listData[index];
    } else {
      logis = this.data.logisInfo;
    }
    return logis;
  }
  doCancelLogistics(e) {
    /*
    helperServ.showModal({
      content: "您确认取消揽件预约吗，取消后需要重新预约",
      success: (sel) => {
        if (sel.cancel) {
          return;
        }
        helperServ.showLoading();
        logisServ.cancelLogistics({
          order_id: this.getLogis(e).order_id
        }).then(res => {
          helperServ.hideLoading();
          helperServ.showModal({
            content: res.result.errMsg + ":(" + (res.result.retcode || 'None') + ")"
          });
        }).catch(err => {
          helperServ.showModal({
            content: err.errMsg || err.message
          });
        });
      }
    })*/
    var curPage = helperServ.getCurrPage();
    curPage.cancelLogistics(e);
  }

  addBN(e) {
    var curPage = helperServ.getCurrPage(),
    logis = this.getLogis(e);
    curPage.showAddBNDlg(logis);
  }
  reDoLogistics(e){
    var curPage = helperServ.getCurrPage(),
    logis = this.getLogis(e);
    curPage._reDoLogistics(logis);
  }
  lookLogisPath(e) {
    var logis = this.getLogis(e);
    helperServ.goToPage(`/pages/logisticsPath/logisticsPath?BN=${logis.BN}&exp_code=${logis.exp_code}&logis_id=${logis.logis_id}`);
  }
  showDetail(e){
    var curPage = helperServ.getCurrPage(),
    logis = this.getLogis(e);
    curPage.getLogisticsInfo(logis.logis_id,logis.order_id);
  }
}

module.exports = dodelivery;