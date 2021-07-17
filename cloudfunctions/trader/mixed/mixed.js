const cloud = require('wx-server-sdk')
cloud.init({
  env:require("../env.js")
  })
const db = cloud.database({ env: require("../env.js").database }); //"xiaovt-9bie1" 

module.exports = async function (event,wxContext) {
  var dict = await db.collection('sys_dict').get();
  var cfg = await db.collection('sys_clientcfg').get();
  //var field = await defaultFieldGet();
  return {
    dict:dict.data && dict.data.length>0?dict.data[0]:null,
    clientcfg: cfg.data && cfg.data.length > 0 ? cfg.data[0] : null
    //fieldtemplate: field
  }
}
