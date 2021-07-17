const actionServ = require("../../lib/services/action.js");
const helperServ = require("../../lib/utils/helper.js");
const cache = require("../../lib/utils/cache.js");
const favorServ = require("../../lib/services/favor.js");

Component({
  options:{
    //styleIsolation:'apply-shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    dataid: {
      type: String,
      value: ''
    },
    dataobj: {
      type: Object,
      value: null,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    action: null,
    additionalinfo:{
      isfavor:false,//是否收藏
      favor:0, //我的收藏记录数
      num:1, //报名人数
      isenroll:false //是否报名
    },
    dict: {
      100033:0,
      100032:0,
      100039:0
    }
  },

  lifetimes: {
    created: function() {
      console.log(`action create properties`, this.properties); 
      /**
       * 这里不能放置this.setData()处理
       */
    },
    attached: function() {
      console.log(`action attached`);
      cache.getDict(Object.keys(this.data.dict), (err, res) => {
        if (err) {
          helperServ.showToast({
            title:err,
            icon: 'none'
          })
          return;
        }
        this.setData({
          now:helperServ.dateFormat(new Date(),'yyyy-MM-dd hh mm'),
          dict:res
        })
      }); 
    },
    ready: function() {
      console.log('action ready');
    },
    detached: function() {
      console.log('action detached');
    }
  },
  pageLifetimes: {
    show: function() {
      //页面被展示
      console.log("页面被展示"+this.data.dataid);
      if(!this.data.dataid){
        return;
      }
      this.getAdditional(this.data.dataid);
      this.getEnrollPerson(this.data.dataid);
    }
  },
  methods: {
    goToEnrollList(e){
      //报名人员信息
    },
    goFavor(e){
      //我的收藏
      helperServ.goToPage("/pages/myFavor/myFavor");
    },
    addFavor(e){
      helperServ.showLoading();
      favorServ.addFavor({favor_tp:'3',favor_id:this.data.action._id}).then(res=>{
        helperServ.hideLoading();
        helperServ.showToast({title:res.result.errMsg,icon:'none'});
        if(res.result.success){
          this.setData({
            additionalinfo:{
              isfavor:1,
              favor:this.data.additionalinfo.favor++
            }
          })
        }
      }).catch(err=>{
        helperServ.hideLoading();
        helperServ.showToast({title:err.errMsg||err.message,icon:'none'});
      })
    },
    _showShare0:function(e){
      var fileID= null,action = this.data.action,height=0;
      if(action.picpath && action.picpath.length>0){
        fileID = action.picpath[0].fileID;
        height = action.picpath[0].height;
      } else if(action.imginfo && action.imginfo.length>0){
        fileID =action.imginfo[0].fileID;
        height = action.imginfo[0].height;
      } else {
        helperServ.showModal({content:"未上传海报或者其他活动图片"})
        return;
      }
      var myShare = this.selectComponent("#myShare");
      //"https://7869-xiaovt-818we-1259627454.tcb.qcloud.la/assets/imgs/bg/bg_sea.png?sign=99f83b505db3e6fd2ad865be8e8ccd75&t=1578569956",//
      myShare.show({
        hbheight:500,
        url:'/act/actiondetail/actiondetail?dataid=',
        company:'',
        subname:action.actionname,
        desc:"",
        price:action.feetype==='1'&&action.fee>0 ? ('成人（¥） ' +action.fee):'免费',
        origin_price:action.feetype==='1' && action.feechild>0?('儿童（¥） '+action.feechild):'免费',
        hbimg:{height:height,src:fileID},
        id :action.actionid,
        type:"3",//分享类型：1商品，2店铺，3报名
        content:"",
        summary:'好活动要和朋友一起分享'
      })
    },
    _showShare1:function(e){
      var fileID= null,action = this.data.action,height=0;
      if(action.picpath && action.picpath.length>0){
        fileID = action.picpath[0].fileID;
        height = action.picpath[0].height;
      } else {
        helperServ.showModal({content:"未上传海报或者其他活动图片"})
        return;
      }
      var myShare = this.selectComponent("#myShare");
      myShare.show({
        hbheight:0,
        url:'/act/actiondetail/actiondetail?dataid=',
        company:"",
        subname:"",
        desc:"",
        price:"",
        origin_price:"",
        qrposi:{
          left:15,
          top:15,
          width:80,
          height:80,
        },
        hbimg:{
          height:height,
          src:fileID
        },
        id :action.actionid,
        type:"3",//分享类型：1商品，2店铺，3报名
        content:"",
        summary:''
      })
    },
    showShare:function(e){
      if(this.data.action.shareway=='1'){
        this._showShare1(e);
      } else {
        this._showShare0(e);
      }
    },
    openLocation: function () {
      pageServ.openLocation(this.data.action.latitude, this.data.action.longitude);
    },
    callPhone(e){
      var phones = [];
      if(this.data.action.create_phone){
        phones.push(this.data.action.create_phone+'');
      }
      if(this.data.action.mod_phone&&this.data.action.create_phone!=this.data.action.mod_phone){
        phones.push(this.data.action.mod_phone+'');
      }
      if(phones.length==0){
        helperServ.showToast({title:"未录入电话号码"})
        return;
      }
      helperServ.showActionSheet({
        itemList: phones,
        success:(res)=> {
          console.log(res.tapIndex);
          helperServ.callPhone(phones[res.tapIndex]);      
        },
        fail(res) {
          console.log(res.errMsg)
        }
      })
    },
    openLocation:function(){
      const latitude = this.data.action.actlatitude
      const longitude = this.data.action.actlongitude
      wx.openLocation({
        latitude,
        longitude,
        scale: 18
      });
    },
    getEnrollPerson(dataid){
      actionServ.getEnrollPerson({actionid:dataid,page_size:8,batch_time:0}).then(res=>{
        var person = res.result&&res.result.data ? res.result.data:[]
        this.setData({
          enrollperson:person.map(v=>v.avatarurl)
        })
      }).catch(err=>{

      })
    },
    getAdditional(dataid){
      actionServ.getAdditional({ actionid: dataid}).then(res=>{     
        this.setData({        
          additionalinfo:res.result
        })
      }).catch(err=>{

      })
    },
    transferFmt(action){
     /* action.enrollbegintime = action.enrollbegintime_dt ? helperServ.dateFormat2(action.enrollbegintime_dt,'yyyy-MM-dd hh:mm'):"";
      action.enrollendtime = action.enrollendtime_dt ? helperServ.dateFormat2(action.enrollendtime_dt,'yyyy-MM-dd hh:mm'):"";
      action.actbegintime = action.actbegintime_dt ? helperServ.dateFormat2(action.actbegintime_dt,'yyyy-MM-dd hh:mm'):"";
      action.actendtime = action.actendtime_dt ? helperServ.dateFormat2(action.actendtime_dt,'yyyy-MM-dd hh:mm'):"";
      */
      action.actionstatus = action.status;
      action.enrollbegintime = action.enrollbegintime && action.enrollbegintime.length>0 ? (action.enrollbegintime[0]+" "+(action.enrollbegintime[1]||"")):"";
      action.enrollendtime = action.enrollendtime && action.enrollendtime.length>0 ? (action.enrollendtime[0]+" "+(action.enrollendtime[1]||"")):"";
      action.actbegintime = action.actbegintime && action.actbegintime.length>0 ? (action.actbegintime[0]+" "+(action.actbegintime[1]||"")):"";
      action.actendtime = action.actendtime && action.actendtime.length>0 ? (action.actendtime[0]+" "+(action.actendtime[1]||"")):"";
    },
    getDataObjById: function(dataid) {
      actionServ.getActionDetail({
        actionid: dataid
      }).then(res => {
        console.log("getDataObjById",res);
        var action = res.result.data;
        if(action){
          this.transferFmt(action);
        }
        this.setData({
          action: action
        })
      }).catch(err => {
        helperServ.showToast({
          title: err.errMsg || err.message
        });
      });
      //this.getAdditional(dataid);
    },
    goToEnrollForm(e){      
      var page = "/act/enrollform/enrollform?actionid="+this.data.action.actionid;
      if(this.data.action.imginfo && this.data.action.imginfo.length>0){
        //page += "&imginfo="+encodeURIComponent(JSON.stringify(this.data.action.imginfo.map(v=>{return {fileID:v.fileID,height:v.height}})));
        page += "&imginfo="+ this.data.action.imginfo[0].fileID;
      }
      page += "&actionname="+encodeURIComponent(this.data.action.actionname);
      helperServ.goToPage(page);
    }
    /*
    giveHumbsup:function(){

    },
    makeCommentOn:function(comment){

    },
    showCommentDlg:function(){
      var self = this;
      this.myDlg = this.selectComponent('#modalDlg2');
      this.myDlg.showDlg({
        title: '评论对话框',
        poptype:'input',
        inputlist: {
          "makecomment": {
            "id": "makecomment",
            "name": "",
            "type": "9",
            "required": "R",
            "length": 2000,
            "placeholder": '请输入您评论',
          }
        },
        className:'center-panel',
        btntext: '发表',
        submit: (e) => {
          try {
            self.myDlg.showLoading();
            self.makeCommentOn(e.inputlist.makecomment.value);
          } catch (err) {
            self.myDlg.hideLoading();
            helperServ.showModal({
              content: err.message || err.errMsg
            })
          }
        },
        cancel:(e)=>{

        }
      });
    }*/
  },
  observers: {
    'dataid': function(dataid) {
      console.log('action observers dataid', dataid);
      if(!dataid){
        return;
      }
      this.getDataObjById(dataid);
    },
    'dataobj': function(dataobj) {
      if (!dataobj){
        return;
      }
      console.log('action observers dataobj',dataobj);
      if (typeof dataobj.description == 'string'){
        //console.log('dataobj.description string', dataobj.description);
        //const regex = new RegExp('<img', 'gi');
        //dataobj.description = dataobj.description.replace(regex, `<img style="max-width:100%;vertical-align:top"`);        
      } 
      this.transferFmt(dataobj);
      this.setData({      
        action: dataobj
      })    
    }
  }
})