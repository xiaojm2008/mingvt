const helperServ = require("../../lib/utils/helper.js");
const pageServ = require("../../lib/utils/pagehelper.js");
const cache = require("../../lib/utils/cache.js");
const advertServ = require("../../lib/services/advert.js");
const showDetail = require("../../components/template/enrolllist/enrolllist.js").showDetail;
const app = getApp();
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
    dict: {
      100015: 0
    }
  },
  _qryParams: {
    orderby_field: "updatetime",
    orderby_type: "desc"
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    var userInfo = helperServ.getUserInfo();
    if (!userInfo) {
      helperServ.goToPage("../login/login");
      return;
    }
  
    this.refresh();

    cache.getDict(Object.keys(this.data.dict), (err, res) => {
      if (err) {
        return;
      }
      this.setData({
        dict: res
      })
    })
  },
  onReady(){
    pageServ.getSystemInfo({
      success: (res) => {
        this.setData({
          "windowHeight": res.windowHeight-65
        })
      }
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
    pageServ.loadMore2("trader", "action.getEnrollInfoList", params, isPull, this, (err, res) => {
      if (err) {
        return;
      }
    });
  },

  onMore(e) {
    var menulist = [{
        "id": "export",
        "text": "导出文件",
        "togger": (e, menu) => {
          this._expFile(e);
        },
      },
      {
        "id": "report",
        "text": "图表统计",
        "togger": (e, menu) => {
          this._goStatis(e);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e, menu) => {
          if (this.data.editable) {
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
        maxWidth: 150,
        xoffset: 0,
        ctype: "cover"
      });
    }, null); //end getRect callback
  },

  _goStatis(e) {

  },

  reBack(e) {
    helperServ.goBack();
  },
  goToPage(e){
    helperServ.goToPage(e.currentTarget.dataset.page);
  },
  onGoPage(e) {
    var index = e.currentTarget.dataset.index;
    this.goTargetPage(this.data.listData[index]);
  },
  goTargetPage(options, isDirect) {
    var p = pageMap[options.favor_tp];
    if (!p) {
      helperServ.showToast({
        title: `${options.favor_tp} 不存在`,
        icon: "none"
      })
      return;
    }
    helperServ.goToPage(p + options.favor_id, isDirect);
    return;
  },
  getErollInfo(e) {
    return this.data.listData[e.currentTarget.dataset.index];
  },
  getPageParams(enrollinfo){
    var params = "?enrollid=" + enrollinfo._id + "&actionid="+enrollinfo.actionid+"&actionname="+(enrollinfo.actionname||this.actioninfo.actionname)
    +"&cover="+(enrollinfo.cover||'')+"&imginfo="+(enrollinfo.imginfo||'');
    return params;
  },
  onCheck(e){
    var enrollinfo = this.getErollInfo(e);
     /**apprflag : 审批状态100038 0待审核，1pass 2dispass不通过*/
    helperServ.showLoading();
    actionServ.doEnrollCheck({
      enrollid:enrollinfo._id,
      apprflag:e.currentTarget.dataset.apprflag}).then(res=>{
        helperServ.hideLoading();
        helperServ.showToast({
          title:res.result.errMsg,
          icon:'none'
        })
        if(res.result.success){
          this.refresh();
        }
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({
        content:err.errMsg
      })
    })
  },
  _setStatus(enrollinfo,status){
    /** 1:有效，9:删除*/
    helperServ.showLoading();
    actionServ.doEnrollStatus({
      enrollid:enrollinfo._id,
      enrollstatus:status}).then(res=>{
        helperServ.hideLoading();
        helperServ.showModal({
          content:res.result.errMsg
        })
        if(res.result.success){
          this.refresh();
        }
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({
        content:err.errMsg
      })
    })
  },
  onDel(e){
    var enrollinfo = this.getErollInfo(e);
    var status = e.currentTarget.dataset.enrollstatus;
    if(status=='9'){
      helperServ.showModal({
        content:"请确认是否删除",
        success:(ok)=>{
          if(ok.confirm){
            this._setStatus(enrollinfo,status);
          }
        }
      })
    } else {
      this._setStatus(enrollinfo,status);
    }
  },
  onMod(e){
    var enrollinfo = this.getErollInfo(e);
    helperServ.goToPage("/act/enrollform/enrollform"+this.getPageParams(enrollinfo));
  },
  onDetail(e){
    var enrollinfo = this.getErollInfo(e);
    return showDetail(enrollinfo,this);
  },
  showMenu(e) {
    var pos = {},
      enrollinfo = this.getErollInfo(e);
    pos.scrollTop = 0;
    pos.left = e.touches[e.touches.length - 1].clientX;
    pos.bottom = e.touches[e.touches.length - 1].clientY;
    var menulist = [{
        "id": "add",
        "text": "详情",
        "togger": (e1, menu) => {
            this.onDetail(e);
        }
      },
      {
        "id": "mod",
        "text": "修改",
        "togger": (e1, menu) => {
          this.onMod(e);
        },
      },
      {
        "id": "del",
        "text": "删除",
        "togger": (e1, menu) => {
          e.currentTarget.dataset.enrollstatus='9';
          this.onDel(e);
        },
      },
      {
        "id": "cancel",
        "text": "取消",
        "togger": (e1, menu) => {}
      }
    ];
    pageServ.showMenu(this, {
      title: '操作菜单',
      menuid: '#myMenu',
      menulist: menulist,
      maxWidth: 180,
      pos: pos,
      yoffset: 0,
      xoffset: 0,
      ctype: "cover"
    });
  },

  onSearch(e) {
    var myDlg = this.selectComponent('#myMenu');
    myDlg.hide();
    myDlg = this.selectComponent('#modalDlg');
    myDlg.showDlg({
      title: '查询对话框',
      cache: true,
      inputlist: [{
          "id": "text",
          "name": "姓名或昵称",
          "type": "0",
          "required": "O",
          "length": 20,
          "label": true,
          "placeholder": '报名人的姓名或昵称'
        },
        {
          "id": "phone",
          "name": "电话号码",
          "type": "0",
          "required": "O",
          "length": 20,
          "label": true,
          "placeholder": '报名人的联系电话'
        },
        {
          "id": "regdate",
          "name": "报名日期",
          "type": "d",
          "required": "O",
          "length": 200,
          "label": true,
          "placeholder": '报名日期'
        },
        {
          "id": "gender",
          "name": "性别",
          "type": "m",
          "required": "O",
          "length": 10,
          "checktype": '0',
          "label": false,
          "checkbox": this.data.dict[100015],
          "placeholder": '性别'
        },
        {
          "id": "enrollstatus",
          "name": "记录状态",
          "type": "m",
          "required": "O",
          "length": 1,
          "checktype": '0',
          "label": false,
          "checkbox":this.data.dict[100040],// [{code:"1",name:"正常有效记录"},{code:"9",name:"已删除"}],
          "placeholder": '记录状态'
        },
        {
          "id": "apprflag",
          "hidden": !this.actioninfo.apprflag,
          "name": "审核状态",
          "type": "m",
          "required": "O",
          "length": 10,
          "checktype": '0',
          "label": false,
          "checkbox": this.data.dict[100038],
          "placeholder": '审核状态'
        },
        {
          "id": "paystatus",
          "hidden": this.actioninfo.feetype != "1",
          "name": "支付状态",
          "type": "m",
          "required": "O",
          "length": 10,
          "checktype": '1',
          /**多选*/
          "label": false,
          "checkbox": this.data.dict[100035],
          "placeholder": '支付状态'
        },
        {
          "id": "siginstatus",
          "name": "签到状态",
          "type": "m",
          "required": "O",
          "length": 10,
          "checktype": '1',
          /**多选*/
          "label": false,
          "checkbox": this.data.dict[100036],
          "placeholder": '签到状态'
        }
      ],
      btntext: ['查询'],
      submit: (e, cb) => {
        try {
          for (var k in e.inputlist) {
            this._qryParams[k] = e.inputlist[k].value;
          }
          /*
          this._qryParams.text = e.inputlist.text.value;
          */
          this.refresh();
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})