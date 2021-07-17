
var crypto = require('crypto');
const base64 = require('base64-js');
const stringToUint8Array = require('./stringToUint8Array.js');
var encryptMD5 = (content, keyValue) => {
  var md5Str = null;
  if (keyValue != null) {
    md5Str = crypto.createHash('md5').update(content + keyValue).digest('hex').toLowerCase();
  } else {
    md5Str = crypto.createHash('md5').update(content).digest('hex').toLowerCase();
  }
  const arrayBuffer = stringToUint8Array(md5Str);
  return base64.fromByteArray(arrayBuffer);
}
module.exports = encryptMD5;