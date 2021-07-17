var commServ = require("../../../lib/services/common.js");
var constants = require("../../../lib/constants.js");
var cache = require("../../../lib/utils/cache.js");
var helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
var shopServ = require("../../../lib/manager/shop.js");
const mySeq = require("../../../lib/utils/mySeq.js");
const app = getApp();
const topHeight = 41;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: null,
    catetype: '1',
    offsetHeight: topHeight,
    selected:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.userinfo = helperServ.getUserInfo();
    if (!this.userinfo.shopinfo || !this.userinfo.shopinfo.basedir) {
      helperServ.showModal({
        content: "用户参数异常，请修改重新选择并且修改店铺信息",
        success: (res) => {
          if (res.confirm) {
            helperServ.goToPage('/pages/manager/listShop/listShop?frompage=addGoods');
          }
        }
      });
      return;
    }
    this.cloudPath = this.userinfo.shopinfo.basedir + "/category/";
    cache.getDict(["100012"], (err, res) => {
      var data = {};
      data['dict'] = res;
      /*
      data['avatarurl'] = options.avatarurl ? decodeURIComponent(options.avatarurl) : '';
      data['username'] = options.username ? decodeURIComponent(options.username) : '';
      data['phone'] = options.phone ? decodeURIComponent(options.phone) : '';*/
      this.setData(data);
    });
    this.shopid = options.shopid || this.userinfo.shopinfo.shopid;
    if (!this.shopid) {
      helperServ.showModal({
        content: '参数错误'
      });
      helperServ.goBack();
      return;
    }
    this.loadCategory();
    //this.selectAction({currentTarget:{dataset:{index:0}}});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    pageServ.setWinHgh(this);
  },

  previewImg: function (e) {
    var imgs = this.data.category[this.data.selected].img;
    helperServ.previewImg(imgs, e.currentTarget.dataset.imgindex);
  },
  tapHandler: function(e) {
    this.setData({
      selected: e.currentTarget.dataset.index
    })
  }, 
  /*
  showModDlg: function(e) {
    var idx = this.data.selected,
      cidx = e.currentTarget.dataset.cindex,
      data = {};
    if (!cidx && cidx !== 0) {
      this.data.category[idx].index = idx;
      this.data.category[idx].level = 1;
      this.data.category[idx].status = '1';
      this.showAddDlg(e, this.data.category[idx], "修改分类", null);
    } else {
      var c = this.data.category[idx].items[cidx];
      //可能是一个null，空对象（占位了cidx）
      if (!c) {
        c = {};      
        c.code = this.data.category[idx].code + mySeq.prefixZero(cidx, 3);
        c.level = '2';
        c.status = '1';
      }
      c.index = cidx;
      //this.selectChildCate(e);
      this.showAddDlg(e, c, "修改子分类", this.data.category[idx]);
    }
  },
 
  showAddChildDlg: function(e) {
    var idx = this.data.selected,
      pcatey = this.data.category[idx],
      subcatecode = 0;
    if (pcatey.items && pcatey.items.length > 0) {
      if (!pcatey.items[pcatey.items.length - 1]) {
        subcatecode = pcatey.code + mySeq.prefixZero(pcatey.items.length, 3);
      } else {
        subcatecode = pcatey.code + mySeq.prefixZero(parseInt(pcatey.items[pcatey.items.length - 1].code) + 1, 3);
      }
    } else {
      subcatecode = pcatey.code + "100";
    }

    this.showAddDlg(e, null, "新增子分类", pcatey, subcatecode);
  },*/
  showAddPDlg:function(e){
    var cate = { index:0,code:'101',level:'1',status:'1'};
    if(this.data.category && this.data.category.length > 0){
      cate.index = this.data.category.length;
      cate.code = (parseInt(cate.code) + cate.index)+'';
    }
    this.showAddDlg(e,cate,'新增',1);
  },
  showAddCDlg: function (e) {
    var cate = { pindex: this.data.selected, index: 0, level: '2', status: '1'},
      pcate = this.data.category[this.data.selected],
      child = pcate.items;
    cate.code = pcate.code+'100';
    if (child && child.length > 0) {
      cate.index = child.length;
      cate.code = pcate.code + mySeq.prefixZero(100 + cate.index, 3);
    }
    this.showAddDlg(e, cate,'新增子类',1);
  },
  showModPDlg:function(e){
    this.showAddDlg(e, this.data.category[this.data.selected],'修改',2);
  },
  showModCDlg: function (e) {
    var idx = this.data.selected,
      cidx = e.currentTarget.dataset.cindex;
    var c = this.data.category[idx].items[cidx];
    //可能是一个null，空对象（占位了cidx）
    if (!c) {
      c = {};
      c.code = this.data.category[idx].code + mySeq.prefixZero(cidx, 3);
      c.level = '2';
      c.status = '1';
      c.index = cidx;
      c.pindex = idx;
    } 
    this.showAddDlg(e, c, "修改子类",2);
  },
  //新增父级别category
  showAddDlg: function(e, cate, title,oper) {
    var self = this;
    this.myDlg = this.selectComponent('#modalDlg');
    this.myDlg.showDlg({
      title: title + "[" + cate.code + `:${cate.level}]`,
      inputlist: {
        "pindex": {
          "seq": 0,
          "id": "pindex",
          "name": "父索引",
          "hidden": true,
          "type": "i", //信息提示
          "required": 'O',
          "value": cate ? cate.pindex : null
        },
        "index": {
          "seq": 0,
          "id": "index",
          "name": "索引",
          "hidden": true,
          "type": "i", //信息提示
          "required": true,
          "value": cate ? cate.index : null
        },
        "code": {
          "seq": 2,
          "id": "code",
          "hidden": true,
          "name": "分类ID",
          "type": "0", //信息提示
          "required": "R",
          "label": true,
          "value": cate ? cate.code : null
        },
        "name": {
          "seq": 3,
          "id": "name",
          "name": "分类名称",
          "label": true,
          "type": "0",
          "required": "R",
          "value": cate ? cate.name : null
        },
        "level": {
          "seq": 4,
          "id": "level",
          "disabled": true,
          "name": "级别",
          "label": true,
          "hidden": true,
          "type": "3",
          "required": "R",
          "dictlist": [{
            code: '1',
            name: "父类"
          }, {
            code: '2',
            name: '子类'
          }],
          "value": cate ? cate.level : null 
        },
        "url": {
          "seq": 5,
          "id": "url",
          "name": "页面",
          "label": true,
          "type": "0",
          "required": "O",
          "value": cate ? cate.url : null
        },
        "params": {
          "seq": 6,
          "id": "params",
          "name": "页面参数",
          "label": true,
          "type": "0",
          "required": "O",
          "value": cate ? cate.params : null
        },
        "status": {
          "seq": 7,
          "id": "status",
          "name": "状态",
          "label": true,
          "type": "3",
          "required": "O",
          "dictlist": this.data.dict["100012"],
          "value": cate ? cate.status : null
        },
        /*
        "logo": {
          "seq": 8,
          "id": "logo",
          "name": "LOGO与图标",
          "label": true,
          "type": "b",
          "required": "O",
          "value": cate && cate.logo ? cate.logo : {value: {fileID:this.data.defaultLogo}}
        },*/
        "img": {
          "seq": 9,
          "id": "img",
          "name": "LOGO与图标",
          "label": true,
          "maxcount": 2,
          "initflag": false,
          "type": "b1",
          "required": "R",
          "value": cate && cate.img ? cate.img : [{
            digest: 1,
            fileID: null,
            name: 'LOGO',
            width: 800,
            height: 400
          }, {
            digest: 2,
            fileID: null,
            name: '图标',
            width: 200,
            height: 200
          }]
        },
        "summary": {
          "seq": 10,
          "id": "summary",
          "name": "备注",
          "type": "9",
          "required": "O",
          "length": 200,
          "label": false,
          "value": cate ? cate.summary : null,
          "placeholder": '备注'
        }
      },
      btntext: [oper==2 ? '删除' : '取消', '确认'],
      cloudPath: this.cloudPath,
      submit: (e, cb) => {
        if (!cate && e.btnindex === 0) {
          cb();
          wx.hideToast();
          return;
        }
        if (!e.inputlist) {
          cb('e');
          return;
        }
        try {
          if (e.btnindex == 1) {
            self.myDlg.upLoadFile((err,f)=>{
              if(err){
                return;
              }
              if (oper===2) {
                self.updCategory(e.inputlist, cb);
              } else {
                self.addCategory(e.inputlist, cb);
              }
            })        
          } else {
            self.delCategory(e.inputlist, cb);
          }
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  },
  /*
  selectChildCate: function(e) {
    var cindex = e.currentTarget.dataset.cindex,
      ifind = 0,
      item = this.data.category[this.data.selected].items[cindex];
    item.active = !item.active;
    var data = {};
    data[`category[${this.data.selected}].items[${index}].active`] = item.active;
    this.setData(data);
  },*/
  /*
  delCategoryTogger: function (e) {
    this.delCategory(null, this.data.category[e.currentTarget.dataset.index], () => { });
  },*/
  uploadImg: function (inputlist,cb) {
    helperServ.showLoading({
      title: '图片上传中...',
    });
    var imgarr = [];
    for (var i in inputlist) {
      var field = inputlist[i];
      if (field.type === '5' || field.type === 'a' || field.type === 'b' || field.type === 'b1') {
        if (field.value && field.value.length > 0) {
          Array.prototype.push.apply(imgarr, field.value);
        }
      }
    } 
    pageServ.upLoadFile(imgarr, this.cloudPath, cb);
  },
  delCategory: function(v, cb) {
    if (!v) {
      cb('e');
      helperServ.showModal({
        content: '未选择分类'
      });
      return;
    }
    helperServ.showModal({
      content: `请确认是否删除【${v.name.value}】`,
      success: (res) => {
        if (res.confirm) {
          shopServ.delCategory({
            shopid: this.shopid,
            category: {
              pindex: v.pindex.value,
              index: v.index.value,
              code:  v.code.value,
              level: v.level.value
            }
          }).then(res => {
            helperServ.showModal({
              content: res.result.errMsg
            });
            res.result.success == 1 ? this.loadCategory() : null;
            cb(res.result.success == 1 ? null : res);
          }).catch(err => {
            cb(err);
            helperServ.showModal({
              content: err.errMsg || err.message || '未知'
            });
          })
        }
      }
    });
  },
  loadCategory:function(cate){
    helperServ.showLoading({
      content: '加载中...'
    });
    shopServ.listCategory({
      shopid: this.shopid
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.data && res.result.data.length > 0) {
        this.setData({
          selected: this.data.selected,
          category: res.result.data[0].items
        });
      } else if(!res.result.data) {
        helperServ.showModal({ content: res.result.errMsg });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  updCategory: function(v, cb) {
    var category = {};
    for (var k in v) {
      category[k] = v[k].value
    }   
    shopServ.modCategory({
      shopid: this.shopid,
      category: category
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      res.result.success == 1 ? this.loadCategory() : null;
      cb(res.result.success == 1 ? null : res);
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message || '未知'
      });
    })
  },
  addCategory: function(v, cb) {
    var category = {};
    for (var k in v) {
      category[k] = v[k].value
    }
    if (v.level.value === 1) {
      category.items = [];
    }
    shopServ.addCategory({
      shopid: this.shopid,
      category: category
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      res.result.success == 1 ? this.loadCategory() : null;
      cb(res.result.success == 1 ? null : res);
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message || '未知'
      });
    })
  }
})