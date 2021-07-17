var payConfig = require('../payConfig.js');
var crypto = require('crypto');
var checkSign = (result) => {
  var sign = result.sign.toUpperCase();
  var checkStr="";
  var arr = Object.keys(result).sort();

  for (var key in arr){
    if (!result[arr[key]] || arr[key] == "sign"){
      continue
    }
    checkStr += `${arr[key]}=${result[arr[key]]}&`;
  }
  checkStr += `key=${payConfig.key}`;
  //checkStr = checkStr.substring(0, checkStr.lastIndexOf('&'));
  var sign2 = crypto.createHash('md5').update(checkStr).digest('hex').toUpperCase();
  return sign == sign2;
}
module.exports = checkSign;