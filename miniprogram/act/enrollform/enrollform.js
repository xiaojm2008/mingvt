//const app = getApp()
const helperServ = require("../../lib/utils/helper.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const actionServ = require("../../lib/services/action.js");
Page({

  /**
   * 页面的初始数据
   */
  actionid: null,
  enrollid: null,
  data: {
    enrollform: null,
    imginfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!options.actionid) {
      helperServ.showModal({
        content: "参数错误，点击【确认】返回",
        success: (ok) => {
          if (ok.confirm) {
            helperServ.goBack();
          }
        }
      })
      return;
    }
    this.actionid = options.actionid;
    this.enrollid = options.enrollid || '';

    this.userInfo = helperServ.getUserInfo();
    console.log("userinfo:"+JSON.stringify(this.userInfo));
    if(!this.userInfo){
      helperServ.goToPage("/pages/login/login",1);
      return;
    }
    if(!this.userInfo.basedir || !this.userInfo.basedir.trim()){
      helperServ.showModal({content:"请先注册登陆哦",success:(ok)=>{
        helperServ.goToPage("/pages/myCenter/myCenter",1);
        return;
      }})
      return;
    }
    /*
    this.setData({
      'userinfo.shopinfo': userInfo.shopinfo,
      'userinfo.avatarurl': userInfo.avatarurl,
      'userinfo.username': userInfo.username || userInfo.nickname,
      'userinfo.phone': userInfo.phone
    })*/

    /**获取活动的报名表单 */
    actionServ.getEnrollForm({
      actioninfo:1,
      actionid: options.actionid
    }).then(res => {
      if (!res.result.data) {
        helperServ.showModal({
          content: res.result.errMsg
        })
      }
      var enrollform = res.result.data.enrollform;
      this.ernrollaction = res.result.data.enrollaction;
      //100039 0:"启动",1:"暂停",2:"结束",9:"删除"
      if(this.ernrollaction =='1'){
        helperServ.showModal({
          content: "活动已经暂停"
        })
        return;
      } else if(this.ernrollaction =='2'){
        helperServ.showModal({
          content: "活动已经结束"
        })
        return;
      }else if(this.ernrollaction =='9'){
        helperServ.showModal({
          content: "活动已经删除"
        })
        return;
      }
      enrollform["gender"]&&(enrollform["gender"].value=this.userInfo.gender||'');
      enrollform["phone"]&&(enrollform["phone"].value=this.userInfo.phone||'');
      enrollform["username"]&&(enrollform["username"].value=this.userInfo.username||'');
      enrollform["nickname"]&&(enrollform["nickname"].value=this.userInfo.nickname||'');
      //enrollform["province"]&&(enrollform["province"]=userInfo.province||'');
      //enrollform["city"]&&(enrollform["city"]=userInfo.city||'');

      this.setData({
        actionname: decodeURIComponent(options.actionname),
        imginfo: options.imginfo ? decodeURIComponent(options.imginfo) : null,
        //cover:options.imginfo ? decodeURIComponent(options.cover) : null,
        enrollform: enrollform
      })
      
      /**获取我的报名信息 */
      helperServ.showLoading({title:"信息加载中..."});
      actionServ.getEnrollInfoDetail({
        enrollid: options.enrollid || "",
        actionid: options.actionid
      }).then(res => {
        helperServ.hideLoading();
        if (!res.result.data) {
          return;
        }
        var enrollinfo = res.result.data;
        for (var k in this.data.enrollform) {
          this.data.enrollform[k].value = enrollinfo[k];
        }
        this.setData({
          enrollform: this.data.enrollform
        })

      }).catch(err => {
        helperServ.hideLoading();
        helperServ.showModal({
          content: res.errMsg || err.message
        })
      })

    }).catch(err => {
      helperServ.showModal({
        content: res.errMsg || err.message
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 不需要 bind:togger="inputTogger2"
   */
 /*
  inputTogger2: function (e) {
    var dataid = e.currentTarget.dataset.id,
      fieldData = pageServ.getData(dataid, this);
     
    if (!fieldData[e.detail.field.id]) {
      return;
    }
    if (!e.detail.field.type) {
      fieldData[e.detail.field.id].value = e.detail.field.value;
    } else {
      fieldData[e.detail.field.id].text = e.detail.field.value;
    }
  },*/

  getEnrollInfo: function (cb) {
    var myEnroll = this.selectComponent('#myEnroll');
    helperServ.showLoading({
      title: "图片上传中...."
    });

    myEnroll.setCloudPath(this.ernrollaction.basedir);

    myEnroll.upLoadFile((err, res) => {
      helperServ.hideLoading();
      if (err) {     
      
        cb(err, null);
        return;
      }
      var inputlist = myEnroll.getValue();
      if (!inputlist.data) {
        cb(inputlist.errMsg, null);
        return;
      }
      var enrollinfo = {};
      for (var k in inputlist.data) {
        enrollinfo[k] = inputlist.data[k].value;
      }
      cb(null, enrollinfo);
    })
  },

  _save: function (enrollinfo) {

    helperServ.showLoading({
      title: "提交中...."
    });
    enrollinfo.actionid = this.actionid;

    actionServ.addEnrollInfo({
      enrollid: this.enrollid,
      enrollinfo: enrollinfo
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.success === 1) {
        helperServ.showModal({
          content: res.result.errMsg,
          success: (ok) => {
            if (ok.confirm) {
              helperServ.goBack();
            }
          }
        });
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      });
    })
  },
  save: function (e) {
    this.getEnrollInfo((err, enrollnfo) => {
      if (err) {
        //helperServ.hideLoading();
        helperServ.showToast({
          title: err,
          icon: 'none'
        });
        return;
      }
      this._save(enrollnfo);
    });
  }
})