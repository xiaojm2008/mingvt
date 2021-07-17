var request = require('request');

var sendPost = (url, params, callback) => {
  console.log('sendPost', params);
  /*
  request.post({
    url: url,
    form: params
  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // 请求成功的处理逻辑  
      callback(null, body);
    } else {
      callback(error, body)
    }
  });
*/
  var str = '';
  Object.keys(params).forEach((v, i, a) => {
    if (a.length > 0) {
      str += "&";
    }
    str += v;
    str += '=';
    str += params[v];
  });
  request({
    url: url,
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: str
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // 请求成功的处理逻辑  
      callback(null, body);
    } else {
      callback(error, body)
    }
  });
}
module.exports = sendPost;