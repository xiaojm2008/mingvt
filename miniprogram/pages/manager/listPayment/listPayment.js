Page({

  /**
   * 页面的初始数据
   */
  data: {
    dict:{
      100031:null,
    },
    category: [{
        'name': '待支付',
        "params": {
          'status': '2'
        }
      },
      {
        'name': '已支付',
        "params": {
          'status': '1'
        }
      },
      {
        'name': '支付失败',
        "params": {
          'status': '0'
        }
      },
      {
        'name': '库存待释放',
        "params": {
          'stock_rollback': '0',
          'status': ['0','2','3']
        }
      },
      {
        'name': '异常或超时',
        "params": {
          'status': '3'
        }
      },
      {
        'name': '全部',
        "params": {
          'status': ''
        }
      }
    ],
    action: null,
    manager: "pay",
    orderby: {
      orderby_field: "settime",
      orderby_type: "desc"
    },
    temptype: "payment"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var data = {}, idx = 0;
    if (options.status) {
      idx = this.data.category.findIndex(v => v.params.status === options.status);
    } else {
      data[`category[0].def`] = true;
    }
    data["action"] = "query.getPayment";
    data[`category[${idx}].def`] = true;
    this.setData(data);
  }
})