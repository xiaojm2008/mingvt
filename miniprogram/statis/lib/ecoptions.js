var pie_option = (title) => {
  const option = {
    title: {
      text: '某站点用户访问来源',
      subtext: '纯属虚构',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
    },
    series: [
      {
        name: '访问来源',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [
          { value: 335, name: '直接访问' },
          { value: 310, name: '邮件营销' },
          { value: 234, name: '联盟广告' },
          { value: 135, name: '视频广告' },
          { value: 1548, name: '搜索引擎' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  return option;
}
var bar_option = (title)=>{
  var option = {
    title: {
      text: title,
      x: 'center'
    },
    //color: ['#37a2da', '#32c5e9', '#67e0e3'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { // 坐标轴指示器，坐标轴触发有效
        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
      },
      confine: true
    },
    /*
    legend: {
      data: ['家属', '小孩', '总人数']
    },*/
    legend: {
      data: [],//['家属', '小孩', '总人数'],
      x: 'center',
      padding: 30,
      textStyle: {
        color: '#000',
      }
    },
    grid: {
      left: 20,
      right: 20,
      bottom: 15,
      top: 40,
      containLabel: true
    },
    xAxis: [{
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    }],
    yAxis: [{
      type: 'category',
      axisTick: {
        show: false
      },
      data: [],//['家属', '小孩', '总人数'],
      axisLine: {
        lineStyle: {
          color: '#999'
        }
      },
      axisLabel: {
        color: '#666'
      }
    }],
    series: [{
      name: '',
      type: 'bar',
      color: ['#3398DB'],
      /*
      label: {
        normal: {
          show: true,
          position: 'inside'
        }*/
      label: {
        normal: {
          position: 'inside',
          show: true,
          color: '#000',
        },
        color: '#000',
      },
      data: [],
      itemStyle: {
        // emphasis: {
        //   color: '#37a2da'
        // }
      }
    }]
  };
  return option;
}
var bar2_option = (title, subtext)=>{
  var option = {
    title: {
      text: title,
      subtext: subtext
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: []//['订单金额', '订单数量']
    },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    calculable: true,
    xAxis: [
      {
        type: 'category',
        data: []//['1月', '2月', '3月', '4月', '5月']
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '蒸发量',
        type: 'bar',
        data: [],//[2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3],
        /*markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' }
          ]
        }*/
      },
      {
        name: '降水量',
        type: 'bar',
        data: [],//[2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3],
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
  };
  return option;
}
module.exports = {
  bar2_option: bar2_option,
  bar_option:bar_option,
  pie_option:pie_option
};