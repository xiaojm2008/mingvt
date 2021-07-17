const cateServ = require('../../../lib/manager/category.js');
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
const mySeq = require("../../../lib/utils/mySeq.js");
Page({

  /**
   * 页面的初始数据
   */
  catetype:null,
  data: {
    category: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var data = {};
    cache.getDict(["100012"], (err, res) => {
      data['dict']=res;
      data['avatarurl'] = options.avatarurl ? decodeURIComponent(options.avatarurl) : '';
      data['username'] = options.username ? decodeURIComponent(options.username) : '';
      data['phone'] = options.phone ? decodeURIComponent(options.phone) : '';
      this.setData(data);
    });
    this.catetype = options.catetype;
    this.reloadCategory();
  },
  reloadCategory: function () {
    helperServ.showLoading({
      title: '模块加载中...'
    })
    cateServ.listCategory({ catetype: this.catetype }).then(res => {
      helperServ.hideLoading();
      if (!res.result.data) {
        helperServ.showModal({
          content: res.result.errMsg || res.errMsg
        });
        return;
      } else if (res.result.data.length ===0){
        return;
      }
      this.setData({
        category: res.result.data[0].items
      })
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message || '未知错误'
      });
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
  delCategoryTogger: function (e) {
    this.delCategory(null, this.data.category[e.currentTarget.dataset.index], () => { });
  },
  delCategory: function (v, pcategory, cb) {
    if (!v && !pcategory) {
      cb('e');
      helperServ.showModal({
        content: '未选择分类'
      });
      return;
    }
    helperServ.showModal({
      content: `请确认是否删除【${v ? v.name.value : pcategory.name}】`,
      success: (res) => {
        if (res.confirm) {
          cateServ.delCategory({
            catetype: this.catetype,
            category: {
              code: v ? v.code.value : pcategory.code,
              parentcode: pcategory ? pcategory.code : null,
              level: v ? v.level.value : pcategory.level || 1
            }
          }).then(res => {
            helperServ.showModal({
              content: res.result.errMsg
            });
            res.result.success == 1 ? this.reloadCategory() : null;
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
  updCategory: function (v, pcategory, cb) {
    var category = {};
    for (var k in v) {
      category[k] = v[k].value
    }
    category.parentcode = pcategory ? pcategory.code : null;
    cateServ.modCategory({
      catetype:this.catetype,
      category: category
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      res.result.success == 1 ? this.reloadCategory() : null;
      cb(res.result.success == 1 ? null : res);
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message || '未知'
      });
    })
  },
  addCategory: function (v, pcategory, cb) {
    var category = {};
    for(var k in v){
      category[k] = v[k].value
    }
    category.parentcode= pcategory ? pcategory.code : null;
    category.seq= 0;
    if (v.level.value == 1) {
      category.items = [];
    }
    cateServ.addCategory({
      catetype:this.catetype,
      category: category
    }).then(res => {
      helperServ.showModal({
        content: res.result.errMsg
      });
      res.result.success == 1 ? this.reloadCategory() : null;
      cb(res.result.success == 1 ? null : res);
    }).catch(err => {
      cb(err);
      helperServ.showModal({
        content: err.errMsg || err.message || '未知'
      });
    })
  },
  showModDlg: function (e) {
    var idx = e.currentTarget.dataset.index,
      cidx = e.currentTarget.dataset.cindex,
      data = {};
    if (!cidx && cidx !== 0) {
      this.data.category[idx].level = 1;
      this.data.category[idx].status = '1';
      this.showAddDlg(e, this.data.category[idx], "修改分类", null);
    } else {
      var c = this.data.category[idx].items[cidx];
      if (!c) {
        c = {};
        c.code = this.data.category[idx].code + mySeq.prefixZero(cidx, 3);
        c.level = '2';
        c.status = '1';
      }
      this.showAddDlg(e, c, "修改子分类", this.data.category[idx]);
    }
  },
  showAddChildDlg: function (e) {
    var idx = e.currentTarget.dataset.index,
      pcategory = this.data.category[idx], subcategoryid = 0;
    if (pcategory.items && pcategory.items.length > 0) {
      if (!pcategory.items[pcategory.items.length - 1]) {
        subcategoryid = pcategory.code + mySeq.prefixZero(pcategory.items.length, 3);
      } else {
        subcategoryid = pcategory.code + mySeq.prefixZero(parseInt(pcategory.items[pcategory.items.length - 1].code) + 1, 3);
      }
    } else {
      subcategoryid = pcategory.code + "100";
    }

    this.showAddDlg(e, null, "新增子分类", pcategory, subcategoryid);
  },
  showAddDlg: function (e, category, title, pcategory, categoryid) {
    var self = this;
    this.myDlg = this.selectComponent('#modalDlg');
    if (!category && !title && !pcategory && !categoryid) {
      categoryid = mySeq.prefixZero(parseInt(this.data.category[this.data.category.length - 1].code) + 1, 3);
    }
    this.myDlg.showDlg({
      title: title ? title : '新增分类',
      inputlist: {
        "parentcode": {
          "id": "parentcode",
          "name": "父分类ID",
          "hidden": true,
          "type": "i", //信息提示
          "required": pcategory ? "R" : null,
          "value": pcategory ? pcategory.code : null
        },
        "origincode": {
          "id": "origincode",
          "name": "原分类ID",
          "hidden": true,
          "type": "i", //信息提示
          "required": category ? "R" : null,
          "value": category ? category.code : null
        },
        "code": {
          "id": "id",
          "name": "分类ID",
          "type": "1", //信息提示
          "required": "R",
          "label": true,
          "value": category ? category.code : categoryid
        },
        "name": {
          "id": "name",
          "name": "分类名称",
          "label": true,
          "type": "0",
          "required": "R",
          "value": category ? category.name : null
        },
        "level": {
          "id": "level",
          "disabled": pcategory ? true : false,
          "name": "级别",
          "label": true,
          "type": "3",
          "required": "R",
          "dictlist": [{
            code: 1,
            name: "父类"
          }, {
            code: 2,
            name: '子类'
          }],
          "value": category ? category.level || (pcategory ? 2 : 1) : (pcategory ? 2 : 1)
        },
        "url": {
          "id": "url",
          "name": "页面",
          "label": true,
          "type": "0",
          "required": "O",
          "value": category ? category.url : null
        },
        "params": {
          "id": "params",
          "name": "页面参数",
          "label": true,
          "type": "0",
          "required": "O",
          "value": category ? category.params : null
        },
        "img": {
          "id": "img",
          "name": "图标",
          "label": true,
          "type": "0",
          "required": "O",
          "value": category && category.img ? category.img : 'icon-settings'
        },
        "status": {
          "id": "status",
          "name": "状态",
          "label": true,
          "type": "3",
          "required": "O",
          "dictlist": this.data.dict["100012"],
          "value": category ? category.status : 1
        },
        "summary": {
          "id": "summary",
          "name": "备注",
          "type": "9",
          "required": "O",
          "length": 200,
          "label": false,
          "value": category ? category.summary : null,
          "placeholder": '备注'
        }
      },
      btntext: [category ? '删除' : '取消', '确认'],
      submit: (e, cb) => {
        if (!category && e.btnindex === 0) {
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
            if (category) {
              self.updCategory(e.inputlist, pcategory, cb);
            } else {
              self.addCategory(e.inputlist, pcategory, cb);
            }
          } else {
            self.delCategory(e.inputlist, pcategory, cb);
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
  showCategory: function (e) {
    var self = this;
    var index = e.currentTarget.dataset.index,
      cidx = e.currentTarget.dataset.cindex;
    //console.log('showcategory',e);
    var myDlg = this.selectComponent('#categoryDlg');
    myDlg.showDlg({
      title: '操作分类',
      mask: 'none',
      posi: {
        left: `left:${e.currentTarget.offsetLeft}px`,
        top: `top:${50 + e.currentTarget.offsetTop}px`
      },
      className: 'menu-dialog',
      poptype: "category",
      inputlist: [{
        "id": "mod",
        "text": "修改",
        "togger": (e, category) => {
          self.showModDlg(e);
        }
      },
      {
        "id": "del",
        "text": "删除",
        "togger": (e, category) => {
          self.delCategory(e);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e, category) => { }
      }
      ]
    });
  },
})