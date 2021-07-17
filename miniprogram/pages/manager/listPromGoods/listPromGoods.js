const goodsServ = require('../../../lib/manager/goods.js');
const userServ = require('../../../lib/manager/user.js');
const helperServ = require("../../../lib/utils/helper.js");
const cache = require("../../../lib/utils/cache.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
const promServ = require('../../../lib/manager/prom.js');
const constants = require("../../../lib/comm/constants.js");
Page({

  /**
   * 页面的初始数据
   */
  query: { goodsname: null, status: null },
  opertype:null,
  batch_time: 0,
  tmpArr: [],
  data: {
    dict: {
      100016:null,
      100019:null
    },
    totalNum: 0,
    loadFinish: false,
    inList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.opertype = options.opertype;
    if (this.opertype == constants.OPERTYPE_GOODSINPROM && !options.goodsprom_id){
      helperServ.showModal({content:"商品活动ID不能空"});
      return;
    }
    this.goodsprom_id = options.goodsprom_id;
    cache.getDict(Object.keys(this.data.dict), (err, res) => {
      this.setData({
        dict: res,
        prom_id:options.prom_id,
        promtype: options.promtype,
        addgoods: options.addgoods
      })
      this.loadMore();
    });
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
    this.data.loadFinish = false;
    this.batch_time = 0;
    this.tmpArr = [];
    this.loadMore(true);
  },
  reLoad: function (addgoods) {
    var data = {};
    data['loadFinish']= false;
    data['inList'] = [];
    data['totalNum'] = 0;
    this.batch_time = 0;
    this.tmpArr = [];
    addgoods !== undefined ? data['addgoods'] = addgoods:null;
    this.setData(data);
    this.loadMore(true);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.loadMore();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  oneSelectTap: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.inList,
      data = {};
    if (index !== "" && index != null) {
      var item = list[parseInt(index)];
      item.active = !item.active;
      helperServ.showLoading({title:'处理中...'});
      /**
       *   goods_id,
    goodsprom_id,
    prom_id,
    opertype
       */
      promServ.addPromGoods({ opertype: this.opertype, prom_id: this.data.prom_id, goods_id: item._id, goodsprom_id: this.goodsprom_id}).then(res=>{
        helperServ.showModal({content:res.result.errMsg});
        var data={};
        data[`inList[${index}].active`] = item.active;
        this.setData(data);
        helperServ.hideLoading();
      }).catch(err=>{
        helperServ.showModal({ content: err.errMsg || err.message });
        helperServ.hideLoading();
      });
    }
  },
  delGoods: function (index) {
    helperServ.showModal({
      content: `请确认是否删除【${this.data.inList[index].goodsname}】`,
      success: (res) => {

      }
    });
  },
  goListGoods: function () {
    this.reLoad(!this.data.addgoods);
  },
  queryTogger: function () {
    var myDlg = this.selectComponent('#menuDlg');
    myDlg.hideDlg();
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
          "checkbox": [
            { code: '<100', name: "100元以下" },
            { code: '100~1000', name: "100~1000元" },
            { code: '1000~5000', name: "1000~5000元" },
            { code: '5000~20000', name: "5000~20000元" },
            { code: '20000~50000', name: "20000~50000元" },
            { code: '>50000', name: "50000元以上" }
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
  showMenu: function (e) {
    var self = this,
      index = e.currentTarget.dataset.index,
      x = e.currentTarget.offsetLeft,
      y = e.detail.y;
    if (index > 2 && index == this.data.inList.length - 1) {
      y -= 200;
    }
    var myDlg = this.selectComponent('#menuDlg');
    myDlg.showDlg({
      title: '操作菜单',
      mask: 'none',
      posi: {
        left: `left:${x}px`,
        top: `top:${y}px`
      },
      className: 'menu-dialog',
      poptype: "menu",
      inputlist: [{
        "id": "add",
        "text": "新增",
        "togger": (e, menu) => {
          self.goAddGoods();
        }
      },
      {
        "id": "mod",
        "text": "修改",
        "togger": (e, menu) => {
          helperServ.goToPage("../addGoods/addGoods?goodsno=" + self.data.inList[index].goodsno);
        },
      },
      {
        "id": "del",
        "text": "删除",
        "togger": (e, menu) => {
          self.delGoods(index);
        },
      },
      {
        "id": "show",
        "text": "详情",
        "togger": (e, menu) => {
          helperServ.goToPage("../showGoods/showGoods?goodsno=" + self.data.inList[index].goodsno);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e, menu) => { }
      }
      ]
    });
  },
  /**
   * opertype
   * goods_id,
    goodsno,
    goodsname,
    prom_id,
    promtype,
    promfullname,
    status
   */
  loadMore: function (isPull) {
      pageServ.loadMore(this.data.addgoods ? goodsServ.listGoods:promServ.getPromGoods, {
        opertype: this.opertype,
        prom_id:this.data.prom_id,
        promtype:null,
        promfullname:null,  
        goods_id:null,
        goodsno:null,
        goodsname: this.query.goodsname,
        keywords: this.data.addgoods ?this.query.keywords:null,
        saleprice: this.query.saleprice,
        batch_time: this.batch_time,
        orderby_field: "updatetime",
        orderby_type: "desc",
        status: this.data.addgoods ? this.query.status:null,
      }, isPull, this);
    if (!this.data.addgoods){

    }
  },
})