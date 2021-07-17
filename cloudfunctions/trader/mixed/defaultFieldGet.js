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
      temptype: temptype
    },
    {
      openid: wxContext.OPENID,
      temptype: temptype
    }
  ])).orderBy("openid", "asc").get();

  var tmpField = [];
  field = field.data && field.data.length > 0 ? field.data : null;
  if (field) {
    if (field.length >= 2 && field[0].openid !== '0') {
      field.forEach((v, i) => {
        if (v.openid === '0') {
          tmpField.push(v);
        }
      })
      tmpField.push(field[0]);
      field = tmpField;
    }
  }
  return field;
}
