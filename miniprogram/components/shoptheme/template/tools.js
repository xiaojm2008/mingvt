const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
class mytools {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.page.editCtrl = this.editCtrl.bind(this);
    this.page.addCtrl = this.addCtrl.bind(this);
    this.page.delCtrl = this.delCtrl.bind(this);
    this.page.operCtrl = this.operCtrl.bind(this);
    this.page.closeCtrlTools = this.closeCtrlTools.bind(this);
    this.page.operNode = this.operNode.bind(this);
    this.page.locatedPNode = this.locatedPNode.bind(this);
  }
  editCtrl(e) {
    if (this.page.editCtrlTogger) {
      this.page.editCtrlTogger({
        detail: {
          ckey: e.currentTarget.dataset.ckey
        }
      })
    }
  }
  addCtrl(e) {
    //console.log('addCtrl', e);
    if (this.page.addCtrlTogger) {
      this.page.addCtrlTogger({
        detail: {
          ckey: e.currentTarget.dataset.ckey
        }
      })
    }
  }
  delCtrl(e) {
    editCtrlTogger
    if (this.page.editCtrlTogger) {
      this.page.editCtrlTogger({
        detail: {
          ckey: e.currentTarget.dataset.ckey
        }
      })
    }
  }
  operCtrl(e) {
    //console.log('operCtrl', e);
    pageServ.getEleRect("#" + e.currentTarget.id, this.page, (pos) => {
      const detail = {
        pos: pos,
        nodeindex: e.currentTarget.dataset.nodeindex,
        ckey: e.currentTarget.dataset.ckey
      };
      if (this.page.operCtrlTogger) {
        this.page.operCtrlTogger({
          detail: detail
        })
      }
    });
  }
  closeCtrlTools(e) {
    this.page.hide && this.page.hide();
  }
  operNode(e) {
    pageServ.getEleRect("#" + e.currentTarget.id, this.page, (pos) => {
      this.page.operNodeTogger && this.page.operNodeTogger({
        detail: {
          pos: pos,//按钮位置
          nodeindex: e.currentTarget.dataset.nodeindex,
          ckey: e.currentTarget.dataset.ckey
        }
      })
    });
  }
  locatedPNode(e){
    pageServ.getEleRect("#" + e.currentTarget.id, this.page, (pos) => {
      this.page.locatedPNodeTogger && this.page.locatedPNodeTogger({
        detail: {
          pos: pos,//按钮位置
          nodeindex: e.currentTarget.dataset.nodeindex,
          ckey: e.currentTarget.dataset.ckey
        }
      })
    });
  }
}

module.exports = mytools;