// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async (event, context) => {
  //const wxContext = cloud.getWXContext();

  const db = cloud.database({
    throwOnNotFound:true
  });
  /**
   * result:[
   *  enrollform:{
   *  }
   * ]
   */
  var res2 = null;
  var res1 = await db.collection('xlh_enrollform').doc(event.actionid).get();
  if(event.actioninfo){
    res2 = await db.collection('xlh_enrollaction').doc(event.actionid).field({
      actionid:1,
      actionname:1,
      apprflag:1,
      feetype:1,
      basedir:1,
      status:1,//100039 0:"启动",1:"暂停",2:"结束",9:"删除"
      enrollbegintime:1,
      enrollendtime:1,
      actbegintime:1,
      actendtime:1
    }).get();
  }
  return {
    data:{
      enrollform:res1.data.enrollform,
      enrollaction:res2?res2.data:null
    }
  }
}