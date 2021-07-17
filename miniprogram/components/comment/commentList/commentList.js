const pageServ = require('../../../lib/utils/pagehelper.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refreshsize: 80,
    listData:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._qryParams = {
      batch_time: -1,
      goodsno: options.goodsno,
      commenttype: options.commenttype,
      orderby_field:"settime",
      orderby_by:"desc"
    }
    this.refresh();
  },
  load(e){
    this._qryParams.commenttype = e.currentTarget.dataset.commenttype;
    this.refresh();
  },
  refresh(){
    this.setData({
      batch_time: -1,
      loadFinish: false
    });
    this.loadMore(this._qryParams, true);
  },
  more(){
    this.loadMore(this._qryParams, false);
  },
  showImages: function (e) {
    var picpath = this.data.commentList[parseInt(e.currentTarget.dataset.index)].imgs;
    helperServ.previewImg(picpath, parseInt(e.currentTarget.dataset.imgidx));
  },
  loadMore(params,isPull){
    pageServ.loadMore2("trader", "comment.getCommentList", params, isPull, this, (err, res) => {
      this.setData({
        commentNums: res.result.totalNums || [],
      })
    })
  }
})