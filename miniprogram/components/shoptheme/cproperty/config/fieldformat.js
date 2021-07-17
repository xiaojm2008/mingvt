var fieldFormat = {
  "navitype": {
    "id": "navitype",
    "name": "选择数据源",
    "type": "m",
    "required": "R",
    "value":"",/* this.attrs && this.attrs['navitype'] || '',*/
    "length": 10,
    "checktype": '0', //单选
    "out": '1', //value类型字符
    "label": false,
    "prompt":null, /*this.attrs && this.attrs['prompt'] || '',*/
    "checkbox": [{
        code: '1',
        name: "类别"
      },
      {
        code: '2',
        name: "商品列表"
      },
      {
        code: '3',
        name: "网络"
      }
    ],
    "event": {
      "togger": "navitype"
    },
    "placeholder": '请点击下方选择'
  },
  "datasource": {
    "id": "datasource",
    "name": "数据源",
    "type": "m",
    "required": "R",
    "disabled":true,
    "value": null,/* this.attrs && this.attrs['navitype'] || '',*/
    "length": 10,
    "checktype": '1', //多选
    "label": true,
    "checkbox": null
  },
  "category": {
    "seq": 0,
    "id": "category",
    "name": "分类选择",
    "label": true,
    "type": "i",
    "value": null,
    "required": "R",
    "placeholder": "",
    "prompt": null,
    "event": {
      "type": "tap",
      "name": "分类选择",
      "togger": "category"
    }
  },
  "action": {
    "seq": 1,
    "id": "action",
    "name": "接口服务",
    "label": true,
    "type": "0",
    "value": "",
    "required": "R"
  },
  "manager": {
    "seq": 2,
    "id": "manager",
    "name": "功能模块",
    "label": false,
    "type": "m",
    "checktype": '0', //单选
    "out": "1", //输出字符串trader，非数组['trader']
    "value": "",
    "required": "R",
    "checkbox": [{
        "code": "trader",
        "name": "交易模块"
      },
      {
        "code": "manager",
        "name": "管理模块"
      }
    ]
  }
}

module.exports = fieldFormat;