var goods = {};
goods.baseInfo = {
  name: '基本信息',
  type: 'object',
  required: 'R',
  item: {
    "shopid": {
      //店铺ID
      type: "string",
      name: '店铺ID',
      required: 'R',
      default: '0'
    },
    "shopname": {
      //店铺名称
      type: "string",
      name: '店铺名称',
      required: 'R'
    },
    "goodsno": {
      //商品编号(shopid+sequnce),后台生成
      type: "string",
      name: '商品编号',
      required: 'O'
    },
    "goodsname": {
      //商品名称
      type: "string",
      name: '商品名称',
      required: 'R'
    },
    "category": {
      //分类：食品/果蔬/生鲜/家具/电器/
      name: '商品分类',
      type: "array",
      storage: 'goods_category',
      required: 'R',
      item:{
        name: '分类属性',
        type: "object",
        required: 'R',
        item:{
          "index":{
            name: '索引',
            type: "number",
            required: 'O'
          },
          "code": {
            name: '分类代码',
            type: "string",
            length: 6,
            required: 'R'
          },
          "name":{
            name: '分类名称',
            type: "string",
            length: 10,
            required: 'R'
          }
        }
      }
    },
    "category_codes":{
      name: '商品分类代码串',
      required: 'R',
      type: "transfer",
      value: ["$category","code",";"] //把category:{index,code,name}数组转换为以";"分隔的code字符串。
    },
    "subid":{
      //子分类
      name: '商品子分类',
      type: "array",    
      required: 'O',
      item: {
        name: '子分类属性',
        type: "object",
        required: 'R',
        item: {
          "code": {
            name: '子分类代码',
            length: 6,
            type: "string",
            required: 'R'
          },
          "name": {
            name: '子分类名称',
            length: 10,
            type: "string",
            required: 'R'
          }
        }
      }
    },
    "subid_codes": {
      name: '子商品分类代码串',
      required: 'R',
      type: "transfer",
      value: ["$subid", "code", ";"]//把subid:[{code,name},...]数组转换为以";"分隔的code字符串"code1;code2;code3;..."。
    },
    "topic": {
      name: '商品LOGO主题',
      type:"dict",
      dictlist: 100005,
      required: 'O',
      default: '0'
    },
    "theme": {
      name: '商品明细页面主题',
      type: "dict",
      dictlist: 100005,
      required: 'O',
      default: '0'
    },
    "busmodel": {
      name: 'busmodel',
      type: "dict",
      //dictlist: 10000,
      required: 'O'
    },
    "delivery": {
      name: '快递信息',
      type: 'object',
      required: 'O',
      item: {
        "fee": {
          //供应商ID
          name: '快递费',
          type: "number",
          required: 'R'
        },
        "areainfo": {
          //供应商ID
          name: '发货',
          type: "array",
          required: 'O',
          item: {
            name: '发货',
            type: "string",
            required: 'O'
          }
        }
      }
    },
    "supply": {
      name: '供应商信息',
      type: 'object',
      required: 'O',
      item: {
        "supplyid": {
          //供应商ID
          name: '供应商ID',
          type: "string",
          required: 'O'
        },
        "supplyname": {
          //供应商名字
          name: '供应商名称',
          type: "string",
          required: 'O'
        }
      }
    },
    "spec": {
      //规格信息
      name: '规格信息描述',
      type: 'string',
      required: 'O'
    },
    "unit": {
      //单位
      name: '单位',
      dict: null,
      required: 'O'
    },
    "checksums": null,
    "productionplace": {
      name: '产地',
      type: 'object',
      required: 'O',
      item: {
        "countryid": {
          name: '国家代码',
          type: 'string',
          required: 'C',
          condition: 'importflag=1'
        },
        "detail": {
          name: '产地',
          type: 'string',
          required: 'C',
          condition: 'importflag=1'
        }
      }
    },
    "brandinfo": {
      name: '品牌',
      type: 'object',
      required: 'O',
      item: {
        "brandid": {
          name: '品牌ID',
          type: 'string',
          required: 'O'
        },
        "branddesc": {
          name: '品牌名称',
          type: 'string',
          required: 'O'
        }
      }
    },
    "expressfee": {
      //运费
      name: '运费',
      type: 'number',
      required: 'O'
    },
    "maxcanuseintegral": {
      name: '可积分',
      type: 'number',
      required: 'O'
    },
    "hotsell": {
      //热销标志
      name: '热销标志',
      dict: 100000,
      required: 'O',
      default: '0'
    },
    "goods_flag": {
      //0购买，1预售，2团购
      name: '商品标志',
      dict: 100001,
      required: 'O',
      default: '0'
    },
    "goods_type": {
      name: '商品类型',
      dict: 100002,
      required: 'O',
      default: '0'
    },
    "quantity": {
      type: 'object',
      name: '数量信息',
      required: 'R',
      item: {
        "minqty": {
          name: '最小量',
          type: 'number',
          required: 'O'
        },
        "stockqty": {
          name: '库存量',
          type: 'number',
          required: 'C',
          value:0,
          condition: "stockflag==1"
        },
        "totalqty": {
          name: '总量',
          type: 'number',
          required: 'O'
        },
        "availableqty": {
          name: '可用量',
          type: 'number',
          required: 'O'
        },
        "frozenqty": {
          name: '冻结量',
          type: 'number',
          required: 'O'
        }
      }
    },
    "price": {
      type: 'object',
      name: '价格信息',
      required: 'R',
      item: {
        "presaleprice": {
          name: '预售价格',
          type: 'number',
          required: 'C',
          condition: "goods_flag==1"
        },
        "originalprice": {
          name: '原价',
          type: 'number',
          required: 'O'
        },
        "taxprice": {
          name: '含税价',
          type: 'number',
          required: 'O'
        },
        "saleprice": {
          name: '销售价',
          type: 'number',
          required: 'R'
        },
        "stockprice": {
          name: '入库价',
          type: 'number',
          required: 'O'
        },
        "memberprice": {
          name: '会员价',
          type: 'number',
          required: 'O'
        },
        "groupprice": {
          name: '团购价',
          type: 'number',
          required: 'C',
          condition: "goods_type=='2'"

        },
        "lowprice": {
          name: '最低价',
          type: 'number',
          required: 'O'
        },
        "highprice": {
          name: '最高价',
          type: 'number',
          required: 'O'
        }
      }
    },
    "importflag": {
      name: 'importflag',
      dict: 100004,
      required: 'O',
      default: '0'
    },
    "stockflag": {
      name: '库存标志',
      dict: 100003,
      required: 'O',
      default: '0'
      //库存标志
    },
    "infopath": null,
    "packlistpath": null,
    "specpath": {
      name: '规格说明书',
      required: 'O',
      length: 256
    },
    "picpath": {
      name: 'LOGO图',
      type: 'array',
      required: 'R',
      length: 3,
      fixed: true,
      item: {
        id: "picpath",
        name: '图片对象',
        type: 'object',
        required: 'R',
        item: {
          "fileID": {
            name: '图片ID',
            type: 'string',
            required: 'O'
          }
        }
      }
    },
    "models_imgkey":{
      name: '多型号商品对应的主型号图片位置',
      type: 'string',
      required: 'O'
    },
    "support_drawback":{
      name: '是否支持退款,默认支持',
      type: 'string',
      value:'1',
      required: 'R'
    }
  }
}

goods.imgInfo = {
  name: '轮播图片',
  type: 'array',
  required: 'O',
  max_len: 4,
  item: {
    name: '图片对象',
    type: 'object',
    required: 'R',
    item:{
      "fileID":{
        name: '图片ID',
        type: 'string',
        required: 'R'
      }
    }
  }
}

goods.modelItem = {
  name: '型号信息',
  type: 'array',
  force: true,
  required: 'O',
  item: {
    name: '型号对象',
    type: 'object',
    required: 'R',
    item: {
      "subid": {
        //此型号（由各个规格组合）ID(modelitem_${index})
        name: '型号ID',
        type: 'string',
        required: 'R'
      },
      "subname": {
        //规格组合值 （"0,m20,m30",）
        name: '型号',
        type: 'string',
        required: 'R'
      },
      "price": {
        name: '售价',
        type: 'number',
        required: 'R'
      },
      "stock": {
        name: '库存',
        type: 'number',
        required: 'C',
        condition: "stockflag==1"
      },
      "picpath": {
        //此型号商品图片
        name: '型号品图片对象',
        type: 'object',
        required: 'O'
      }
    }
  }
}

goods.model = {
  name: '规格信息',
  type: 'array',
  force: 'true',
  required: 'O',
  item: {
    name: '规格对象',
    type: 'object',
    required: 'R',
    item: {
      "id": {
        //规格ID:比如m_1,m_2
        name: '规格ID',
        type: 'string',
        required: 'R'
      },
      "name": {
        //规格名称:比如面料/尺寸/颜色/
        name: '规格名称',
        type: 'string',
        required: 'R'
      },
      "submodels": {
        //规格种类:比如面料有：棉，尼龙，纤维/尺寸有：200CM*300CM*400CM/颜色：红，蓝，绿
        name: '规格种类',
        type: 'array',
        required: 'R',
        force: 'true',
        item: {
          type: 'object',
          required: 'R',
          item: {
            "subid": {
              name: '子属性ID',
              type: 'string',
              required: 'R'
            },
            "subname": {
              name: '子属性名称',
              type: 'string',
              required: 'R'
            },
            "price": {
              name: '售价',
              type: 'number',
              required: 'O'
            },
            "stock": {
              name: '库存',
              type: 'number',
              required: 'O'
            }
          }
        }
      }
    }
  }
}
module.exports = {
  goods: goods
}