const app = getApp()
const helperServ = require("../../lib/utils/helper.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const rpc = require("../../lib/utils/rpc.js");
const cache = require("../../lib/utils/cache.js");
const validate = require("../../lib/utils/validate.js");
const actionMap = require("./actionMap.js");
Page({
  data: {
    listData: [],
    searchValue: '',
    emptyShow: false,
    topSize: 100
  },
  formatList(list) {

    let tempArr = [];

    ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"].forEach(initial => {
      let tempObj = {};

      tempObj.key = initial;
      tempObj.data = list.filter(item => item.initial == initial).map(item => {
        return { name: item.name, code: item.code, short: item.short }
      });

      if (tempObj.data && tempObj.data.length > 0) {
        tempArr.push(tempObj);
      }
    })

    return tempArr;
  },
  search(e) {
    let value = e.detail.value;
    this.setData({
      searchValue: value
    });
    if (!value || !value.trim()){
     this.setList(this.formatList(this.resultData));
     return; 
    }
    this.setList(this.formatList(this.resultData.filter(item => item.name.indexOf(value) > -1 || item.short.toLowerCase().indexOf(value) > -1||item.short.indexOf(value) > -1)));
  },
  clear() {
    this.setData({
      searchValue: ""
    });
    this.setList(this.formatList(this.resultData));
  },
  setList(listData) {
    let emptyShow = listData.length == 0 ? true : false;

    this.setData({
      listData: listData,
      emptyShow: emptyShow
    });
  },
  itemClick(e) {
    console.log(e);
    var prevPage = helperServ.getPrePage();
    if (prevPage.options.nextPageCallBack) {
      prevPage.options.nextPageCallBack(null, e.detail);
      helperServ.goBack();
    }
  },
  
  transfer(arr){
    var transfer = this.actionInfo.transfer;
    if (transfer) {
      arr = arr.map(v => {
        return transfer.reduce((pre, cur, arr) => {
          try {
            pre[cur[0]] = cur[1][0] === '$' ? validate.getData(cur[1].substr(1), v) : cur[1];
          } catch (e1) {
            console.log(`*******${cur[0]}:${cur[1]}*********`, pre);
            pre[cur[0]] = null;
          }
          return pre;
        }, {});
      });
      if (arr.length > 0) {
        arr[0].totalNum = arr.length
      };    
    }
    return arr;
  },
  doAction(options,storage_key){

    var qryParams = Object.assign({},this.actionInfo.defParams||{},options);
    helperServ.showLoading({title:"数据加载中..."});
    rpc.doAction(qryParams, this.actionInfo.action, this.actionInfo.manager).then(res => {
      helperServ.hideLoading();
      if (!res.result.data) {
        helperServ.showModal({
          content: res.result.errMsg,
        })
        return;
      }
      //{"id":"35","provincecode":"150000","city":"阿拉善盟","code":"152900","initial":"A","short":"Alashanmeng"}
      //{"id":"35","pcode":"150000","name":"阿拉善盟","code":"152900","initial":"A","short":"Alashanmeng"}
      this.resultData = this.transfer(res.result.data);
      this.setList(this.formatList(this.resultData));

      if(this.resultData&&this.resultData.length>0){
        helperServ.setStorage(storage_key,this.resultData).then(res=>{})
      } 
    }).catch(err=>{
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg,
      })
    });
  },

  onLoad(options) {
    if(!options.catetype){
      return;
    }
    this.actionInfo = actionMap[options.catetype];
    if (!this.actionInfo){
      helperServ.showModal({
        content: options.catetype+"未映射",
      })
      return;
    }
    delete options.catetype;
    var params = pageServ.toValues(options).toString();
    var storage_key = this.actionInfo.action+"_"+this.actionInfo.manager+(params?("_"+params):'');

    helperServ.getStorage(storage_key).then(res=>{
      if(res && res.length>0){
        this.resultData = res;
        this.setList(this.formatList(this.resultData));
      } else {
        this.doAction(options,storage_key);
      }
    }).catch(err=>{
      helperServ.showToast({title:err.errMsg||err.message,icon:'none'});
      this.doAction(options,storage_key);
    })
  }
});

