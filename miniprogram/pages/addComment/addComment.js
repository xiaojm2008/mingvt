// pages/addComment/addComment.js
const orderServ = require("../../lib/services/order.js");
const commentServ = require("../../lib/services/comment.js");
const helperServ = require("../../lib/utils/helper.js");
const pageServ = require("../../lib/utils/pagehelper.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  _id:null,
  data: {
    commentInfo: null,
  },
  upCfg: {
    cloudpath: null,
    compressrate: 10,
    maxcount: 4,
    maxwidth: 640,
    maxheight: 200,
    cutimg: true,
    imgtype: 'jpg'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.userinfo = helperServ.getUserInfo();  
    this.upCfg.cloudpath ="user/"+this.userinfo.openid + "/commment/" ;     
    this.getOrderDetail(options);
  },
  getOrderDetail: function(options) {
    this._id = options._id;
    if(!this._id){
      helperServ.showModal({content:"订单ID空异常"})
      return;
    }
    orderServ.getOrderDetail({
      _id: options._id
    }).then(res => {
      if (res.result.data.length == 0) {
        helperServ.showModal({content:"订单不存在"})
        return;
      }
      var tmp = {};
      //去重
      var commentGoods = res.result.data[0].goods_info.reduce((cur, next) => {
        tmp[next.goodsno+(next.model_id||'')] ? "" : tmp[next.goodsno+(next.model_id||'')] = true && cur.push(
          {
            cover:next.cover,
            goods_id:next.goods_id,//xlh_goods._id
            goodskey:next.goodsno+(next.model_id||''),
            goodsno: next.goodsno,
            goodsname:next.goodsname,
            model_value:next.model_value,
            model_id: next.model_id,
            info: {
              content: '',
              level: 1,
              img_arr: [{
                digest: 1,
                fileID: null,
                name: '图片1',
                width: 800,
                height: 400
              }, {
                digest: 2,
                fileID: null,
                name: '图片2',
                width: 800,
                height: 400
              },
              {
                digest: 3,
                fileID: null,
                name: '图片3',
                width: 800,
                height: 400
              }]
            }
          });
        return cur;
      }, []);
      //console.log("去重",goodsInfo);
      /*
      var commentGoods = [];
      for (var i in goodsInfo) {
        goods.push()
      }*/
      this.setData({
        //goodsInfo: goodsInfo,
        "commentInfo.goods_info": commentGoods
      })
    });
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  setDescScore: function(e) {
    var score = e.target.dataset.score;
    this.setData({
      'commentInfo.desc_score': score
    })
  },
  setLogisticsScore: function(e) {
    var score = e.target.dataset.score;
    this.setData({
      'commentInfo.logistics_score': score
    })
  },
  clickLevelSpan: function(e) {
    var index = e.currentTarget.dataset.index,
      level = e.currentTarget.dataset.level,
      data = {};

    data['commentInfo.goods_info[' + index + '].info.level'] = level;
    this.setData(data);
  },
  commentInput: function(e) {
    var index = e.target.dataset.index,
      data = {};
    data['commentInfo.goods_info[' + index + '].info.content'] = e.detail.value;
    this.setData(data);
  },
  chooseImg: function(e) {
    var initflag = e.currentTarget.dataset.initflag;
    pageServ.chooseImg(e, this, initflag ? this.upCfg : null);
  },
  uploadImg: function (cb) {
    helperServ.showLoading({
      title: '图片上传中...',
    });
    var imgarr = [];
    for (var i in this.data.commentInfo.goods_info) {
      var goods = this.data.commentInfo.goods_info[i];
      for(var j in goods.info.img_arr){
        var img = goods.info.img_arr[j];
        if (img.status != '2' && img.path) {
          imgarr.push(img);
        }
      }
    } 
    pageServ.upLoadFile(imgarr, this.upCfg.cloudpath, cb);
  },

  makeComment: function() {
    var that = this,
    commentInfo = this.data.commentInfo,
      modalText = '';

    for (var i in commentInfo.goods_info) {
      var goods = commentInfo.goods_info[i];
      if (goods.info.content != "" && goods.info.content.length < 10) {
        modalText = '您的评价内容少于10个字哦';
        break;
      }
      if (!goods.info.level) {
        modalText = '您还尚未给商品评分';
        break;
      }

      if (!commentInfo.desc_score || !commentInfo.logistics_score) {
        modalText = '您还尚未物流或商品描叙评分';
        break;
      }

      if (goods.info.img_arr.length > 3) {
        modalText = '您对每个商品最多只能上传3张图片';
        break;
      }
    }
    var user = helperServ.getUserInfo();
    
    commentInfo.avatarurl = user.avatarurl;
    commentInfo.nickname = user.nickname;
    commentInfo._id = this._id;
    if (modalText) {
      wx.showModal({
        content: modalText
      })
      return;
    }
    this.uploadImg((err,res)=>{   
      if (!res.success) {
        helperServ.showModal({
          content: err
        });
        return;
      }
      
      commentInfo.goods_info.forEach(v=>{
        var tmp = [];
        v.info.img_arr.forEach(cur=>{
          if(cur.fileID){
            tmp.push(cur.fileID);
          }
        })
        v.info.img_arr = tmp;
      })

      helperServ.showLoading({title:"正在提交评论..."});
      commentServ.addComment(commentInfo).then(res => {
        helperServ.hideLoading();
        helperServ.showModal({
          content: res.result.errMsg,
        })
        if(res.result.success){
          helperServ.goBack();
        }
      }).catch(err=>{
        helperServ.hideLoading();
        helperServ.showModal({
          content: err.errMsg||err.message,
        })
      });
    });
  }
})