var app = getApp();
var promServ = require("../../../lib/services/prom.js");
var helperServ = require("../../../lib/utils/helper.js");

class promcenter {
  constructor(pageContext) {
    this.data = pageContext.data;
    //this.route = pageContext.route;
    this.page = pageContext;
    //this.page.goToPage = this.goToPage.bind(this);
  }
}

module.exports = promcenter;