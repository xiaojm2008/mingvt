const dict = require("../../lib/utils/cache.js").dict(true);
const helperServ = require("../../lib/utils/helper.js");
const validate = require("../../lib/utils/validate.js");

var operateMap = {
  "@dictTrans": (src, _statsAction) => {
    return helperServ.dictTrs(_statsAction.dictkey, src, "-", dict)
  },
  "@toFixed": (src) => {
    return helperServ.toFixed(src);
  }
}
var _transfer1 = (obj, fmt, _statsAction) => {
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
            obj[p] = oper(obj[p], _statsAction);
          }
        }
      })
      var _fmt = fmt.slice(0, len - 1),
      sep = fmt[len - 1];
    return _fmt.reduce((p, c) => {  
      var _v = validate.getData(c, obj)||'';
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
var transfer1 = (arr, fmt, _statsAction)=>{
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
            pre[cur[0]] = oper(pre[cur[0]], _statsAction);
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
var transfer = (res, _statsAction) => {
  var fmt = _statsAction.transfer;
  var resArr = res.list;
  _statsAction.extdata = res.extdata||res.statisdate;
  if (fmt && resArr) {
    _statsAction.data = transfer1(resArr, fmt, _statsAction);
  } else {
    _statsAction.data = resArr || [];
  }
  if (_statsAction.sort) {
    _statsAction.data = _statsAction.data.sort((a, b) => a[_statsAction.sort] - b[_statsAction.sort]);
  }
  if (_statsAction.title && _statsAction.title.textfor) {
    if(!_statsAction.option.title){_statsAction.option.title={};}
    _statsAction.option.title.text = transfer1(_statsAction.extdata, _statsAction.title.textfor);
  }

  if (_statsAction.title && _statsAction.title.subfor) {
    if(!_statsAction.option.title){_statsAction.option.title={};}
    _statsAction.option.title.subtext = transfer1(_statsAction.extdata, _statsAction.title.subfor);
  }

  if (_statsAction.option.legend && _statsAction.option.legend.vfor) {
    if (!isNaN(_statsAction.option.legend.vfor)) {
      _statsAction.option.legend.data = transfer1(dict[_statsAction.option.legend.vfor], "name");
    } else if(_statsAction.option.legend.vfor){
      _statsAction.option.legend.data = transfer1(_statsAction.data, _statsAction.option.legend.fmt);
    }
  }
  if (_statsAction.option.yAxis) {
    _statsAction.option.yAxis.map((v) => {
      if (!isNaN(v.vfor)) {
        v.data = transfer1(dict[v.vfor], "name");
      } else if(v.vfor){
        v.data = transfer1(_statsAction.data, v.vfor);
      }
      return v;
    })
  }
  if (_statsAction.option.xAxis) {
    _statsAction.option.xAxis.map((v) => {
      if (!isNaN(v.vfor)) {
        v.data = transfer1(dict[v.vfor], "name");
      } else if(v.vfor){
        v.data = transfer1(_statsAction.data, v.vfor);
      }
      return v;
    })
  }
  if (_statsAction.option.series) {
    _statsAction.option.series.map((v) => {
      if (!isNaN(v.vfor)) {
        v.data = transfer1(dict[v.vfor], "name");
      } else if(v.vfor) {
        v.data = transfer1(_statsAction.data, v.vfor);
      }
      return v;
    })
  }
  return _statsAction.option;
}

module.exports = transfer;