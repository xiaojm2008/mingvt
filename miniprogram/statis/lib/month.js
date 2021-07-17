const dict = require("../../lib/utils/cache.js").dict(true);
var ecoptions = require("./ecoptions.js");

var statisAction = {
  income_stats: {
    title: {
      textfor: null,
      subfor: ["begdate", "enddate", "/"],
    },
    option3: {
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        vfor: "100006",
        data: null //['未付款', '待收发货', '已成交', '退款', '取消']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: ['未付款', '待收发货', '已成交', '退款', '取消']
      },
      series: [{
          name: '未付款',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [320]
        },
        {
          name: '待收发货',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [120, 132, 101]
        },
        {
          name: '已成交',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [220, 182, 191]
        },
        {
          name: '退款',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [150, 212]
        },
        {
          name: '取消',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'insideRight'
          },
          data: [820]
        }
      ]
    },
    option1: {
      title: {
        text: "订单统计",
        subtext: null,
        left: 'center'
      },

      tooltip: {
        trigger: 'item',
        formatter: '{a} \r\n{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        vfor: null,
        data: ['订单金额', '订单数量']
      },
      series: [{
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        name: '订单金额',
        vfor: [
          ["value", "$total_pay"],
          ["name", "$name"]
        ],
        data: null, //[{value: 335,name: '直接访问'}],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    },
    option: {
      title: {
        text: "订单统计",
        subtext: null
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        vfor: null,
        data: ['订单金额', '订单数量']
      },
      /*
      toolbox: {
        show: true,
        feature: {
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },*/
      calculable: true,
      yAxis: [{
        type: 'category',
        //vfor: "100006",
        vfor: "name",
        axisLabel: {
          interval: 0,
          rotate: 40,
          textStyle: {
            "fontSize": 14
          }
        },
        data: null //['1月', '2月', '3月', '4月', '5月']
      }],
      xAxis: [{
        type: 'value',
        axisLabel: {
          interval: 0,
          rotate: 30,
          formatter: '{value} 元',
          textStyle: {
            "fontSize": 14
          }
        },
      }],
      series: [{
          name: '订单金额',
          type: 'bar',
          vfor: "total_pay",
          label: {
            normal: {
              position: 'right',
              show: true,
              textStyle: {
                "fontSize": 14
              }
            }
          },
          data: null,
          /*
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },*/
          /*
          markLine: {
            data: [
              { type: 'average', name: '平均值' }
            ]
          }*/
        },
        {
          name: '订单数量',
          type: 'bar',
          vfor: "count",
          data: null,
          /*markPoint: {
            data: [
              { name: '年最高', value: 182.2, xAxis: 7, yAxis: 183 },
              { name: '年最低', value: 2.3, xAxis: 11, yAxis: 3 }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均值' }
            ]
          }*/
        }
      ]
    },
    transfer: [
      //["name", "$_id", "@dictTrans"],
      ["name", "$name"],
      ["total_pay", "$total_pay", "@toFixed"],
      ["count", "$count"]
    ], //['家属', '小孩', '总人数'],
    sort: "total_pay",
    /*
    legend: {
      fmt: "",
      data: ['订单金额', '订单数量']
    },
    yAxis: {
      fmt: "name",
      data: "100006"
    },
    series: [{
      fmt: "total_pay",
      name: '订单金额',
      type: 'bar',
      data: null
    }, {
      fmt: "count",
      type: 'bar',
      name: '订单数量',
      data: null
    }],*/
    action: "rpt.income",
    manager: "statis",
    params: {},
    dictkey: "100006",
    dict: {
      "9100000": [{
        '1': '按日'
      }, {
        '2': '按周'
      }, {
        '3': '按月'
      }, {
        '4': '季'
      }, {
        '5': '年'
      }]
    },
    statstype: "income_stats",
    echarts: null
  },
  dealbymonth: {
    title: {
      textfor: null,
      subfor: ["year", "", "年"],
    },
    option: {
      title: {
        text: "月成交统计",
        subtext: null,
        left: 'left'
      },
      /*
      tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
      },*/
      legend: {
        data: ['剩余', '成交', '提现']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'value',
        axisLabel: {
          interval: 0,
          rotate: 40,
          textStyle: {
            "fontSize": 14
          }
        },
      }],
      yAxis: [{
        type: 'category',
        axisTick: {
          show: false
        },
        axisLabel: {
          interval: 0,
          rotate: 40,
          textStyle: {
            "fontSize": 14
          }
        },
        vfor:"name",
        data: null
      }],
      series: [{
          name: '剩余',
          type: 'bar',
          label: {
            show: true,
            position: 'inside'
          },
          vfor:"remains_amt",
          data:null
        },
        {
          name: '成交',
          type: 'bar',
          stack: '总量',
          label: {
            show: true
          },
          vfor:"total_pay",
          data: null,
        },
        {
          name: '提现',
          type: 'bar',
          stack: '总量',
          label: {
            show: true,
            position: 'inside'
            //position: 'left'
          },
          vfor:"cash_out",
          data: null,
        }
      ]
    },   
    action: "rpt.dealbym",
    manager: "statis",
    params: {},
    dictkey: "",
    statstype: "dealbymonth",
    echarts: null
  },
}

/*
  "100006": [
    {
      "code": "c",
      "name": "取消"
    },
    {
      "code": "0",
      "name": "待付款"
    },
    {
      "code": "1",
      "name": "待发货"
    },
    {
      "code": "2",
      "name": "待收货"
    },
    {
      "code": "3",
      "name": "待评价"
    },
    {
      "code": "4",
      "name": "退款审核中"
    },
    {
      "code": "5",
      "name": "退款中"
    },
    {
      "code": "6",
      "name": "已完成"
    },
    {
      "code": "7",
      "name": "已关闭"
    },
    {
      "code": "8",
      "name": "已删除"
    }
  ],
*/

module.exports = statisAction;