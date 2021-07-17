var funclist = [{
  id: "general",
  name: "通用报表",
  style: {
    icon: "icon-linear",
    class: "",
  },
  option: "general",
  form: "general",
  transfer: "general",
  url: "/statis/act/general/general",
  action: "action.general",
  manager: "statis"
}]

var options = {
  general: {
    title: {
      text: "通用统计",
      //textfor:["$groupby[0].name","","分类统计"],
      textfor:["按${groupby[0].name}统计",""],
      subfor: ["$begindate.value", "$enddate.value", "/"],
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      vfor: null,
      data: null, //['订单金额', '订单数量']
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
      axisLabel: {
        interval: 0,
        rotate: 40,
        textStyle: {
          "fontSize": 14
        }
      },
      //vfor: "100006",
      vfor: "y",
      data: null //['1月', '2月', '3月', '4月', '5月']
    }],
    xAxis: [{
      type: 'value',
      axisLabel: {
        interval: 0,
        rotate: 30,
        formatter: '{value} ',
        textStyle: {
          "fontSize": 14
        }
      },
    }],
    series: [
      {
        name: '人数',
        type: 'bar',
        vfor: "series",
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
}

var forms = {
  general: [{
      "id": "begindate",
      "name": "开始日期",
      "type": "d",
      "required": "O",
      "length": 200,
      "label": true,
      "placeholder": '开始日期'
    },
    {
      "id": "enddate",
      "name": "结束日期",
      "type": "d",
      "required": "O",
      "length": 200,
      "label": true,
      "placeholder": '结束日期'
    },
    /*
    {
      "id": "gender",
      "name": "性别",
      "type": "m",
      "required": "O",
      "length": 10,
      "checktype": '0',
      "label": true,
      "checkbox": null,
      "dictlist":100015,
      "dict":"dict",
      "placeholder": '性别'
    },*/
    /*
    {
      "id": "separator",
      "name": "分组属性",
      "type": "i",
      "required": "O",
      "placeholder": '分组属性'
    },*/
  ]
}
var transfer = {
  general: {
    vfor: [
      //["name", "$_id", "@dictTrans"],
      ["y", "$_id[0].name"],
      ["x",null],
      ["series","$count"]
    ],
    sort: "series"
  }
}
module.exports = {
  funclist: funclist,
  options: options,
  forms: forms,
  transfer:transfer
}