const favorServ = require("../../lib/services/favor.js");
const helperServ = require("../../lib/utils/helper.js");
const pageServ = require("../../lib/utils/pagehelper.js");
const cache = require("../../lib/utils/cache.js");
const app = getApp();

const pageMap={
  "1": "/pages/goodsDetail/goodsDetail?goodsno=",
  "2":"/pages/shopDetail/shopDetail?shopid=",
  "3":"/act/actiondetail/actiondetail?dataid="
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasTop: false,
    refreshlock: false, //是否禁止下拉刷新
    windowHeight: 0,
    editable: false,
    listData: [],
    batch_time: -1, //-1查询所有，0分页
    statusBarHeight: app.systemInfo.statusBarHeight,
    freshBarSize: pageServ.getRpx(45 + app.systemInfo.statusBarHeight),
    dict:{
      100034:""
    }
  },
  _qryParams: {
    orderby_field: "updatetime",
    orderby_type: "desc"
  },

  onLoad: function (options) {
    if(options.favor_id && options.favor_id.trim() && options.favor_tp){
      this.goTargetPage(options,1);
      return;
    }
    var userInfo = helperServ.getUserInfo();
    if (!userInfo) {
      helperServ.goToPage("../login/login");
      return;
    }
    
    this.refresh();

    cache.getDict(Object.keys(this.data.dict),(err,res)=>{
      if(err){
        return;
      }
      this.setData({
        dict:res
      })
    })
  },
  // 刷新数据
  refresh() {
    this.setData({
      batch_time: -1,
      loadFinish: false
    });
    this.loadMore(this._qryParams, true);
  },
  // 加载更多
  more() {
    this.loadMore(this._qryParams, false);
  },
  loadMore(params, isPull) {
    pageServ.loadMore2("trader", "favor.getFavorList", params, isPull, this, (err, res) => {
      if (err) {
        return;
      }
    });
  },

  onMore(e) {
    var menulist = [{
        "id": "add",
        "text": this.data.editable?"删除":"选择",
        "togger": (e, menu) => {
          if(this.data.editable){
            this._onDel(e);
          }
          this._onEdit(e);
        }
      },
      {
        "id": "del",
        "text": "清空",
        "togger": (e, menu) => {
          this._onClear(e);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e, menu) => {
          if(this.data.editable){
            this._onEdit(e);
          }
        }
      }
    ];
    pageServ.getEleRect("#" + e.currentTarget.id, this, (pos) => {
      pageServ.showMenu(this, {
        title: '',
        menuid: '#myMenu',
        menulist: menulist,
        pos: pos,
        yoffset: 0,
        xoffset: 0,
        ctype: "cover"
      });
    }, null); //end getRect callback
  },
  _onEdit(e) {
    this.setData({
      editable: !this.data.editable
    })
    /*
    if(!this.data.editable){
      this.data.listData.forEach(v=>{
        v.active = false;
      })
    }*/
  },
  _onDel(e) {
    var _ids = this.data.listData.filter(v=>v.active).map(v=>v._id);
    if(_ids.length===0){
      return;
    }
    favorServ.delFavor({
      _ids:_ids
    }).then(res=>{
      if(res.result.success===1){
        this.refresh();
        return;
      } 
      helperServ.showToast({title:res.result.errMsg,icon:"none"});  
    }).catch(err=>{
      helperServ.showToast({title:err.errMsg||err.message,icon:"none"});
    })
  },
  _onClear(e){
    favorServ.clearFavor({}).then(res=>{
      if(res.result.success===1){
        this.refresh();
        return;
      } 
      helperServ.showToast({title:res.result.errMsg,icon:"none"});       
    }).catch(err=>{
      helperServ.showToast({title:err.errMsg||err.message,icon:"none"}); 
    })
  },
  reBack(e) {
    helperServ.goBack();
  },
  onSelect(e) {
    var index = e.currentTarget.dataset.index;
    var data={};
    data[`listData[${index}].active`] = !this.data.listData[index].active;
    this.setData(data);
  },
  onGoPage(e){
    var index = e.currentTarget.dataset.index;
    this.goTargetPage(this.data.listData[index]);
  },
  goTargetPage(options,isDirect){
    var p = pageMap[options.favor_tp];
    if(!p){
      helperServ.showToast({title:`${options.favor_tp} 不存在`,icon:"none"})
      return;
    }
    helperServ.goToPage(p+options.favor_id,isDirect);
    return;
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})