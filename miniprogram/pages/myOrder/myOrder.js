var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  batch_time: -1,
  data: {
    category: [{
      name: "全部",
      params: {
        status: ''
      },
    }, {
      name: "待付款",
      params: {
        status: '0'
      },
    }, {
      name: "待发货",
      params: {
        status: '1'
      },
    }, {
      name: "待收货",
      params: {
        status: '2'
      },
    }, {
      name: "待评价",
      params: {
        status: '3'
      },
    }, {
      name: "已完成",
      params: {
        status: '6'
      },
    }],
    action: null,
    manager: "trader",
    orderby: {
      orderby_field: "updatetime",
      orderby_type: "desc"
    },
    temptype: "orderlist"
  },
  onLoad:function(options){
    var data = {}, idx=0;
    if(options.status){
      idx = this.data.category.findIndex(v=>v.params.status === options.status);      
    }
    data["action"] = "order.getOrderList";
    data[`category[${idx}].def`] = true;
    this.setData(data);
  }
})