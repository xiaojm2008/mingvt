const goodsServ = require('../../../lib/manager/goods.js');
const userServ = require('../../../lib/manager/user.js');
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
Page({

  /**
   * 页面的初始数据
   */
  query: {
    goodsname: null,
    status: null
  },
  batch_time: 0,
  tmpArr: [],
  data: {
    dict: {
      "100019": null
    },
    totalNum: 0,
    loadFinish: false,
    inList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    cache.getDict(Object.keys(this.data.dict), (err, res) => {
      this.setData({
        dict: res,
        fromflag: options.fromflag
      })
      this.loadMore();
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.data.loadFinish = false;
    this.batch_time = 0;
    this.tmpArr = [];
    this.loadMore(true);
  },
  reLoad: function() {
    this.setData({
      loadFinish: false,
      inList: [],
      totalNum: 0
    })
    this.onPullDownRefresh();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  oneSelectTap: function(e) {
    /*
    var index = e.currentTarget.dataset.index;
    var list = this.data.inList,
      data = {};
    if (index !== "" && index != null) {
      var item = list[parseInt(index)];
      item.active = this.data.roleUser && this.data.roleUser[item.userid] ? !this.data.roleUser[item.userid].active : !item.active;
      this.insertUserRole(item, index);
    }*/
  },
  addCarousel:function(index){
    const goodsno = this.data.inList[index].goodsno;
    goodsServ.addCarousel({goodsno:goodsno}).then(res=>{
      if(res.stats && (res.stats.updated > 0 || res.stats.created > 0)){
        helperServ.showModal({
          content:res.errMsg||res.message
        })
        return;
      }
      helperServ.showModal({
        content:res.result.errMsg||res.message
      })
    }).catch(err=>{
        helperServ.showModal({
          content:err.errMsg||err.message
        })
    })
  },
  delGoods: function(index) {
    helperServ.showModal({
      content: `请确认是否删除【${this.data.inList[index].goodsname}】`,
      success: (res) => {

      }
    });
  },
  goAddGoods: function() {
    helperServ.goToPage("../addGoods/addGoods");
  },
  queryTogger: function() {
    var myDlg = this.selectComponent('#myMenu');
    myDlg.hide();
    var self = this;
    myDlg = this.selectComponent('#modalDlg');
    myDlg.showDlg({
      title: '查询对话框',
      cache: true,
      inputlist: {
        "goodsname": {
          "id": "goodsname",
          "name": "商品名称",
          "type": "0",
          "required": "O",
          "length": 200,
          "label": false,
          "placeholder": '您可以输入商品名称'
        },
        "keywords": {
          "id": "keywords",
          "name": "关键字查询",
          "type": "0",
          "required": "O",
          "length": 200,
          "label": false,
          "placeholder": '您可以输入关键字查询'
        },
        "saleprice": {
          "id": "saleprice",
          "name": "价格",
          "type": "m",
          "required": "O",
          "length": 10,
          "checktype": '0',
          "label": false,
          "checkbox": [{
              code: '<100',
              name: "100元以下"
            },
            {
              code: '100~1000',
              name: "100~1000元"
            },
            {
              code: '1000~5000',
              name: "1000~5000元"
            },
            {
              code: '5000~20000',
              name: "5000~20000元"
            },
            {
              code: '20000~50000',
              name: "20000~50000元"
            },
            {
              code: '>50000',
              name: "50000元以上"
            }
          ],
          "placeholder": '您可以选择价格区间查询'
        },
        "status": {
          "id": "status",
          "name": "状态",
          "label": false,
          "type": "3",
          "required": "O",
          "dict": "dict",
          "dictlist": 100019
        },
      },
      btntext: ['查询'],
      submit: (e, cb) => {
        try {
          this.query.goodsname = e.inputlist.goodsname.value;
          this.query.status = e.inputlist.status.value;
          this.query.keywords = e.inputlist.keywords.value;
          this.query.saleprice = e.inputlist.saleprice.value;
          this.reLoad();
          cb();
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    });
  },
  showMenu: function(e) {
    var pos = {},
      index = e.currentTarget.dataset.index;
    pos.scrollTop = 0;
    pos.left = e.touches[e.touches.length - 1].clientX;
    pos.bottom=e.touches[e.touches.length - 1].clientY;
    var menulist = [{
      "id": "add",
      "text": "设置首页轮播",
      "togger": (e, menu) => {
        this.addCarousel(index);
      }
    },{
        "id": "add",
        "text": "新增",
        "togger": (e, menu) => {
          this.goAddGoods();
        }
      },
      {
        "id": "mod",
        "text": "修改",
        "togger": (e, menu) => {
          helperServ.goToPage("../addGoods/addGoods?goodsno=" + this.data.inList[index].goodsno);
        },
      },
      {
        "id": "del",
        "text": "删除",
        "togger": (e, menu) => {
          this.delGoods(index);
        },
      },
      {
        "id": "show",
        "text": "详情",
        "togger": (e, menu) => {
          helperServ.goToPage("../showGoods/showGoods?goodsno=" + this.data.inList[index].goodsno);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e, menu) => {}
      }
    ];
    pageServ.showMenu(this, {
      title: '操作菜单',
      menuid: '#myMenu',
      menulist: menulist,
      pos: pos,
      yoffset: 0,
      xoffset: 0,
      ctype: "view"
    });
  },
  loadMore: function(isPull) {
    pageServ.loadMore(goodsServ.listGoods, {
      goodsname: this.query.goodsname,
      keywords: this.query.keywords,
      saleprice: this.query.saleprice,
      batch_time: this.batch_time,
      orderby_field: "updatetime",
      orderby_type: "desc",
      status: this.query.status,
    }, isPull, this);
  },
})