import * as echarts from '../ec-canvas/echarts';
const statisView = require('../lib/month.js');
const transfer = require('../lib/transfer.js');

const helperServ = require("../../lib/utils/helper.js");
const pageServ = require("../../lib/utils/pagehelper.js");
const rpc = require("../../lib/utils/rpc.js");
//const dict = require("../../lib/utils/cache.js").dict(true);

Page({
  /**
   * 页面的初始数据
   */
  data: {

  },

  init: function (options) {
    var statsAction = statisView[options.statstype];
    if(!statsAction){
      helperServ.showModal({
        content:options.statstype+":统计类型不存在"
      })
      return;
    }

    statsAction = JSON.parse(JSON.stringify(statsAction));
    statsAction.initOption = statisView[options.statstype].initOption;

    var data = {};
    data["ec"] = {
      onInit: function (canvas, width, height) {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height
        });
        canvas.setChart(chart);
        chart.on('tap', (params) => {
          console.log(params);
        });
        chart.setOption(statsAction.option);
        statsAction.echarts = chart;
        statsAction.echarts.showLoading({
          text: "加载中..."
        });
        return chart;
      }
    }
    this.setData(data)

    rpc.doAction(statsAction.params, statsAction.action, statsAction.manager).then(res => {
      statsAction.echarts.hideLoading();
      if (res.result.list) {
        transfer(res.result, statsAction);
        statsAction.echarts.setOption(statsAction.option);
      } else {
        helperServ.showToast({
          icon: "none",
          title: res.result.errMsg || "返回异常"
        });
      }
    }).catch(err => {
      helperServ.showToast({
        icon: "none",
        title: err.errMsg || err.message
      });
    });
  },

  /**
   * 
   * @param {statstype} options 
   */
  onLoad: function (options) {
    pageServ.setWinHgh(this, 0, "windowHeight");
    this.init(options);
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
      title: '报名统计',
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
