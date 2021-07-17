module.exports = {
act: {
    name: '活动信息',
    type: 'object',
    required: 'R',
    item: {
      "actbegintime": {
        type: "array",
        name: '活动开始时间',
        required: 'R',
        item: {
          name: '活动开始时间',
          type: 'string',
          required: 'R'
        }
      },
      "actendtime": {
        type: "array",
        name: '活动结束时间',
        required: 'R',
        item: {
          name: '活动结束时间',
          type: 'string',
          length: 20,
          required: 'R'
        }
      },
      "actbegintime_dt": {
        name: '活动开始时间',
        type: "transfer",
        value: ["$actbegintime", "", " ", "@date"]
      },
      "actendtime_dt": {
        name: '活动结束时间',
        type: "transfer",
        value: ["$actendtime", "", " ", "@date"]
      },
      "actionid": {
        type: "string",
        name: '活动ID',
        required: 'O',
        length: 32,
      },
      actionname: {
        type: "string",
        name: '活动名称',
        required: 'R',
        length: 120,
      },
      actiontype: {
        name: '活动类型',
        type: "dict",
        dictlist: 100033,
        required: "R"
      },
      create_phone: {
        type: "number",
        name: '手机号码',
        required: 'O',
        length: 11,
        fixed: 1
      },
      create_userid: {
        type: "string",
        name: '用户ID',
        required: 'O',
        length: 500
      },
      create_username: {
        type: "string",
        name: '用户名',
        required: 'O',
        length: 50
      },
      enrollbegintime: {
        type: "array",
        name: '报名开始时间',
        required: 'O',
        item: {
          name: '报名开始时间',
          type: 'string',
          required: 'R',
          length: 20
        }
      },
      enrollendtime: {
        type: "array",
        name: '报名结束时间',
        required: 'R',
        item: {
          name: '报名结束时间',
          type: 'string',
          length: 20,
          required: 'R'
        }
      },
      "enrollbegintime_dt": {
        name: '报名开始时间',
        type: "transfer",
        value: ["$enrollbegintime", "", " ", "@date"]
      },
      "enrollendtime_dt": {
        name: '报名结束时间',
        type: "transfer",
        value: ["$enrollendtime", "", " ", "@date"]
      },
      //description:1,
      "picpath": {
        name: '海报',
        type: 'array',
        required: 'R',
        length: 2,
        fixed: true,
        item: {
          id:"picpath",
          name: '海报图片',
          type: 'object',
          required: 'R',
          item: {
            "status":{
              name: '图片上传状态',
              type: 'string',
              length: 1,
              fixed:1,
              required: 'O'
            },          
            "fileID": {
              name: '图片ID',
              type: 'string',
              length: 500,
              required: 'O',
              condition:""
            }
          }
        }
      },
      "imginfo": {
        name: '轮播图片',
        type: 'array',
        required: 'O',
        item: {
          name: '轮播图片',
          type: 'object',
          required: 'R',
          length: 5,
          item: {
            "status":{
              name: '图片上传状态',
              type: 'string',
              length: 1,
              fixed:1,
              required: 'O'
            },
            "fileID": {
              name: '图片ID',
              type: 'string',
              length: 500,
              required: 'O'
            }
          }
        }
      },
      actaddress: {
        type: "string",
        name: '活动地址',
        required: 'O',
        length: 500,
      },
      actlatitude: {
        type: "number",
        name: '经度',
        required: 'O',
        length: 48,
      },
      actlongitude: {
        type: "number",
        name: '维度',
        required: 'O',
        length: 48,
      },
      feetype: {
        name: '收费方式',
        type: "dict",
        dictlist: 100032,
        required: "R"
      },
      /**6:问卷调查 */
      fee: {
        name: '费用',
        type: "number",
        length: 48,
        condition: "feetype==1&&actiontype->0,1,2,3,4,5",
        required: "C"
      },
      feechild: {
        name: '小孩费用',
        type: "number",
        length: 48,
        condition: "feetype==1&&actiontype->0,1,2,3",/** 收费并且活动类型是0,1,2,3必填*/
        required: "C"
      },    
      /*
      personnum:{
        name: '人数',
        type: "number",
        condition: "feetype==1&&actiontype->0,1,2,3", 
        length: 48,
        required: "C"
      },
      childnum:{
        name: '儿童数',
        type: "number",
        condition: "feetype==1&&actiontype->0,1,2,3",
        length: 48,
        required: "C"
      },*/
      maxperson: {
        name: '最多人数',
        type: "number",
        length: 48,
        required: "O"
      },
      minperson: {
        name: '最少人数',
        type: "number",
        length: 48,
        required: "O"
      }
    }
  },
  enroll:{
    type: 'array',
    force: true,
    name: "表单字段",
    required: "O",
    item:{
      type:"object",
      name:"表单字段",
      required:"R",
      item:{
        "tempid":{
          type: "number",
          name: "模板ID",
          length: 20,
          required: "R"
        },
        "id":{
          type: "string",
          name: "字段ID",
          length: 64,
          required:"R"
        },
        "name":{
          type: "string",
          name: "字段名",
          length: 64,
          length: 10,
          required: "R"
        },
        "type":{
          type: "string",
          name: "字段类型",
          length: 1,
          fixed: 1,
          required: "R"
        },
        "seq":{
          type: "number",
          name: "字段序号",
          length: 10,
          required: "R"
        }
      }
    }
  }
}