var helperServ = require("../../lib/utils/helper.js");
var commentServ = require("../../lib/services/comment.js");
// cache = require("../../lib/utils/cache.js");
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    projectid:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    commentNums: [],
    commentList: [],
    commentUserImg: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getCommentList: function (projectid) {
      commentServ.getCommentList({
        batch_time: 0,
        goodsno: projectid,
        commenttype: '1',
        page_size: 4
      }).then(res => {
        this.setData({
          commentNums: res.result.totalNums || [],
          commentList: res.result.data
        })
      }).catch(err => { });
    },
    goToCommentPage:function(e){
      helperServ.goToPage("/components/comment/commentList/commentList?goodsno=" + this.data.projectid + "&commenttype=" + e.currentTarget.dataset.commenttype||'');
    },
    giveHumbsup: function () {

    },
    makeCommentOn: function (inputlist) {

    },
    showCommentDlg: function () {
      var self = this;
      this.myDlg = this.selectComponent('#modalDlg2');
      this.myDlg.showDlg({
        title: '评论',
        inputlist: {
          "makecomment": {
            "id": "makecomment",
            "name": "备注",
            "type": "9",
            "focus":true,
            "required": "R",
            "length": 200,
            "placeholder": '请输入您评论',
          }
        },
        btntext: ['发表'],
        submit: (e,cb) => {
          try {
            if (!e.inputlist) {
              cb('e');
              return;
            }
            self.makeCommentOn(e.inputlist);
          } catch (err) {
            helperServ.showModal({
              content: err.message || err.errMsg
            })
          }
        }
      });
    },
    showImages:function(e){
      var picpath = this.data.commentList[parseInt(e.currentTarget.dataset.index)].imgs;
      helperServ.previewImg(picpath, parseInt(e.currentTarget.dataset.imgidx));
    }
  },
  observers: {
    'projectid': function (projectid) {
      if (!projectid) {
        /*
        var clientcfg = app.getClientCfg();
        if(clientcfg && clientcfg.DEBUG){
          projectid = "100000000001";
        }else{
          return;
        }*/
        return;
      }
      this.getCommentList(projectid);
    }
  }
})
