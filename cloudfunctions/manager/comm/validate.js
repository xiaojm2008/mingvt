/*!
 * validate.js
 * xiaojinming - v1.0.0 (2020-03-21)
 * Released under MIT license
 */
const dict = null;
var operaterMap = {};
var strToDate = (str) => {
  str = str && str.trim();
  if (!!str) {
    str = str.replace('T', ' ').replace('Z', '');
    let tmp = str.split("-");
    let day = tmp[2].split(" ");
    let other = null;
    let hmsArr = [0, 0, 0];

    if (day.length > 1) {
      other = day[1];
      let hms = other.split(":");
      for (let i = 0; i < hms.length; i++) {
        hmsArr[i] = parseInt(hms[i]);
      }
    }
    return new Date(parseInt(tmp[0]), parseInt(tmp[1]) - 1, parseInt(day[0]), hmsArr[0]-8, hmsArr[1], hmsArr[2],100);
  }
  return null;
}
operaterMap["@date"] = strToDate;

var isEmptyObj = function (obj) {
  for (var k in obj) {
    return false;
  }
  return true;
}

var setData = (pack, wrapObj, value) => {
  var d = wrapObj;
  if (!d || !pack) {
    return null;
  }
  var s = pack.split('.'),
    f = null,
    f1 = 0,
    p = null;
  if (s && s.length > 0) {
    s.forEach((v, i) => {
      f = v.indexOf('[');
      if (f >= 0) {
        f1 = v.indexOf("]");
        if (f1 < 0) {
          //console.log("pack error", v);
          helperServ.showModal({
            content: 'pack error:' + pack
          })
          return null;
        }
        p = v.substr(0, f);
        if (p) {
          d = d[p];
        }
        p = parseInt(v.substring(f + 1, f1));
        d = d[p];
      } else {
        if (i < s.length - 1) {
          d = d[v];
        } else {
          d[v] = value;
        }
      }
    })
    return;
  }
  d[pack] = value;
}
var getData = (pack, wrapObj) => {
  var d = wrapObj;
  if (!d || !pack) {
    return null;
  }
  if (!d || !pack) {
    return null;
  }
  var s = pack.split('.'),
    f = null,
    f1 = 0,
    p = null;
  if (s && s.length > 0) {
    s.forEach((v, i) => {
      f = v.indexOf('[');
      if (f >= 0) {
        f1 = v.indexOf("]");
        if (f1 < 0) {
          //console.log("pack error", v);
          helperServ.showModal({
            content: 'pack error:' + pack
          })
          return null;
        }
        p = v.substr(0, f);
        if (p) {
          d = d[p];
        }
        if (!d) return null;
        p = parseInt(v.substring(f + 1, f1));
        d = d[p];
      } else {
        d = d[v];
      }
    })
    return d;
  }
  return d[pack];
}
/**
 * condition 条件表达式
 * value:值
 * v_type:值类型
 * fieldname:字段名
 * obj:fromObj用于getData方法，表示源条件来源于那个对象里面的字段
 */
var conditionCheck = (condition, value, v_type, fieldname, obj) => {
  var i = condition.indexOf('==');
  if (i > 0) {
    var condition_f = condition.substr(0, i);
    var condition_v = condition.substr(i + 2);
    condition_f = condition_f ? condition_f.trim() : null;
    condition_v = condition_v ? condition_v.trim() : null;
    if (!condition_f) {
      return {
        errMsg: `${fieldname}：${condition}条件表达式定义错误`
      }
    }
    if (getData(condition_f, obj) == condition_v) {
      if (v_type == 'undefined') {
        return {
          errMsg: `${fieldname}必须填写`
        }
      } else if (v_type == 'string' && (!value || !value.trim())) {
        return {
          errMsg: `${fieldname}不能为空`
        }
      } else if (value === null || value === '') {
        return {
          errMsg: `${fieldname}不能为空`
        }
      }
    }
  }
}
const typeMap = {
  '0': 'string',
  '3': 'dict',
  '4': 'string',
  '9': 'string',
  '1': 'number',
  '2': 'number',
  '6': 'number',
  '7': 'number',
  '8': 'number',
  '5': 'array',
  'a': 'object',
  'b': 'array',
  'i': 'info',
  'x': 'array',
  'm': 'array',
  's': 'boolean'
};
/**
 * format:格式定义
 * value:当前值
 * fromObj:条件检查getData时候使用，一般是字段验证当前顶层包的更上一层或者自定义的条件来源数据结构。
 * wrapObj:setData时候使用,一般就是字段验证的当前对象顶层包
 * pack:field value当前路径
 */
var V = (format, value, fieldid, fromObj, wrapObj, pack) => {
  if (!format) {
    return;
  }
  var type = null;
  if (format.type && format.type.length == 1) {
    if (format.type == 'i') {
      return;
    }
    type = typeMap[format.type];
    if (!type) type = 'string';
  } else {
    type = format.type ? format.type : 'string';
  }
  var err = null,
    required = format.required ? format.required : 'O',
    name = format.name ? format.name : fieldid;
  //value = value && value.value!=undefined ? value.value : value;
  var v_type = typeof value;
  /*
  if (required == 'R' && v_type != 'number' && type !== 'transfer' && !value) {
    return {
      fieldid: fieldid,
      errMsg: `${name} 不能为空`
    }
  }*/
  var it_format = null;
  var it_value = null;
  if (type != 'object' && type != "array") {
    if (type === 'transfer') {
      var vfor = format.value; //getData(wrapObj
      if (!vfor || vfor.length < 3) {
        return "转换格式配置空异常"
      }
      var srcV = vfor[0][0] === '$' ? getData(vfor[0].substr(1), wrapObj) : vfor[0];
      if (!srcV || !Array.isArray(srcV)) {
        return;
      }
      var targV = srcV && srcV.reduce((pre, cur) => {
        return pre + vfor[2] + (vfor[1] ? cur[vfor[1]] : cur);
      }, "");

      if (vfor.length === 3) {
        setData(fieldid, wrapObj, targV);
      } else if (vfor.length === 4) {
        if (operaterMap[vfor[3]]) {
          setData(fieldid, wrapObj, operaterMap[vfor[3]](targV));
        }
      }
    } else {
      err = v1(format, value, fieldid, fromObj, wrapObj, pack ? pack : fieldid);
      if (err && err.errMsg) {
        return err;
      }
    }
  } else {
    //console.log(`${fieldid}:${JSON.stringify(value)}`, format);
    if (type === "array" || (!Array.isArray(value) && format.force)) {
      v_type = 'array';
      if (required == 'R') {
        if (!value) {
          return {
            fieldid: fieldid,
            errMsg: `${name} 未输入`
          }
        } else if (typeof value.length == 'undefined') {
          //object force array
          if (isEmptyObj(value)) {
            return {
              fieldid: fieldid,
              errMsg: `${name} 不能为空对象`
            }
          }
        } else if (value.length == 0) {
          return {
            fieldid: fieldid,
            errMsg: `${name} 不能为空对象`
          }
        }
      } else if (!value) {
        return;
      }
      if (Array.isArray(value)) {
        if (format.length && format.fixed && value.length < format.length) {
          return {
            fieldid: fieldid,
            errMsg: `${name}数量限制，必须${format.length}个数据`
          }
        } else if (format.length && value.length > format.length) {
          return {
            fieldid: fieldid,
            errMsg: `${name}数量限制，最多${format.length}个数据`
          }
        }
      }

      it_format = format ? format["item"] : null;
      var len = 0;
      if (value && it_format) {
        for (var so in value) {
          len++;
          it_value = value[so] || value[so] == 0 ? value[so] : null; //{..}   
          err = V(it_format, it_value, so, fromObj, wrapObj, pack ? pack + "." + so : so);
          if (err && err.errMsg) {
            err.path = err.path ? so + "." + err.path : so;
            return err;
          }
        }
      }
      /*
      for (var i in it_format) {
        it_value = value ? value[i] : null;
        err = V(it_format[i], it_value, i, fromObj);
        if (err && err.errMsg) {
          return err;
        }
      }*/
    } else {
      if (v_type != 'undefined' && v_type != type) {
        return {
          fieldid: fieldid,
          errMsg: `${name}必须${type}类型`
        }
      }
      if (value) {
        if (required == 'R' && isEmptyObj(value)) {
          return {
            fieldid: fieldid,
            errMsg: `${name} 不能为空对象（数组）`
          }
        }
      } else {
        //console.log(`${name} :${fieldid} is null`);
      }
      it_format = format['item'] ? format['item'] : null; //k == modelitem_1:{...}
      if (!it_format) {
        return;
      }
      var len = 0;
      for (var j in it_format) {
        len++;
        it_value = value ? value[j] : null; //{..}        
        err = V(it_format[j], it_value, j, fromObj, wrapObj, pack ? pack + "." + j : j);
        if (err && err.errMsg) {
          err.path = err.path ? j + "." + err.path : j;
          return err;
        }
      }
      /*
      if (format.id === fieldid && format.length && format.fixed && len < format.length) {
        err = {};
        err.path = "";
        err.errMsg = `${format.name}数量限制，必须${format.length}个数据`;
        return err;
      } else if (format.id === fieldid && format.length && len > format.length) {
        err = {};
        err.path = "";
        err.errMsg = `${format.name}数量限制，最多${format.length}个数据`;
        return err;
      }*/
    } //end else == object   
  } //end else != object
}
var V2 = function (value) {
  var err = null;
  if ((value && typeof value.length != 'undefined') || typeof value == 'object') {
    for (var k in value) {
      err = V(value[k], value[k].value, k, value, value, `${k}.value`); //`[${k}].value`
      if (err && err.errMsg) {
        return err;
      }
    }
  }
  return err;
}

var v1 = function (format, value, fieldid, fromObj, wrapObj, pack) {
  if (!format) {
    return;
  };
  var type = null;
  if (format.type && format.type.length == 1) {
    type = typeMap[format.type];
    if (!type) type = 'string';
  } else {
    type = format.type ? format.type : 'string';
  }
  var err = null,
    required = format.required ? format.required : 'O',
    name = format.name ? format.name : fieldid,
    default_val = format.value || null;
  var v_type = typeof value;

  //console.log(`${fieldid}:${JSON.stringify(value)}`, format);

  if (type == 'string') {
    if (value && v_type != "undefined" && v_type != type) {
      return {
        fieldid: fieldid,
        errMsg: `${name}必须字符类型`
      }
    }
    if (required == 'R' && (!value || !value.trim() || value === undefined)) {
      if (!default_val) {
        return {
          fieldid: fieldid,
          errMsg: `${name} 必填`
        }
      } else {
        //初始默认值
        setData(pack, wrapObj, default_val);
      }
    } else if (required == 'C') {
      err = conditionCheck(format.condition, value, v_type, name, fromObj);
      if (err) {
        return err;
      }
    }
    if (format.length && format.fixed && value && value.length < format.length) {
      return {
        fieldid: fieldid,
        errMsg: `${name} 长度限制错误，定长${format.length}个字符`
      }
    } else if (format.length && value && value.length > format.length) {
      return {
        fieldid: fieldid,
        errMsg: `${name}长度限制错误， 最大长度${format.length}`
      }
    }
  } else if (type == "number") {
    if (v_type != "undefined" && v_type == 'string' && !isNaN(value)) {
      v_type = 'number';
      setData(pack, wrapObj, Number(value));
    }
    if (v_type != "undefined" && value && v_type != type) {
      return {
        fieldid: fieldid,
        errMsg: `${name}必须数字类型`
      }
    }
    if (required == 'R' && (value === null || value === '' || value === undefined)) {
      if (!default_val && default_val !== 0) {
        return {
          fieldid: fieldid,
          errMsg: `${name}必填`
        }
      } else {
        setData(pack, wrapObj, default_val);
      }
    } else if (required == 'C') {
      err = conditionCheck(format.condition, value, v_type, name, fromObj);
      if (err) {
        return err;
      }
    }
    if (value === undefined) {
      setData(pack, wrapObj, null)
    }
    if (format.length && format.fixed && value && (value + "").length < format.length) {
      return {
        fieldid: fieldid,
        errMsg: `${name} 长度限制错误，定长${format.length}位`
      }
    } else if (format.length && value && (value + "").length > format.length) {
      return {
        fieldid: fieldid,
        errMsg: `${name} 长度限制错误，最长${format.length}位`
      }
    }
  } else if (type == 'boolean') {
    if (v_type != "undefined" && v_type != type) {
      return {
        fieldid: fieldid,
        errMsg: `${name}必须布尔类型`
      }
    }
    if (required == 'R' && (value === null || value === '' || value === undefined)) {
      return {
        fieldid: fieldid,
        errMsg: `${name} 必填`
      }
    } else if (required == 'C') {
      err = conditionCheck(format.condition, value, v_type, name, fromObj);
      if (err) {
        return err;
      }
    }
    if (value == '') {
      value = false;
    }
  }
  if ((format.dict || type == 'dict') && required == 'R' && dict) {
    var dictlist = format.dictlist && Array.isArray(format.dictlist) && format.dictlist.length > 0 ? format.dictlist : (isNaN(format.dictlist) ? wx.getStorageSync(format.dictlist) : dict[format.dictlist]);
    if (dictlist && !dictlist.some((v, i, a) => {
      return v.code == value
    })) {
      return {
        fieldid: fieldid,
        errMsg: `${name} 的值${value}不在字典[${JSON.stringify(dictlist)}]中`
      }
    }
  }
}

module.exports = {
  V: V,
  V2: V2,
  getData: getData,
  setData: setData
}