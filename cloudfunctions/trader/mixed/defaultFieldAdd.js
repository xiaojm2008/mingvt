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
    category
  } = event;
  const wxContext = cloud.getWXContext();
  var data={},where={};
  
  data[event.field.id] = event.field;

  if(event.field.tempid === 1){
    data["openid"] = wxContext.OPENID;
    where.openid = wxContext.OPENID;
  } else {
    data["openid"] = "0";
    where.openid ="0";
  }
  //const cmd = db.command;
  where.temptype = temptype;
  where.category = category;
  //where[event.field.id] = { id: event.field.id}; 
  var res = null;
  var exists = await db.collection('sys_fieldtemplate').where(where).field({temptype:1}).limit(1).get();

  if(exists && exists.data && exists.data.length > 0){
    res = await db.collection('sys_fieldtemplate').doc(exists.data[0]._id).update({
      data
    });
    if (res.stats.updated === 1) {
      return {
        success: 1,
        updated:res.stats.updated,
        errMsg: "新增字段成功"
      }
    } 
  } else {
    data["temptype"] = temptype;
    data["category"] = category;
    res = await db.collection('sys_fieldtemplate').add({
      data
    });
    if(res._id){
      return {
        success:1,
        _id:res._id,
        errMsg:"新增字段成功"
      }
    }
  }
  return {
    success:0,
    errMsg: res.result?(res.result.errMsg || res.errMsg):'未处理'
  }
}
