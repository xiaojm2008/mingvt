module.exports = {
  name: '店铺基本信息',
  type: 'object',
  required: 'R',
  item: {
    "shopid": {
      type: "string",
      name: "店铺ID",
      length: 32,
      required: "O"
    },
    "maintype": {
      type:"dict",
      dictlist: 100023,
      name: "主体类型",
      required: "R"
    },
    "instoreflag": {
      type: "string",
      name: "实体店标志",
      length: 1,      
      required: "R"
    },
    "shopname": {
      type: "string",
      name: "店铺名称",
      length: 40, 
      required: "R"
    },
    "shortname": {
      type: "string",
      name: "店铺简称",
      length: 20,
      required: "R"
    },
    "longitude": {
      type: "number",
      name: "维度",
      length: 50,
      required: "O"
    },
    "latitude": {
      type: "number",
      name: "经度",
      length: 50,
      required: "O"
    },
    "opentime":{
      type: "string",
      name: "营业时间",
      length: 5,
      required: "R"
    },
    "closetime":{
      type: "string",
      name: "收市时间",
      length: 5,
      required: "R"
    },
    "address": {
      type: "string",
      name: "地址详细信息",
      length: 256,
      condition: "instoreflag==1",
      required: "C"
    },
    "trafficinfo":{
      type: "string",
      name: "交通或标志建筑",
      length: 256,
      required: "O"
    },
    "phone": {
      type: "string",
      name: "手机号码",
      length: 33,
      required: "R"
    },
    "contact":{
      type: "string",
      name: "固定电话",
      length: 33,
      required: "O"
    },
    "credentials": {
      type: 'array',
      force: true,
      name: "资质认证",
      required: "O",
      item:{
        type:"object",
        name:"资质",
        required:"R",
        item:{
          "tempid":{
            type: "number",
            name: "模板ID",
            required: "R"
          },
          "id":{
            type: "string",
            name: "字段ID",
            required:"R"
          },
          "name":{
            type: "string",
            name: "字段名",
            length: 10,
            required: "R"
          }     
        }
      }
    },
    "parameter": {
      type: 'array',
      force: true,
      name: "其他参数",
      required: "O",
      item: {
        type: "object",
        name: "参数",
        required: "R",
        item: {
          "tempid": {
            type: "number",
            name: "模板ID",
            required: "R"
          },
          "id": {
            type: "string",
            name: "字段ID",
            required: "R"
          },
          "name": {
            type: "string",
            name: "字段名",
            length: 10,
            required: "R"
          }
        }
      }
    },
    "picpath": {
      name: 'LOGO与商标',
      type: 'array',
      required: 'R',
      length: 3,
      fixed: true,
      item: {
        id:"picpath",
        name: '图片对象',
        type: 'object',
        required: 'R',
        item: {
          "status":{
            name: '图片上传状态',
            type: 'string',
            required: 'O'
          },          
          "fileID": {
            name: '图片ID',
            type: 'string',
            required: 'O',
            condition:""
          }
        }
      }
    },
    "imginfo": {
      name: '海报',
      type: 'array',
      required: 'O',
      item: {
        name: '图片对象',
        type: 'object',
        required: 'R',
        length: 5,
        item: {
          "fileID": {
            name: '图片ID',
            type: 'string',
            required: 'O'
          }
        }
      }
    },
    "sector": {
      type: "array",
      name: "行业领域",
      required: "R",
      item: {
        type: "object",
        name: "行业领域",
        required: "R",
        item: {
          index: {
            type: "number",
            name: "索引",
            required: "R"
          },
          code: {
            type: "string",
            name: "行业代码",
            required: "R"
          },
          name: {
            type: "string",
            name: "行业名称",
            required: "R"
          }
        }
      }
    },
    "basedir": {
      type: "string",
      name: "图片存储地址",
      length: 256,
      required: "R"
    },
    "summary":{
      type: "string",
      name: "说明备注",
      length: 256,
      required: "R"
    }
  }
}