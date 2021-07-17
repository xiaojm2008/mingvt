var payConfig = require('../payConfig.js');
var getField = require('../comm/getXmlField.js');
var nonceStr = require('../comm/nonceStr.js');
var crypto = require('crypto');
var request = require('request');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var getResult = (body) => {
  var sandbox_signkey = getField(body, "sandbox_signkey");
  console.log('sandbox_signkey=', sandbox_signkey);
  var return_msg = getField(body, "return_msg");
  console.log('return_msg=', return_msg);
  var return_code = getField(body, "return_code");
  console.log('return_code=', return_code);
  db.collection('xlh_wxsandboxkey').add({
    data: {
      sandbox_signkey: sandbox_signkey,
      return_code: return_code,
      return_msg: return_msg      
    }
  });
  if (return_code == "SUCCESS" || return_code == "<![CDATA[SUCCESS]]>") {
    return {
      sandbox_signkey: sandbox_signkey,
      return_msg: return_msg
    };
  } else {
    return {
      sandbox_signkey: sandbox_signkey,
      return_msg: return_msg,
      return_code: return_code
    };
  }
}
var genReqSign = (oDetail) => {
  var str = `mch_id=${payConfig.mch_id}&nonce_str=${nonce_str}&key=${payConfig.key}`;
  oDetail.sign=crypto.createHash('md5').update(str).digest('hex');//.toUpperCase();
}

var initReqBody = (oDetail) => {
  return `<xml>
   <mch_id>${payConfig.mch_id}</mch_id>
   <nonce_str>${oDetail.nonce_str}</nonce_str>
   <sign>${oDetail.sign}</sign>
  </xml>`;
}

module.exports = async (oDetail) => {
  oDetail.nonce_str = nonceStr();

  genReqSign(oDetail);

  var reqParams = initReqBody(oDetail);

  return new Promise((resolve, reject) => request({
    url: payConfig.gesignkey_url,
    method: 'POST',
    body: reqParams
  }, (err, res, body) => {
    if (!body) {
      reject({
        errMsg: "返回报文未空"
      })
      return;
    }
    var result = getResult(body, oDetail);
    resolve(result);
  }));
}