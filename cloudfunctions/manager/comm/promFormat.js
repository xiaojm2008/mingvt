module.exports = {
  name: '活动基本信息',
  type: 'object',
  required: 'R',
  item: {
    "create_userid": {
      type: "string",
      name: '创建用户名'
    },
    "shopid": {
      type: "string",
      name: '店铺ID',
      required: 'R',
      value: 'S0000'
    },
    "shopname": {
      type: "string",
      name: '店铺名称',
      required: 'R'
    },
    "promtype": {
      "type": "string",
      "name": "活动类型",
      "required": "R"
    },
    "promno": {
      type: "string",
      name: '活动NO',
      required: 'R',
      value: 'S0000'
    },
    "promfullname": {
      type: "string",
      name: '活动全名',
      required: 'R'
    },
    "promname": {
      type: "string",
      name: '活动名',
      required: 'R'
    },
    "preparebegtime": {
      type: "array",
      name: '活动预热时间',
      required: 'O',
      item: {
        name: '活动预热时间',
        type: 'string',
        required: 'R'
      }
    },
    "preparebegtime_dt": {
      name: '活动预热时间',
      type: "transfer",
      value: ["$preparebegtime", "", " ", "@date"]
    },
    "limittimeflag": {
      type: "string",
      name: '活动是否时间限制',
      required: 'O'
    },
    "begtime": {
      type: "array",
      name: '活动开始时间',
      required: 'O',
      item: {
        name: '活动开始时间',
        type: 'string',
        required: 'R'
      },
      condition: "limittimeflag=='1'"
    },
    "begtime_dt": {
      name: '活动开始时间',
      type: "transfer",
      value: ["$begtime", "", " ", "@date"] 
      //把begtime:["2019-12-30","08:30"]数组转换为以" "分隔的字符串"2019-12-30 08:30",并且调用date方法转换为日期DATE格式。
    },
    "endtime": {
      type: "array",
      name: '活动结束时间',
      required: 'O',
      item: {
        name: '活动结束时间',
        type: 'string',
        required: 'R'
      },
      condition: "limittimeflag=='1'"
    },
    "endtime_dt": {
      name: '活动结束时间',
      type: "transfer",
      value: ["$endtime", "", " ", "@date"]
    },
    "promamt": {
      name: '活动价',
      type: 'number',
      required: 'O'
    },
    "promqty": {
      name: '活动限量',
      type: 'number',
      required: 'O'
    },
    "marqueeshow": {
      name: '是否走马灯',
      type: 'boolean',
      required: 'O'
    },
    "prompic": {
      name: '活动主题图片',
      type: 'array',
      required: 'O',
      max_len: 4,
      item: {
        name: '图片对象',
        type: 'object',
        required: 'R',
        item: {
          "fileID": {
            name: '图片ID',
            type: 'string',
            required: 'R'
          }
        }
      }
    },
    "prominfo": {
      type: "string",
      name: '活动描述信息',
      required: 'R'
    },
    "status": {
      type: "string",
      name: '状态',
      required: 'O'
    }
  }
}