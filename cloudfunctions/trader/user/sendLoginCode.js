var request = require('request');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
//session_key,openid,errmsg,errcode
var saveSessionKey = (resp, openid) => {
  return db.collection('xlh_userinfo').doc(openid).update({
    data: {
      is_login: '1',
      unionid: resp.unionid || '',
      session_key: resp.session_key || ''
    }
  });
}
/*
{"code":"011ZraRz1VjfBc0q2aQz1EQKQz1ZraR0","transtype":"user","actionname":"sendLoginCode"}
*/
module.exports = async (event, context) => {
  const {
    code
  } = event;
  const wxContext = cloud.getWXContext();
  var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wxContext.APPID}&secret=6b20425862b29d2d54dd66a4533f8e69&js_code=${code}&grant_type=authorization_code`;

  return new Promise((resovle, reject) => {
    request({
      url: url
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body) // 请求成功的处理逻辑  session_key errcode = 0 errmsg
        var resp = typeof body == 'string' ? JSON.parse(body) : body;
        if (resp && resp.session_key) {
          saveSessionKey(resp, wxContext.OPENID).then(res => {
            if (res && res.stats && res.stats.updated > 0) {
              resovle({
                is_login: '1',
                openid: resp.openid,
                errMsg: resp.errmsg || '',
                errcode: resp.errcode || '0'
              });
            } else {
              resovle({
                is_login: '2',
                openid: resp.openid,
                errMsg: resp.errmsg,
                errcode: resp.errcode
              });
            }
          }).catch(err => {
            resovle({
              is_login: '2',
              openid: resp.openid,
              errMsg: resp.errmsg + ":" + err.message || err.errMsg,
              errcode: resp.errcode
            });
          });
        } else {
          resovle({
            is_login: '0',
            openid: resp.openid,
            errMsg: resp.errmsg,
            errcode: resp.errcode
          });
        }
      } else {
        reject(error, body)
      }
    })
  });
}