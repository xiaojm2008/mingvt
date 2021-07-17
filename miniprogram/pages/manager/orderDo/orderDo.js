Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: [{
        'name': '待发货',
        "params": {
          'status': '1'
        }
      },
      {
        'name': '待收货',
        "params": {
          'status': '2'
        }
      },
      {
        'name': '退款审批',
        "params": {
          'status': '4'
        }
      },
      {
        'name': '已完成',
        "params": {
          'status': '6'
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
    manager: "manager",
    orderby: {
      orderby_field: "updatetime",
      orderby_type: "desc"
    },
    temptype: "orderdo"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var data = {}, idx = 0;
    if (options.status) {
      idx = this.data.category.findIndex(v => v.params.status === options.status);
    }
    data["action"] = "order.getOrderList";
    data[`category[${idx}].def`] = true;
    this.setData(data);
  }
})
/*
  tapTabHandler(e) {
     var tabIdx = 0;
    if (e && e.detail) {
      console.log(`current tab index ${this.currentTabIdx},togger tab idx ${e.detail.index}`);
      tabIdx = e.detail.index;
      this.currentTabIdx = tabIdx;
      if (this.data.orderArrList[tabIdx] && this.data.orderArrList[tabIdx].length > 0) {
        console.log(`${tabIdx} tab togger tapTabHandler orderArrList.length[${this.data.orderArrList[tabIdx].length}]`);
        this.tmpOrderList = this.data.orderArrList[tabIdx];
        return;
      }
    } else if(typeof e == "number"){
      tabIdx = e;
      console.log(`current tab index ${this.currentTabIdx},onPullDownRefresh idx ${e}`);
    }
    this.batch_time = -1;
    this.setData({
      loadFinish: false
    });
    if (!this.data.orderArrList[tabIdx]){
      this.data.orderArrList[tabIdx] = [];
    }
    var data = {};
    data[`orderArrList[${tabIdx}]`] = [];
    this.setData(data);
    this.loadMore(tabIdx);
  },
*/