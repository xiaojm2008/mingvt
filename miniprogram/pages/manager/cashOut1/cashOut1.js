const pageServ = require('../../../lib/utils/pagehelper.js');
const cache = require("../../../lib/utils/cache.js");
const helperServ = require("../../../lib/utils/helper.js");
const cashoutServ = require("../../../lib/manager/cashout.js");

const init = [
  {name:"一月",remains:"*****",amt:0},
  {name:"二月",remains:"*****",amt:0},
  {name:"三月",remains:"*****",amt:0},
  {name:"四月",remains:"*****",amt:0},
  {name:"五月",remains:"*****",amt:0},
  {name:"六月",remains:"*****",amt:0},
  {name:"七月",remains:"*****",amt:0},
  {name:"八月",remains:"*****",amt:0},
  {name:"九月",remains:"*****",amt:0},
  {name:"十月",remains:"*****",amt:0},
  {name:"十一月",remains:"*****",amt:0},
  {name:"十二月",remains:"*****",amt:0}
];
//100030
const CASHOUT_NONE = "0";//申请提取
const CASHOUT_APPR_SUCC = "1";//申请提取审批成功
const CASHOUT_APPR_FAIL = "2";//申请提取审批失败
const CASHOUT_OK = "3";//已经提取成功
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dict:{
      100030:null
    },
    deals:init.map(v=>Object.assign({},v)),
    start:new Date().getFullYear(),
    year:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    cache.getDict(Object.keys(this.data.dict), (err, res) => {
      if (err) {
        return;
      }
      this.setData({
        dict: res
      })
    })
    this.listCashoutApp();
  },
  listCashoutApp:function(){
    cashoutServ.listCashoutApp({drawyear:this.data.year||this.data.start}).then(res=>{
      if(res.result.data){
        res.result.data.forEach(v=>{
          var drawmonth = v.drawmonth,
          idx = parseInt(v.drawmonth.substr(4,2)),
          _init = init.map(v1=>Object.assign({},v1));
          _init[idx-1].amt = v.amt;
          _init[idx-1].remains = 0;
          //提现申请状态:100030
          _init[idx-1].status = v.status; 
          this.setData({
            deals:_init
          })
        })
      }
      helperServ.showModal({content:res.result.errMsg});
    }).catch(err=>{
      helperServ.showModal({content:err.errMsg||err.message});
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  bindChange:function(e){
    
    this.setData({
      year:e.detail.value
    })
    this.listCashoutApp();
  },
  qryAmt:function(e){
    var month = e.currentTarget.dataset.index+1;
    var statismonth = this.data.year + (month >=10?(month+''):('0'+month))
    var data = {};   
    helperServ.showLoading();
    cashoutServ.gendealMonth({statismonth:statismonth}).then(res=>{
      helperServ.hideLoading();
      if(res.result.success){
        data[`deals[${month-1}].remains`] = res.remains;
        this.setData(data);
        return;
      }
      helperServ.showModal({icon:'none',content:res.result.errMsg})
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showToast({icon:'none',title:err.errMsg||err.message})
    })
  }
})