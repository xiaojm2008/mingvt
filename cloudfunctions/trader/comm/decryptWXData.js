var WXBizDataCrypt = require('./WXBizDataCrypt')
var getUserInfo = require('../user/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})

module.exports = async (event, context) => {

  const {
    encryptedData,
    iv, //加密算法的初始向量，详细见加密数据解密算法
    cloudID //敏感数据对应的云 ID，开通云开发的小程序才会返回
  } = event;

  const wxContext = cloud.getWXContext();
  const db = cloud.database({
    throwOnNotFound: false
  });

  var userInfo = await db.collection('xlh_userinfo').doc(wxContext.OPENID).field({ session_key:1}).get();
  userInfo = userInfo.data;
  if (userInfo && userInfo.session_key) {
    var pc = new WXBizDataCrypt(wxContext.APPID, userInfo.session_key);
    var data = pc.decryptData(encryptedData, iv);
    console.debug('解密后 data: ', data);
    return {
      is_login: '1',
      data: data
    }
  } else {
    return {
      is_login: '0',
      data: null,
      errMsg: '您还未登陆'
    }
  }
}