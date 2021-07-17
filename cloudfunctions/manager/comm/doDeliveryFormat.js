module.exports = {
  name: '预约揽件',
  type: 'object',
  required: 'R',
  item: {
    "order_id": {
      type: "string",
      name: '订单号',
      length: 32,
      fixed: 1,
      required: "R"
    },
    "shopid": {
      type: "string",
      name: '商铺ID',
      length: 32,
      required: "R"
    },
    "data": {
      name: '预约揽件请求',
      type: 'object',
      required: 'R',
      item: {
        "ordercode": {
          type: "string",
          name: '预约揽件订单号',
          length: 64,
          required: "R"
        },
        "shippercode": {
          type: "string",
          name: '快递公司代码',
          length: 64,
          required: "R"
        },
        "shippername": {
          type: "string",
          name: '快递公司简称',
          length: 64,
          required: "R"
        },
        "sender": {
          name: '寄件人',
          type: 'object',
          required: 'R',
          item: {
            "company": {
              type: "string",
              name: '寄件公司',
              length: 256,
              required: "O"
            },
            "username": {
              type: "string",
              name: '寄件人姓名',
              length: 256,
              required: "R"
            },
            "phone": {
              type: "string",
              name: '寄件人电话号码',
              length: 20,
              required: "R"
            },
            "province": {
              type: "string",
              name: '寄件人省份',
              length: 100,
              required: "R"
            },
            "city": {
              type: "string",
              name: '寄件人城市',
              length: 100,
              required: "R"
            },
            "area": {
              type: "string",
              name: '寄件人区（县）',
              length: 100,
              required: "R"
            },
            "detail": {
              type: "string",
              name: '寄件人详细地址',
              length: 100,
              required: "R"
            }
          }
        },
        "receiver": {
          name: '收件人',
          type: 'object',
          required: 'R',
          "company": {
            type: "string",
            name: '收件人公司',
            length: 256,
            required: "O"
          },
          "username": {
            type: "string",
            name: '收件人姓名',
            length: 256,
            required: "R"
          },
          "phone": {
            type: "string",
            name: '收件人电话号码',
            length: 20,
            required: "R"
          },
          "province": {
            type: "string",
            name: '收件人省份',
            length: 100,
            required: "R"
          },
          "city": {
            type: "string",
            name: '收件人城市',
            length: 100,
            required: "R"
          },
          "area": {
            type: "string",
            name: '收件人区（县）',
            length: 100,
            required: "R"
          },
          "detail": {
            type: "string",
            name: '收件人详细地址',
            length: 100,
            required: "R"
          }
        },
        "addservice": {
          name: '增值服务',
          type: 'array',
          required: 'O',
          item: {
            name: '增值服务信息',
            type: 'object',
            required: 'R',
            item: {
              "name": {
                type: "string",
                name: '增值服务名',
                length: 100,
                required: "R"
              },
              "value": {
                type: "string",
                name: '增值服务代码',
                length: 4,
                value: "1020",
                required: "R"
              }
            }
          }
        },
        "weight": {
          type: "number",
          name: '订单总重量',
          length: 20,
          required: "O"
        },
        "num": {
          type: "number",
          name: '包裹数量',
          length: 10,
          required: "O"
        },
        "volumn": {
          type: "number",
          name: '包裹体积',
          length: 10,
          required: "O"
        },
        "remark": {
          type: "string",
          name: '其他信息',
          length: 200,
          required: "O"
        }
      }
    }
  }
}