import * as echarts from '../../ec-canvas/echarts';
const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require("../../../lib/utils/pagehelper.js");
const rpc = require("../../../lib/utils/rpc.js");
const dict = require("../../../lib/utils/cache.js").dict(true);

const statisView = require('../../lib/month.js');
const transfer = require('../../lib/transfer.js');
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
    //`${helperServ.toFixed(v.total_pay)}(${v.count})`
    rpc.doAction(statsAction.params, statsAction.action, statsAction.manager).then(res => {
      statsAction.echarts.hideLoading();
      if (res.result.list) {
        transfer(res.result, statsAction);
        /*statsAction.option.legend.data = statsAction.legend.data;
        statsAction.option.yAxis[0].data =  statsAction.yAxis.data;
        statsAction.option.series[0].data =  statsAction.series.data;
        */
        //console.log(`init ${options.statstype}`, statsAction.option);

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
      path: '/pages/echars/echars',
      success: function () {},
      fail: function () {}
    }
  },
  goToPage: function (e) {
    var page = e.currentTarget.dataset.page;
    helperServ.goToPage(page);
  }
})

/*
 [
  { value: 335, name: '直接访问' },
  { value: 310, name: '邮件营销' },
  { value: 274, name: '联盟广告' },
  { value: 235, name: '视频广告' },
  { value: 400, name: '搜索引擎' }
].sort(function (a, b) { return a.value - b.value; }),
*/