const goodsServ = require('../../../lib/manager/goods.js');
const userServ = require('../../../lib/manager/user.js');
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
Page({

  /**
   * 页面的初始数据
   */
  selMap: {},
  selCount: 0,
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
        dict: res
      })
      this.loadMore();
    });
    this.init();
  },
  init: function() {
    var prePage = helperServ.getPrePage(),
      options = prePage.options,
      selList = {};
    if (options.selectedArr) {
      options.selectedArr.forEach(v => {
        selList[v.goodsno] = true;
        this.selMap[v.goodsno] = v;
      });
      this.selCount = options.selectedArr.length;
    } else {
      this.selCount = 0;
    }
    this.setData({
      selList: selList
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
  goToPage: function(e) {
    helperServ.goToPage(e.currentTarget.dataset.page);
  },
  oneSelectTap: function(e) {
    var prePage = helperServ.getPrePage();
    var options = prePage.options;
    var index = e.currentTarget.dataset.index;
    var goods = this.data.inList[index];
    var data = {}; 
    if (this.data.selList[goods.goodsno]) {
      data[`inList[${index}].active`] = false;
      data[`selList.${goods.goodsno}`] = false;
      goods.active = false;
    } else{
      data[`inList[${index}].active`] = !goods.active;
      data[`selList.${goods.goodsno}`] = !goods.active;
    }
    this.setData(data);
    if (!goods.active) {
      if (this.selCount > 0) {
        --this.selCount
      }
      delete this.selMap[goods.goodsno];
    } else {
      if (options.maxlength > this.selCount) {
        ++this.selCount;
        this.selMap[goods.goodsno] = {
          goodsno: goods.goodsno,
          goodsname: goods.goodsname,
          quantity: goods.quantity,
          picpath: goods.picpath,
          price: goods.price
        };
      }
      if (options.maxlength <= this.selCount) {
        options.selectedArr = Object.values(this.selMap);
        options.nextPageCallBack ? options.nextPageCallBack(null, options.selectedArr) : null;
        helperServ.goBack();
      }
    }
  },
  queryTogger: function() {
    var myDlg = this.selectComponent('#modalDlg');
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
          "name": "价格区间",
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