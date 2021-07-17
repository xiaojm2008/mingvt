var app = getApp();
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const actionServ = require("../../../lib/services/action.js");
const dict = {
  "100032": null,
  "100033": null,
  "100039": 0
};
class actionlist {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.page.callPhone = this.callPhone.bind(this);
    this.page.showMenu = this.showMenu.bind(this);
    this.page.goToPage = this.goToPage.bind(this);
    this.page.onListEnroll = this.onListEnroll.bind(this);
    this.page.onMod = this.onMod.bind(this);
    this.page.onDel = this.onDel.bind(this);
    this.page.onPause = this.onPause.bind(this);
    this.page.onGenQr = this.onGenQr.bind(this);
    cache.getDict(Object.keys(dict), (err, res) => {
      if (err) {
        helperServ.showToast({
          title: err,
          icon: 'none'
        })
        return;
      }
      var clientcfg = app.getClientCfg();
      this.page.setData({
        "options.now": helperServ.dateFormat(new Date(), "yyyy-MM-dd hh:mm"),
        "options.mymenu": 1,
        /**需要加载mymenu组件 */
        "options.mymodal": 1,
        "options.dict": res,
        "options.clientcfg.debug": clientcfg ? clientcfg.DEBUG : false
      })
    });
  }
  goToPage(e) {
    helperServ.goToPage(e.currentTarget.dataset.page);
  }
  callPhone(e) {
    helperServ.callPhone(e.currentTarget.dataset.phone);
  }
  getActionInfo(e) {
    var index = e.currentTarget.dataset.index;
    var actioninfo = null;
    if (index !== "" && index != null) {
      var curPage = this.page.getCurrentPage();
      actioninfo = curPage.listData && curPage.listData[index];
    } else {
      actioninfo = this.data.actionInfo;
    }
    return actioninfo;
  }
  showMenu(e) {
    var pos = {},
      actioninfo = this.getActionInfo(e);
    pos.scrollTop = 0;
    pos.left = e.touches[e.touches.length - 1].clientX;
    pos.bottom = e.touches[e.touches.length - 1].clientY;
    var menulist = [{
        "id": "add",
        "text": "新增",
        "togger": (e1, menu) => {
          helperServ.goToPage("/act/createaction/createaction");
        }
      },
      {
        "id": "mod",
        "text": "修改",
        "togger": (e1, menu) => {
          //helperServ.goToPage("/act/createaction/createaction?dataid=" + actioninfo._id);
          this.onMod(e);
        },
      },
      {
        "id": "del",
        "text": "删除",
        "togger": (e1, menu) => {
          this.onDel(e);
        },
      },
      {
        "id": "pause",
        "text": actioninfo.actionstatus == '1' ? "启动" : "暂停", //	<!-- 100039 0:"启动",1:"暂停",2:"结束",9:"删除" -->
        "togger": (e1, menu) => {
          this.onPause(e)
        },
      },
      {
        "id": "person",
        "text": "参入人员",
        "togger": (e1, menu) => {
          this.onListEnroll(e);
        },
      },
      {
        "id": "show",
        "text": "预览",
        "togger": (e1, menu) => {
          helperServ.goToPage("/act/actiondetail/actiondetail?dataid=" + actioninfo._id);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e1, menu) => {}
      }
    ];
    if (actioninfo.actionstatus === '9') {
      menulist.splice(2, 1);
    }
    pageServ.showMenu(this.page, {
      title: '操作菜单',
      menuid: '#myMenu',
      menulist: menulist,
      maxWidth: 180,
      pos: pos,
      yoffset: 0,
      xoffset: 0,
      ctype: "view"
    });
  }

  onListEnroll(e) {
    var actioninfo = this.getActionInfo(e);
    helperServ.goToPage("/act/enrolllist/enrolllist?actionid=" + actioninfo._id + "&actionname=" + actioninfo.actionname + "&feetype=" + actioninfo.feetype + "&apprflag=" + (actioninfo.apprflag || ''));
  }
  onMod(e) {
    var actioninfo = this.getActionInfo(e);
    helperServ.goToPage("/act/createaction/createaction?dataid=" + actioninfo._id);
  }
  onPause(e) {
    var actioninfo = this.getActionInfo(e);
    this.setAction(actioninfo._id, actioninfo.actionstatus === '1' ? '0' : '1');
  }
  onDel(e) {
    var actioninfo = this.getActionInfo(e);
    this.setAction(actioninfo._id, '9');
  }
  onGenQr(e) {
    var actioninfo = this.getActionInfo(e);
    var operbtn = [{
        text: {
          name: "参入人员",
          style: ""
        },
        icon: {
          name: "icon-tuandui",
          style: ""
        },
        tap: (idx) => {
          this.onListEnroll(e);
        }
      }, {
        text: {
          name: "新建活动",
          style: ""
        },
        icon: {
          name: "icon-plus-cxx",
          style: ""
        },
        tap: (idx) => {
          helperServ.goToPage("/act/createaction/createaction");
        }
      }, {
        text: {
          name: "删除",
          style: ""
        },
        icon: {
          name: "icon-delete",
          style: ""
        },
        tap: (idx) => {
          this.onDel(e);
        }
      },
      {
        text: {
          name: "签到码",
          style: ""
        },
        icon: {
          name: "icon-qrcode",
          style: ""
        },
        tap: (idx) => {
          this._genSiginQr(actioninfo);
        }
      }
    ];
    if (actioninfo.actionstatus === '9') {
      operbtn.splice(2, !actioninfo.siginflag?2:1);
    } else if(!actioninfo.siginflag){
      operbtn.splice(3, 1);
    }
    this.page.selectComponent("#myModal").show({
      title: {
        name: "更多操作",
        style: ""
      },
      data: operbtn
    })
  }
  setAction(_id, actionstatus) {
    if (actionstatus === '9') {
      helperServ.showModal({
        content: "请确认是否删除该记录",
        success: (ok) => {
          if (ok.confirm) {
            this._setAction(_id, actionstatus)
          }
        }
      })
    } else {
      this._setAction(_id, actionstatus);
    }
  }
  _genSiginQr(actioninfo) {
    helperServ.goToPage("/act/sigininqr/sigininqr?actionid=" + actioninfo.actionid);
  }
  _genHB(actioninfo) {

  }
  _setAction(_id, actionstatus) {
    helperServ.showLoading();
    actionServ.setActionStatus({
      actionid: _id,
      actionstatus: actionstatus
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.success) {
        this.page.refresh();
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  }
}

module.exports = actionlist;