import * as echarts from '../../ec-canvas/echarts';
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require("../../../lib/utils/pagehelper.js");
const rpc = require("../../../lib/utils/rpc.js");
//const dict = require("../../../lib/utils/cache.js").dict(true);
const cache = require("../../../lib/utils/cache.js");
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.systemInfo.statusBarHeight,
    loadFinish: 0,
    hidden:true,
    rate: 1.5,
    windowHeight: 200
  },
  setting: null,
  options: null,
  echart: null,
  /**
   * 
   * @param {statstype} options 
   */
  onLoad: function (options) {
    pageServ.setWinHgh(this, 0, "windowHeight");
    this.options = options;
    this.initForm(options);
  },
  initForm: function (options) {
    rpc.doAction({
      funcid: options.funcid,
      actionid: options.actionid
    }, "cfg.getActionCfg", "statis").then(res => {
      if (res.result.success) {
        this.setting = res.result.data;
        this.setData({
          loadFinish: true
        })
        //this.showEchart(res.result.data.option);
        return;
      }
      helperServ.showToast({
        title: res.result.errMsg,
        icon: 'none'
      })
    });
  },
  reBack(e) {
    helperServ.goBack();
  },
  onSetting() {
    this.setData({
      hidden:true
    })
    var myDlg = this.selectComponent('#modalDlg');
    myDlg.showDlg({
      title: '报表配置',
      cache: true,
      poptype: "snake",
      inputlist: this.setting.form,
      btntext: ['取消', '确认'],
      submit: (e, cb) => {
        try {
          /*
          if(e.btnindex==0){
            cb();
            return;
          }*/
          var params = {};
          for (var k in e.inputlist) {
            if (k == 'groupby') {
              params[k] = e.inputlist[k].value.map(v => {
                var dictitem = this.getValueOptions(v);
                return {
                  value: v,
                  checktype:dictitem.checktype,
                  type:dictitem.type,
                  name: dictitem.name,
                  options: dictitem.option
                }
              })
            } else {
              params[k] = {
                value: e.inputlist[k].value,
                name: e.inputlist[k].name
              };
            }
          }
          this.createEchart(params);
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
  getValueOptions(code) {
    var groupby = this.setting.form.find(v => v.id == 'groupby');
    var dictlist = groupby.dictlist;
    var dictitem = dictlist.find(v => v.code == code),
      dict = dictitem.options,
      options = null;
    if (typeof dict == 'number') {
      options = cache.getDict([dict], (err, res) => {
        if (err) {
          return;
        }
      });
      return {
        checktype:dictitem.checktype,
        type:dictitem.type,
        option: options[dict],/**可能的值 */
        name: dictitem.name
      };
    }

    return {
      checktype:dictitem.checktype,
      type:dictitem.type,
      name: dictitem.name,
      option: dict.map(v => {
        return {
          code: v.code,
          name: v.name
        }
      })
    }
  },
  createEchart(params) {
    this.setData({
      hidden:false
    })
    /**不不知到为啥要在这里先初始化 */
    this.showEchart(this.setting.option);    
    rpc.doAction({
      actionid: this.options.actionid,
      funcid: this.options.funcid,
      params: params
    }, this.options.action, this.options.manager /*"action.general", "statis"*/ ).then(res => {
      if (res.result.success) {     
        //this.showEchart(this.setting.option); 这样写第二次才能显示ECHART
        this.echart.setOption(res.result.option);
        return;
      }
      helperServ.showToast({
        title: res.result.errMsg,
        icon: 'none'
      })
    });
  },

  showEchart: function (option) {
    var data = {},
      self = this;
    data["ec"] = {
      onInit: function (canvas, width, height) {
        const _chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        canvas.setChart(_chart);
        _chart.on('tap', (params) => {
          console.log(params);
        });
        _chart.setOption(option);
        /*
        _chart.showLoading({
          text: "加载中..."
        });*/
        self.echart = _chart;
        return _chart;
      }
    }
    this.setData(data);
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '通用统计',
      path: this.route,
      success: function () {},
      fail: function () {}
    }
  },
  goToPage: function (e) {
    var page = e.currentTarget.dataset.page;
    helperServ.goToPage(page);
  }
})