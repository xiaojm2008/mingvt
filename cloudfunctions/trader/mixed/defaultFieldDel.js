// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
//{temptype: this.data.temptype, category: category,field}
module.exports = async function (event, context) {
  const {
    temptype,
    category,
    field
  } = event;
  const _ = db.command;
  var data = {};
  data[field.fieldid] = _.remove();
  return await db.collection('sys_fieldtemplate').doc(field._id).update({data})
}
