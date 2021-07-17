const helper = require("../../lib/utils/helper.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const actionMap = require("./actionMap.js");
const rpc = require("../../lib/utils/rpc.js");
const validate = require("../../lib/utils/validate.js");
class xsearch {
  constructor(pgContext) {
    this.page = pgContext; 
    this.page.goToPage = this.goToPage.bind(this);
    this.page.searchBy = this.searchBy.bind(this);
  }
  setData(res, key, append) {
    var data = {},pack=`result.${key}`;
    if (!this.page.data.loadFinish) {
      data["loadFinish"] = true;
    }
    //listCount =>totalNum
    data["totalNum"] = (this.page.data.totalNum || 0) + res.length;
    if (res.length === 0 && !append) {
      data[`result.${key}`] = res;
    } else {
      if(append){
        var tmpArr = pageServ.getData(pack, this.page);
        data[pack] = tmpArr ? tmpArr.concat(res) : res;
      } else {
        data[pack] = res;
      }
    }
    this.page.setData(data);
  }

  goToPage(item, catetype, index) {
    var cfg = actionMap[catetype],page=cfg.page+item.value;
    if(cfg.pageParams && cfg.pageParams.length>0){
      page += cfg.pageParams.reduce((p,c)=>{
        p += ("&"+c+"="+item[c])
        return p;
      },"");
    }
    helper.goToPage(page);
  }

  searchBy(catetype, value, pageSize, refresh) {
    //测试
    var searchCfg = actionMap[catetype];
    refresh&&(searchCfg.batch_time=0);
    var action = null;
    var params = {
      orderby_field: "updatetime",
      orderby_type: "desc",
      text: value,
      page_size: pageSize || 5,
      batch_time: searchCfg.batch_time||0
    };
    params = Object.assign(params, searchCfg.defParams);
    if(typeof searchCfg.action=="string"){
      action = rpc.doAction(params,searchCfg.action, searchCfg.manager||"trader");
    } else {
      action = searchCfg.action(params);
    }
    action.then(res => {
      var arr = res.result.data,
        transfer = actionMap[catetype].transfer;
      if (arr) {
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
          if(arr.length>0){
            arr[0].totalNum = res.result.totalNum||0
            searchCfg.batch_time++;
          };
        }
        this.setData(arr, catetype, !refresh);
      } else {
        this.setData([{
          title: actionMap[catetype].title,
          type: catetype,
          text: res.result.errMsg || res.errMsg,
          ext: "",
          value: ''
        }], catetype);
      }
    }).catch(err => {
      this.setData([{
        title: actionMap[catetype].title,
        type: catetype,
        text: err.errMsg || err.message,
        ext: "",
        value: ''
      }], catetype)
    })
  }
}

module.exports = xsearch;