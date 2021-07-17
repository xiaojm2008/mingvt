module.exports = [{
    "id": "user",
    "name": "用户管理",
    "icon": "",
    "children": [{
      "type": "user",
      "id": "addUser",
      "name": "新增管理用户",
      "icon": "",
      "auth": "1"
    }, {
      "type": "user",
      "id": "addUserBenefit",
      "name": "注册用户权益",
      "icon": "",
      "auth": "1"
    }, {
      "type": "user",
      "id": "getUserInfo",
      "name": "获取用户信息",
      "icon": "",
      "params": "phone",
      "auth": "0"
    }, {
      "type": "user",
      "id": "getUserRight",
      "name": "获取用户权限",
      "icon": "",
      "params": "userid",
      "auth": "0",
    }, {
      "type": "user",
      "id": "getUserMenu",
      "name": "获取用户菜单",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "user",
      "id": "listUser",
      "name": "操作用户列表",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "user",
      "id": "addUserRight",
      "name": "分配用户权限",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "user",
      "id": "updUser",
      "name": "更新用户状态",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "user",
      "id": "getUserRole",
      "name": "获取用户角色",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "user",
      "id": "addUserRole",
      "name": "分配用户角色",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "user",
      "id": "insertUserRole",
      "name": "添加用户角色",
      "icon": "",
      "params": "",
      "auth": "1",
    }]
  },
  {
    "id": "role",
    "name": "角色管理",
    "icon": "",
    "children": [{
      "type": "role",
      "id": "addRole",
      "name": "新建角色",
      "icon": "",
      "auth": "1"
    }, {
      "type": "role",
      "id": "delRole",
      "name": "删除角色",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "role",
      "id": "getRoleInfo",
      "name": "获取角色信息",
      "icon": "",
      "params": "phone",
      "auth": "0"
    }, {
      "type": "role",
      "id": "getRoleRight",
      "name": "获取角色权限",
      "icon": "",
      "params": "userid",
      "auth": "0",
    }, {
      "type": "role",
      "id": "listRole",
      "name": "获取角色列表",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "role",
      "id": "addRoleRight",
      "name": "分配角色权限",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "role",
      "id": "addRoleMenu",
      "name": "分配角菜单",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "role",
      "id": "getRoleMenu",
      "name": "获取角色菜单",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "role",
      "id": "updRole",
      "name": "修改角色状态",
      "icon": "",
      "params": "",
      "auth": "1",
    }, {
      "type": "role",
      "id": "getRoleUser",
      "name": "获取角色用户",
      "icon": "",
      "params": "",
      "auth": "1",
    }]
  },
  {
    "id": "order",
    "name": "订单处理",
    "children": [{
      "type": "order",
      "id": "getOrderDetail",
      "name": "获取订单详情",
      "icon": "",
      "auth": "1",
      "params": "order_id",

    }, {
      "type": "order",
      "id": "getOrderList",
      "name": "获取订单列表",
      "icon": "",
      "auth": "1",
      "params": "status",

    }, {
      "type": "order",
      "id": "setOrderStatus",
      "name": "更新订单状态",
      "icon": "",
      "auth": "1",
      "params": "{status,order_id}",

    }]
  }, {
    "id": "menu",
    "name": "功能菜单",
    "children": [{
      "type": "menu",
      "id": "getMenuList",
      "name": "获取用户菜单列表",
      "icon": "",
      "auth": "1",
      "params": "",

    }, {
      "type": "menu",
      "id": "listMenu",
      "name": "列出功能菜单",
      "icon": "",
      "auth": "1",
      "params": "",

    }, {
      "type": "menu",
      "id": "addMenu",
      "name": "新增菜单",
      "icon": "",
      "auth": "1",
      "params": "",
    }, {
      "type": "menu",
      "id": "modMenu",
      "name": "修改菜单",
      "icon": "",
      "auth": "1",
      "params": "",
    }, {
      "type": "menu",
      "id": "delMenu",
      "name": "删除菜单",
      "icon": "",
      "auth": "1",
      "params": "",
    }]
  }, {
    "id": "category",
    "name": "商品商家分类",
    "children": [{
      "type": "category",
      "id": "listCategory",
      "name": "获取分类列表",
      "icon": "",
      "auth": "1",
      "params": ""
    }, {
        "type": "category",
        "id": "addCategory",
        "name": "新增分类",
        "icon": "",
        "auth": "1",
        "params": ""
      }, {
        "type": "category",
        "id": "modCategory",
        "name": "修改分类",
        "icon": "",
        "auth": "1",
        "params": ""
      }, {
        "type": "category",
        "id": "delCategory",
        "name": "删除分类",
        "icon": "",
        "auth": "1",
        "params": ""
      }]
  }, {
    "id": "shop",
    "name": "店铺管理",
    "children": [{
      "type": "shop",
      "id": "addCategory",
      "name": "新增分类列表",
      "icon": "",
      "auth": "1",
      "params": ""
    }, {
      "type": "shop",
      "id": "modCategory",
      "name": "修改分类",
      "icon": "",
      "auth": "1",
      "params": ""
    }, {
      "type": "shop",
      "id": "listCategory",
      "name": "获取分类列表",
      "icon": "",
      "auth": "1",
      "params": ""
    }, {
      "type": "shop",
      "id": "delCategory",
      "name": "删除分类",
      "icon": "",
      "auth": "1",
      "params": ""
      }, {
        "type": "shop",
        "id": "addShopThema",
        "name": "保存店铺布局",
        "icon": "",
        "auth": "1",
        "params": ""
      }, {
        "type": "shop",
        "id": "getShopThema",
        "name": "获取店铺布局",
        "icon": "",
        "auth": "1",
        "params": ""
      },{
        "type": "shop",
        "id": "addShopImg",
        "name": "添加店铺图片",
        "icon": "",
        "auth": "1",
        "params": ""
      }]
  },{
    "id": "logistics",
    "name": "物流服务",
    "children": [{
      "type": "logistics",
      "id": "cancelLogistics",
      "name": "取消预约取件",
      "icon": "",
      "auth": "1",
      "params": "",

    }, {
      "type": "logistics",
      "id": "createLogistics",
      "name": "预约取件",
      "icon": "",
      "auth": "1",
      "params": "",
      }, {
        "type": "logistics",
        "id": "getLogisticsList",
        "name": "获取预约取件申请列表",
        "icon": "",
        "auth": "1",
        "params": "",
      },{
        "type": "logistics",
        "id": "getLogisticsDetail",
        "name": "获取预约取件详情",
        "icon": "",
        "auth": "1",
        "params": "",
      }, {
        "type": "logistics",
        "id": "getOrderDetailByLogisId",
        "name": "根据预取件码订单信息",
        "icon": "",
        "auth": "1",
        "params": "", 
      }, {
        "type": "logistics",
        "id": "addBN",
        "name": "录入运单号",
        "icon": "",
        "auth": "1",
        "params": "", 
      }]
  }, {
    "id": "goods",
    "name": "商品管理",
    "children": [{
      "type": "goods",
      "id": "addGoods",
      "name": "新增商品",
      "icon": "",
      "auth": "1",
      "params": "",

    }, {
      "type": "goods",
      "id": "modGoods",
      "icon": "",
      "auth": "1",
      "params": "",
      "name": "修改商品"
    }, {
      "type": "goods",
      "id": "delGoods",
      "name": "删除商品",
      "icon": "",
      "auth": "1",
      "params": "",

    }, {
      "type": "goods",
      "id": "getGoods",
      "name": "获取商品列表",
      "icon": "",
      "auth": "1",
      "params": "",

    }, {
      "type": "goods",
      "id": "getGoodsDetail",
      "icon": "",
      "name": "获取商品详情",
      "auth": "1",
      "params": "",

    }, {
      "type": "goods",
      "id": "addCarousel",
      "icon": "",
      "name": "设置商品首页轮播",
      "auth": "1",
      "params": "",

    }]
  }, {
    "id": "prom",
    "name": "活动",
    "children": [{
        "type": "prom",
        "id": "addProm",
        "name": "新增活动",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "prom",
        "id": "modProm",
        "name": "修改活动",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "prom",
        "id": "delProm",
        "name": "删除活动",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "prom",
        "id": "listProm",
        "name": "查询活动列表",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "prom",
        "id": "addPromGoods",
        "name": "添加活动商品",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "prom",
        "id": "getPromGoods",
        "name": "获取活动商品",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "prom",
        "id": "getPromById",
        "name": "获取活动详情",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "prom",
        "id": "delPromGoods",
        "name": "删除活动商品",
        "icon": "",
        "auth": "1",
        "params": ""
      }
    ]
  },{
    "id": "cashout",
    "name": "提现",
    "children": [{
        "type": "cashout",
        "id": "cashout",
        "name": "提现申请",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "cashout",
        "id": "gendealMonth",
        "name": "生成月度提现金额",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "cashout",
        "id": "gendeal",
        "name": "生成可提现金额",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "cashout",
        "id": "listCashoutApp",
        "name": "查询提现申请记录",
        "icon": "",
        "auth": "1",
        "params": ""
      }]
     },{
      "id": "settle",
      "name": "订单结算",
      "children": [{
          "type": "settle",
          "id": "settle",
          "name": "订单结算处理",
          "icon": "",
          "auth": "1",
          "params": ""
        },
        {
          "type": "settle",
          "id": "getBalDetail",
          "name": "获取订单结算明细",
          "icon": "",
          "auth": "1",
          "params": ""
        }]
      },
      {
    "id": "rpt",
    "name": "统计报表",
    "children": [{
        "type": "rpt",
        "id": "income",
        "name": "订单统计",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "rpt",
        "id": "deal",
        "name": "成交统计",
        "icon": "",
        "auth": "1",
        "params": ""
      },
      {
        "type": "rpt",
        "id": "dealbym",
        "name": "月成交统计",
        "icon": "",
        "auth": "1",
        "params": ""
      }]
     },{
      "id": "cfg",
      "name": "报表配置",
      "children": [{
          "type": "cfg",
          "id": "getActionFuncList",
          "name": "活动报表列表",
          "icon": "",
          "auth": "1",
          "params": ""
        },
        {
          "type": "cfg",
          "id": "getActionCfg",
          "name": "活动报表配置",
          "icon": "",
          "auth": "1",
          "params": ""
        }
      ]
    },     
    {
      "id": "action",
      "name": "活动报表",
      "children": [{
          "type": "action",
          "id": "general",
          "name": "活动通用报表",
          "icon": "",
          "auth": "1",
          "params": ""
        }
      ]
    }, 
    {
    "id": "other",
    "name": "其他",
    "children": [{
      "type": "goods",
      "id": "addGoods",
      "name": "新增商品",
      "icon": "",
      "auth": "1",
      "params": ""
    }]
  }
]