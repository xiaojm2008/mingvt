const app = getApp()
const helperServ = require("../../lib/utils/helper.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const cache = require("../../lib/utils/cache.js");
const flows = require("../../lib/comm/createActionFlow.js")
const V = require('../../lib/utils/validate.js');
const actionServ = require("../../lib/services/action.js");

//const mixed = require("../../lib/services/mixed.js");
//const mySeq = require("../../lib/utils/mySeq.js");
//const upimg = require("../../lib/utils/upimg.js");
//const constants = require("../../lib/comm/constants.js");
const restore = require("../../lib/utils/restore.js");
Page({

  /**
   * 页面的初始数据
   */
  /*{
   "name": "报名要素",
   "fieldid": "enrollinfo",
   "require": "R",
   "type": "object",
   "item": {
     "fieldid": "enrollitem",
     "require": "R",
     "type": "array",
     "item": {

     }
   }*/
  aspectInFunc: [null, null, null, null, null, null], //nextStep中执行
  aspectFunc: [null, null, null, null, null, null], //nextStep中执行
  preAspectFunc: [null, null, null, null, null, null], //preStep中执行
  preAspectFuncBefore: [null, null, null, null, null, null], //preStep中执行
  data: {
    bOperBtnShow: true, //是否隐藏下一步上一步按钮
    activeIndex: 0, //flow组件中的被激活的步骤
    toggerDisabled: false, //flow 组件不可触发点击事件
    flows: null,
    actionid: null,
    actioninfo: {}, //活动信息
    enrollform: {}, //录入表单字段
    windowHeight: 0,
    windowWidth: 0,
    /*
    upCfg: {
      cloudpath: null,
      compressrate: 10,
      maxcount: 4,
      maxwidth: 640,
      maxheight: 200,
      cutimg: true,
      imgtype: 'jpg'
    },*/
    /**
     *  "100033":[
        {"code": "0", "name": "团建活动", "desc": "活动类型"},
        {"code": "1", "name": "体验活动"},
        {"code": "2", "name": "赞助活动"},
        {"code": "3", "name": "广告活动"},
        {"code": "4", "name": "预约报名"},
        {"code": "5", "name": "社交交友"},
        {"code": "6", "name": "问卷调查"}
      ],
     */
    feeAction03:{
      "0":1,
      "1":1,
      "2":1,
      "3":1
    },
    current: 0, //swiper控件中的当前swiper-item
    dict: null
  },
  inputTogger: function (e) {
    pageServ.inputTogger(e, this);
  },
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
  },
  flowTogger: function (e) {
    this.setData({
      activeIndex: e.detail.index
    })
  },
  /**
   * 表单字段配置
   */
  sortTogger: function (e) {
    var dataid = e.currentTarget.dataset.id,
      fieldData = pageServ.getData(dataid, this);
    fieldData[e.detail.sortfield.src.id].seq = e.detail.sortfield.src.seq;
    fieldData[e.detail.sortfield.target.id].seq = e.detail.sortfield.target.seq;
    //fieldData = e.detail.sort.data;
    console.log(`sortTogger posi:
  ${e.detail.sortfield.src.id}:${fieldData[e.detail.sortfield.src.id].seq} <-> ${e.detail.sortfield.target.id}:${fieldData[e.detail.sortfield.target.id].seq}`);

  },
  sortEnrollTap: function (e) {
    var data = {},
      sortenroll = e.currentTarget.dataset.sortenroll; //enrollformSort: !this.data.enrollformSort
    data[sortenroll] = !this.data[sortenroll];
    this.setData(data);
  },
  showParameterDlg: function (e) {
    var id = e.currentTarget.id,
      type = e.currentTarget.dataset.type,
      parameter = {},
      dataItem = pageServ.getData(id, this),
      data = {};
    if (Array.isArray(dataItem)) {
      for (var i in dataItem) {
        parameter[dataItem[i].id] = dataItem[i];
      }
    } else {
      parameter = dataItem;
    }
    this.setData({
      parameterType: type
    })
    var myDlg = this.selectComponent('#parameterDlg');
    myDlg.showDlg({
      title: '新增对话框',
      enrollinfo: parameter || {},
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        if (e.btnindex == 0) {
          cb(null);
          return;
        } else {
          if (e.enrollinfo) {
            for (var k in e.enrollinfo) {
              if (parameter && parameter[k]) {
                e.enrollinfo[k].value = parameter[k].value;
              }
            }
            data[id] = e.enrollinfo;
            this.setData(data)
          }
          cb(null);
        }
      },
    });
  },
  /**
   * end of 表单字段配置
   */

  previewImg: function (e) {
    var img = e.currentTarget.dataset.src;
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: this.data.actioninfo.imginfo.map(v => v.fileID || v.path) // 需要预览的图片http链接列表
    })
  },
  chooseLocation: function () {
    var self = this;
    helperServ.showLoading();
    app.chooseLocation((res) => {
      helperServ.hideLoading();
      console.log("chooseLocation", res);
      self.setData({
        "actioninfo.actaddress": res.address || "",
        "actioninfo.actlatitude": res.latitude || 0,
        "actioninfo.actlongitude": res.longitude || 0
      });
    });
  },

  delImg: function (e, cb) {
    pageServ.delImg(e, this, cb);
  },
  chooseImg: function (e) {
    var initflag = e.currentTarget.dataset.initflag;
    pageServ.chooseImg(e, this, initflag ? this.data.upCfg : null);
  },

  _preStep: function (e) {
    this.setData({
      activeIndex: this.data.activeIndex - 1
    });
    var v = this.preAspectFunc[this.data.activeIndex];
    if (v) {
      console.log(`inStep${this.data.activeIndex}Call`)
      v.call(this).then(res => {
        console.log(`inStep${this.data.activeIndex}Call return`, res);
      });
    } else {
      console.log(`direct inStep${this.data.activeIndex}`)
    }
  },
  preStep: function (e) {
    console.log(`preStep activeIndex= ${this.data.activeIndex}`)
    var v1 = this.preAspectFuncBefore[this.data.activeIndex];
    if (v1) {
      v1.call(this).then(res => {
        this._preStep(e);
      });
    } else {
      this._preStep(e);
    }
  },
  nextStep: function (e) {
    //console.log('step', this.aspectFunc[this.data.activeIndex])
    if (this.aspectFunc[this.data.activeIndex]) {
      console.log(`outStep${this.data.activeIndex}Call`)
      var v = this.aspectFunc[this.data.activeIndex].call(this);
      v.then(res => {
        console.log(`outStep${this.data.activeIndex}Call return`, res);
        this.setData({
          activeIndex: this.data.activeIndex + 1
        });
      });
    } else {
      console.log(`direct outStep${this.data.activeIndex}`)
      this.setData({
        activeIndex: this.data.activeIndex + 1
      });
    }
  },
  /* end of img handle */
  //退出第1（索引0:基本信息配置）步,进入（索引1）
  outStep0Call: function () {
    return new Promise((resolve, reject) => {
      restore.setActionBaseInfo(this.data.actionid, this.data.actioninfo);

      var field = V.V(this.actFormat.act, this.data.actioninfo, "actioninfo", this.data.actioninfo, this.data.actioninfo, null);
      this.data.focusSet = {};
      if (field) {
        this.data.focusSet[helperServ.subStrByPos(field.path, 2)] = true;
        //console.log('*********V.V*********', field, helperServ.subStrByPos(field.path, 2))
        helperServ.showToast({
          title: field.errMsg,
          icon: 'none'
        });
      } else {
        resolve({
          success: 1
        });
      }
      this.setData({
        "focusSet": this.data.focusSet
      });
    });
  },
  //退出第2（索引1）步DOING
  outStep1Call: function () {
    return new Promise((resolve, reject) => {
      this.selectComponent('#myEditor').getContents({
        success: (res) => {
          if (res.delta) {
            //app.setAppCache(constants.APPCACHE_EDITOR_CONTENTS, res.delta);
            //app.setAppCache(constants.APPCACHE_EDITOR_HTML, res.html);
            this.data.actioninfo.description = res.delta;
            this.data.actioninfo.description2 = res.html;
            resolve({
              success: true
            });
            console.log('outStep1Call call get description', res.delta);
          }
        },
        fail(err) {
          helperServ.showModal({
            content: err.errMsg
          });
          resolve({
            success: false
          });
        }
      });
    });
  },
  //退出第3（索引2:字段配置）步,进入（索引3：：报名字段位置调整组件）
  /*outStep2Call: function () {
    return new Promise((resolve, reject) => {
      restore.setEnrollInfo(this.data.actionid, restore.toEnrollArr(this.data.enrollinfo));
      resolve({
        success: true
      });
      console.log(`outStep2Call call `)
    });
  },
  
  //退出第4（索引3：：报名字段位置调整）步，进入预览（第5步）
  outStep3Call: function () {
    return new Promise((resolve, reject) => {
      var data = {};
      data['dataobj'] = this.data.actioninfo;  //预览  
      this.setData(data);
      resolve({
        success: true
      });
      console.log(`outStep3Call call `)
    });
  },
  //第4（索引3：报名字段位置调整）步返回第3（索引2：字段配置）步DOING前调用
  inStep3CallBefore: function () {
    return new Promise((resolve, reject) => {
      var enrollinfo = this.selectComponent('#myEnroll').getValue();
      //刷新 enroll组件，排序生效
      this.setData({
        enrollinfo: enrollinfo
      })
      resolve({
        success: true
      });
    });
  },*/
  /*
  inStep1Call:function(){
    var self = this;
    return new Promise((resolve, reject) => {
      this.selectComponent('#myEditor').getContents({
        success(res) {
          if (res.delta) {

          }
        }
      })
    });
  },*/
  /*
  //第5（索引4：预览）步返回第4（索引3）步后调用
  inStep3Call: function() {
    return new Promise((resolve, reject) => {
      //刷新 enroll组件，排序生效
      this.setData({
        enrollinfo: this.data.enrollinfo
      })
      resolve({
        success: true
      });
    });
  },*/
  uploadImg: function (cb) {
    helperServ.showLoading({
      title: '图片上传中...',
    });
    var imgarr = [];
    Array.prototype.push.apply(imgarr, this.data.actioninfo.imginfo);
    Array.prototype.push.apply(imgarr, this.data.actioninfo.picpath);

    var basedir = null;
    if(this.data.actioninfo.actionid){
      basedir = this.data.actioninfo.basedir;
    } else {
      basedir = this.userInfo.basedir + "action/" + `new_${helperServ.curDate()}/`;
    }
    pageServ.upLoadFile(imgarr, basedir, cb);
  },

  _save: function () {
    helperServ.showLoading();
    var actionName = null;
    //description2 不用提交
    this.data.actioninfo.description2 ? delete this.data.actioninfo.description2 : null;
    if (this.data.actionid) {
      actionName = actionServ.modAction;
    } else {
      actionName = actionServ.createAction;
    }
    actionName({
      actioninfo: this.data.actioninfo,
      enrollform: this.data.enrollform
    }).then(res => {
      helperServ.hideLoading();
      if (res.result.success) {
        helperServ.showModal({
          content: res.result.errMsg,
          success: (res2) => {
            if (res2.confirm) {
              //helperServ.goToPage("../action/action?dataid=" + res.result.dataid);
              helperServ.goBack();
            } else if (res2.cancel) {
              console.log('用户点击取消')
            }
          }
        });
      } else {
        helperServ.showModal({
          content: res.result.errMsg
        });
      }
    }).catch(err => {
      helperServ.showModal({
        content: err.errMsg || err.result.errMsg
      });
    });
  },

  save: function (e) {
    this.uploadImg((err, res) => {
      helperServ.hideLoading();
      if (!res.success) {
        helperServ.showModal({
          content: err
        });
        return;
      }
      this._save();
      //完成标志
      restore.setActionComplete(this.data.actionid, true);
    })
  },
  initAction:function(options){
    if (options.dataid) {
      actionServ.getActionDetail({
        actionid: options.dataid
      }).then(res => {
        if (res.result.data) {
          var actioninfo = res.result.data;
          //mod by xiaojm at 20200214
          //信息存储配置目录：userInfo.basedir=P350000/350700/ounQF5gNI1fojHjR6JnyBekJpowQ/
          //"basedir":"shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000"（shop+userinfo.region+openid+shopid）
          //this.data.upCfg.cloudpath = actioninfo.basedir;
          
          //delta格式 for editor component
          restore.setEditorDelta(options.dataid, actioninfo.description);
          delete actioninfo.description; //删除
          delete actioninfo.description2;
          //console.log('',actioninfo);
          this.setData({
            actionid: options.dataid,
            actioninfo: actioninfo,
          })
          //restore.setActionBaseInfo(options.dataid, actioninfo);
          //this.upimg.initImgInfoData(actioninfo.imginfo);
        }
      });
      actionServ.getEnrollForm({
        actionid: options.dataid
      }).then(res => {
        if (res.result.data) {
          var enrollform = res.result.data.enrollform || {};
          this.setData({
            enrollform:enrollform
          })
          //this.initTemplateFieldSelective(enrollinfo, this.data.templateField);
          //restore.setEnrollInfo(options.dataid, restore.toEnrollArr(enrollform));
        }
      });
    } else {
       //"P350000/350700/ounQF5gNI1fojHjR6JnyBekJpowQ/action/ACT00000000/
      //actioninfo.basedir = userInfo.basedir+"action/"+actioninfo.actionid+"/";
      //信息存储配置目录：userInfo.basedir=P350000/350700/ounQF5gNI1fojHjR6JnyBekJpowQ/
      //"basedir":"shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000"（shop+userinfo.region+openid+shopid）
      //this.data.upCfg.cloudpath = userInfo.basedir + "action/" + `new_${helperServ.curDate()}/`;
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    actionServ.actFormat({}).then(res => {
      this.actFormat = res.result;
    });

    var userInfo = helperServ.getUserInfo();
    if (!userInfo.openid || !userInfo.basedir) {
      helperServ.showModal({
        content: "您需要重新认证个人信息！",
        success:(ok)=>{
          helperServ.goToPage("/pages/login/login");
        }
      });
      return;
    }
    
    this.userInfo = userInfo;

    //var template = cache.fieldTemplate();

    this.setData({
      dict: cache.dict(),
      flows: flows.createActionFlow
      //templateField: template
    });
    this.initAction(options);
    /*
    restore.restoreAction(options.dataid, (err, res, origdataid) => {
      if (res == 1) {
        options.dataid = origdataid;
      }
      this.initAction(options);
    });
    */
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })

    //this.aspectInFunc[1] = this.inStep1Call; //退出第1（索引0）步DOING
    this.aspectFunc[0] = this.outStep0Call;
    this.aspectFunc[1] = this.outStep1Call; //退出第2（索引1）步DOING
    //this.aspectFunc[2] = this.outStep2Call; //退出第3（索引2）步DOING
    //this.aspectFunc[3] = this.outStep3Call; //退出第4（索引3）步DOING
    //this.preAspectFunc[3] = this.inStep3Call; //第5（索引4）步返回第4（索引3）步后调用
    //this.preAspectFuncBefore[3] = this.inStep3CallBefore; //第4（索引3）步返回第3（索引2）步DOING前调用
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  showFeeCfgDlg:function(){
    if(this.data.actioninfo.feetype != '1'){
      return;
    }
    var fields = pageServ.toValues(this.data.enrollform).filter(v=>{
      if(('1'==v.type||'2'==v.type||'3'==v.type)&& v.required){
        return true;
      }
    }).map(v=>{
      return {name:v.name,id:v.id};
    });
    if(fields.length===0){
      return;
    } 

    var symbols=[{name:'+',id:'+',op:'1'},
    {name:'-',id:'-',op:'1'},
    {name:'*',id:'*',op:'1'},
    {name:'/',id:'/',op:'1'},
    {name:'回退',id:'D',op:'1'},
    {name:'清除',id:'C',op:'1'}];

    if(this.data.actioninfo.fee>0){
      symbols.push({name:this.data.actioninfo.fee,value:this.data.actioninfo.fee,id:'fee'})
    }
    if(this.data.actioninfo.feechild>0){
      symbols.push({name:this.data.actioninfo.feechild,value:this.data.actioninfo.feechild,id:'feechild'})
    }

    fields = symbols.concat(fields);

    var myDlg = this.selectComponent('#modalDlg');
    myDlg.showDlg({
      title: '费用计算公式编辑',
      cache: true,
      poptype:'arithmet',
      animationShow:1,
      inputlist: {fields:fields,expression:this.data.actioninfo.expression},
      btntext: ['确定'],
      submit: (e, cb) => {
        try {
          this.setData({
            "actioninfo.expression":e.inputlist.expression
          })
          cb();
        } catch (err) {
          cb(err);
          helperServ.showModal({
            content: err.message || err.errMsg
          })
        }
      }
    })
  },
  hideBottomOperBtn: function (e) {
    console.log('hideBottomOperBtn', e);
    this.setData({
      bOperBtnShow: e.detail.show
    })
  }
})

/*
var self = this;
var tasks = [];
this.aspectFunc.forEach((v, i) => {
  if (v) {
    tasks.push(v.call(this));
  }
});
Promise.all(tasks).then(res => {
  if (res.find((v, i, a) => !v.success)) {
    return;
  }
  this._save();
}).catch(err => {
  helperServ.showModal({ content: err.errMsg || err.message });
})*/
/*
  onPageScroll: function (e) {
    let _this = this;
    wx.createSelectorQuery().select('#index').boundingClientRect(function (rect) {
      if (e.scrollTop >= rect.height - 555) {
        //已离底部一段距离，下面处理操作
      }
    }).exec()
    this.setData({
      scrollTop:e.scrollTop
    })
},*/

/*
  chooseImg: function(e) {
    this.upimg.chooseImg(e, (err,imginfo,all) => {
      //console.log('upImg.chooseImg',imginfo);
    })
  },
  delImg: function(e) {
    this.upimg.delImg(e.currentTarget.dataset.index);
  },
    submit: function () {
    var errMsg = "",
      tasks = [];
    return new Promise((resolve, reject) => {
      this.upimg.imginfo.forEach((v, i, arr) => {
        if (v.status !== '2') {
          tasks.push(this.upimg.uploadFile(v, i, arr));
        }
      });
      if (tasks.length == 0) {
        resolve({
          success: true
        });
      }
      helperServ.showLoading({
        title: "正在上传图片..."
      });
      Promise.all(tasks).then(res => {
        this.setData({
          current: 0,
          'actioninfo.imginfo': this.upimg.imginfo
        });
        helperServ.hideLoading();
        var bErr = res.find((v, i, a) => v.status != '2');
        if (bErr) {
          errMsg = "存在未能成功上传的图片，请重试";
          helperServ.showModal({
            content: errMsg
          })
          resolve({
            success: false,
            errMsg: errMsg
          });
        } else {
          resolve({
            success: true
          });
        }
      }).catch(err => {
        errMsg = err ? err.errMsg || err.message : "上传图片失败";
        //helperServ.showModal({ content: errMsg });
        this.setData({
          current: 0,
          'actioninfo.imginfo': this.upimg.imginfo
        });
        reject({
          success: false,
          errMsg: errMsg
        });
        helperServ.hideLoading();
      });
    })
  },

    initAction2: function (options) {
    restore.setActionComplete(options.dataid, false);
    var actioninfo = restore.getActionBaseInfo(options.dataid);
    var delta = restore.getEditorDelta(options.dataid);
    console.log('restore.getEditorDelta', delta);
    if (actioninfo && delta) {
      var data = {};
      data['actioninfo'] = actioninfo;
      if (options.dataid) {
        data['actionid'] = options.dataid;
      }
      this.setData(data);
      //restore.setEditorDelta(options.dataid, delta);      
      //this.upimg.initImgInfoData(actioninfo.imginfo);
    } else {
      if (options.dataid) {
        actionServ.getActionDetail({
          actionid: options.dataid
        }).then(res => {
          if (res.result.data) {
            actioninfo = res.result.data;
            //delta格式 for editor component
            restore.setEditorDelta(options.dataid, actioninfo.description);
            delete actioninfo.description; //删除
            delete actioninfo.description2;
            //console.log('',actioninfo);
            this.setData({
              actionid: options.dataid,
              actioninfo: actioninfo,
            })
            restore.setActionBaseInfo(options.dataid, actioninfo);
            //this.upimg.initImgInfoData(actioninfo.imginfo);
          }
        });
      }
    }
    var enrollform = null;
    var enrollArr = restore.getEnrollInfo(options.dataid);
    if (enrollArr && enrollArr.length > 0) {
      restore.setEnrollInfo(options.dataid, enrollArr);
      enrollform = {};
      enrollArr.forEach((v, i) => {
        v.seq = i;
        enrollform[v.id] = v;
        enrollform[v.id].focus = false;
      });
      //this.initTemplateFieldSelective(enrollinfo, this.data.templateField);
    } else {
      if (options.dataid) {
        actionServ.getEnrollForm({
          actionid: options.dataid
        }).then(res => {
          if (res.result.data) {
            enrollform = res.result.data.enrollform || {};
            this.setData({
              enrollform:enrollform
            })
            //this.initTemplateFieldSelective(enrollinfo, this.data.templateField);
            restore.setEnrollInfo(options.dataid, restore.toEnrollArr(enrollform));
          }
        });
      }
    }
  },
  */