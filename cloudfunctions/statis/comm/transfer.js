/*!
 * transfer.js
 * xiaojinming - v1.0.0 (2020-03-21)
 * Released under MIT license
 */
const utils = require("./utils.js");
const validate = require("./validate.js");
const dict = [];

var operateMap = {
  "@toFixed": (src) => {
    return utils.toFixed(src);
  }
}
var _parseString = (s,obj,startIdx)=>{
    var index = s.indexOf('${',startIdx||0);
    if(index>=0){
      var s1 = s.substr(index+2),
       lastIdx = s1.indexOf("}"),
      f = s1.substring(0,lastIdx);
      var _v = validate.getData(f, obj)||'';
      s = s.replace('${'+f+'}',_v);
      return _parseString(s,obj,index+2)
    } else {
      index = s.indexOf('$',startIdx||0);
      if(index<0){
        return s;
      }
      var f = s.substr(1),
      _v = validate.getData(f, obj)||'';
      s = s.replace('$'+f,_v);
      return s;
    }
}
var _transfer1 = (obj, fmt) => {
  if (typeof fmt === "string") {
    //return v[fmt]
    return validate.getData(fmt, obj)
  }
  if (Array.isArray(fmt)) {
    var len = fmt.length;
      fmt.reduce((p,c)=>{
        if (c[0] === '@') {
          var oper = operateMap[c[0]];
          if (oper) {
            obj[p] = oper(obj[p]);
          }
        }
      })
      var _fmt = fmt.slice(0, len - 1),
      sep = fmt[len - 1];
    return _fmt.reduce((p, c) => {  
      var _v = _parseString(c,obj,0);
      return p ? (p + sep + _v) : _v;
    }, "");
  }
}
var _transfer = (resArr, fmt) => {
  if (Array.isArray(resArr)) {
    return resArr.map(v => {
      if (!fmt) {
        return;
      }
      return _transfer1(v, fmt);
    })
  } else {
    return _transfer1(resArr, fmt);
  }
}

var transfer1 = (arr, fmt)=>{
  if (typeof fmt==='string'){
    return _transfer(arr,fmt);
  } else if (Array.isArray(fmt) && typeof fmt[0] === 'string'){
    return _transfer(arr, fmt);
  } else if (Array.isArray(fmt) && Array.isArray(fmt[0])){
    return arr.map(v => {
      return fmt.reduce((pre, cur, arr) => {
        try {
          //["name", "$_id", "@dictTrans"],    
          if (cur.length < 2) {
            return;
          }  
          pre[cur[0]] = cur[1][0] === '$' ? validate.getData(cur[1].substr(1), v) : cur[1];
          var oper = cur[cur.length - 1];
          oper = oper && oper[0] === '@' ? oper : null;
          oper = oper && operateMap[oper] || null;
          if (oper) {
            pre[cur[0]] = oper(pre[cur[0]]);
          }
        } catch (e1) {
          console.log(`*******${cur[0]}:${cur[1]}*********`, pre);
          pre[cur[0]] = null;
        }
        return pre;
      }, {});
    });
  }
  return arr;
}

var transfer = (list,fmt)=>{
  if(!list || list.length===0 || !fmt){
    return;
  }
  var data = null;
  if(fmt.vfor){
    data = transfer1(list, fmt.vfor);
  } else {
    data = list;
  }
  if (fmt.sort) {
    data = data.sort((a, b) => a[fmt.sort] - b[fmt.sort]);
  }
  return data;
}

var merge = (data, option,extdata) => {

  if (option.title && option.title.textfor && extdata) {
    option.title.text = transfer1(extdata, option.title.textfor);
  }

  if (option.title && option.title.subfor && extdata) {
    option.title.subtext = transfer1(extdata, option.title.subfor);
  }

  if (option.legend && option.legend.vfor) {
    if (!isNaN(option.legend.vfor)) {
      option.legend.data = transfer1(dict[option.legend.vfor], "name");
    } else if(option.legend.vfor){
      option.legend.data = transfer1(data, option.legend.vfor);
    }
  }
  if (option.yAxis) {
    option.yAxis.map((v) => {
      if (!isNaN(v.vfor)) {
        v.data = transfer1(dict[v.vfor], "name");
      } else if(v.vfor){
        v.data = transfer1(data, v.vfor);
      }
      return v;
    })
  }
  if (option.xAxis) {
    option.xAxis.map((v) => {
      if (!isNaN(v.vfor)) {
        v.data = transfer1(dict[v.vfor], "name");
      } else if(v.vfor){
        v.data = transfer1(data, v.vfor);
      }
      return v;
    })
  }
  if (option.series) {
    option.series.map((v) => {
      if (!isNaN(v.vfor)) {
        v.data = transfer1(dict[v.vfor], "name");
      } else if(v.vfor) {
        v.data = transfer1(data, v.vfor);
      }
      return v;
    })
  }
  return option;
}
var toArray =(obj,groupby)=>{
  var arr =[];
  for(var k in obj){
    var field = groupby.find((v)=>v.value==k);
    if(!field){
      continue;
    }
    var item = field.options.find(v=>v.code==obj[k]);
    arr.push({id:k,code:obj[k],name:item&&item.name})
  }
  return arr;
}
module.exports = {
  transfer:transfer,
  merge:merge,
  toArray:toArray
};