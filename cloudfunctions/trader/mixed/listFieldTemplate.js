// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
//{temptype: this.data.temptype, category: category}
module.exports = async function (event, context) {
  const {
    temptype,
    category
  } = event;
  const wxContext = cloud.getWXContext();
  const _ = db.command;
  var field = await db.collection('sys_fieldtemplate').where(_.or([
    {
      openid: '0',
      temptype: {
        $regex: '.*' + temptype,
        $options: 'i'
      }
    },
    {
      openid: wxContext.OPENID,
      temptype: {
        $regex: '.*' + temptype,
        $options: 'i'
      }
    }
  ])).orderBy("openid", "asc").orderBy("temptype", "asc").get();
  return field;
}
