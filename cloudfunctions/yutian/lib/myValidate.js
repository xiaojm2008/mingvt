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
    if (obj[condition_f] == condition_v) {
      if (v_type == 'string' && (!value || !value.trim())) {
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
var myValidate = (format, value, fieldid, fromObj) => {
  var err = null,
    type = format.type ? format.type : 'string',
    required = format.required ? format.required : 'O'
  name = format.name ? format.name : fieldid;
  var v_type = typeof value;
  if (v_type == 'string' && type == 'number' && !isNaN(value)) {
    v_type = 'number';
  }
  var it_format = null;
  var it_value = null;
  if (v_type != 'object') {
    if (v_type == 'string') {
      if (v_type != type) {
        return {
          errMsg: `${name}必须字符类型`
        }
      }
      if (required == 'R' && (!value || !value.trim())) {
        return {
          errMsg: `${name} 不能为空`
        }
      } else if (required == 'C') {
        err = conditionCheck(format.condition, value, v_type, name, fromObj);
        if (err) {
          return err;
        }
      }

    } else if (v_type == "number") {
      /*if (value!=0 && !/^[-]?[0-9]+\.?[0-9]+?$/.test(value)){
        return {
          errMsg: `${name}：值${value}必须是number类型`
        }
      }  
      if (isNaN(value)){
        return {
          errMsg: `${name}：值${value}必须是number类型`
        }
      }
      */
      if (required == 'R' && (value === null || value === '')) {
        return {
          errMsg: `${name} 不能为空`
        }
      } else if (required == 'C') {
        err = conditionCheck(format.condition, value, v_type, name, fromObj);
        if (err) {
          return err;
        }
      }
      if (value == '') {
        value = null;
      }
    } else if (v_type == 'boolean') {
      if (required == 'R' && (value === null || value === '')) {
        return {
          errMsg: `${name} 不能为空`
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
    if (format.dict && format.dictlist && format.dictlist.length > 0) {
      if (!format.dictlist.some((v, i, a) => {
        return v.code == value
      })) {
        return {
          errMsg: `${name} 的值${value}不在字典[${JSON.stringify(format.dictlist)}]中`
        }
      }
    }

  } else {
    if (required == 'R' && !value) {
      return {
        errMsg: `${name} 不能为空`
      }
    }
    if (value && (format.force || typeof value.length != 'undefined')) {
      v_type = 'array';
      if (v_type != type) {
        return {
          errMsg: `${name}必须${type}类型`
        }
      }
      if (required == 'R' && (typeof value.length == 'undefined')) {
        //object
        var sff = Object.keys(value);
        if (sff.length == 0) {
          return {
            errMsg: `${name} 不能为空对象`
          }
        }
      }
      for (var i in value) {
        it_value = value[i];
        it_format = format['item'];
        err = validate(it_format, it_value, i, fromObj);
        if (err && err.errMsg) {
          return err;
        }
      }
    } else {
      if (v_type != type) {
        return {
          errMsg: `${name}必须${type}类型`
        }
      }
      if (value) {
        var kk = Object.keys(value);
        if (required == 'R' && kk.length == 0) {
          return {
            errMsg: `${name} 不能为空对象（数组）`
          }
        }
        for (var j = 0; j < kk.length; j++) {
          var k = kk[j];
          it_value = value[k]; //{..}
          it_format = format['item'] ? format['item'][k] : null; //k == modelitem_1:{...}
          if (!it_format) {
            continue;
          }
          err = validate(it_format, it_value, k, fromObj);
          if (err && err.errMsg) {
            return err;
          }
        }
      } else {
        console.log(`${name} :${fieldid} is null`);
      }
    } //end else == object   

  } //end else != object

}

module.exports = myValidate