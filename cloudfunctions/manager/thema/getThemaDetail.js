
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})

module.exports = async (event, wxContext) => {
  if(!event.themaid || !event.themaid.trim()){
    return {
      errMsg:"参数错误"
    }
  }
  const db = cloud.database();
 
  var selectField = {
    picpath:1,
    feetype:1,/**是否收费 */
    price:1,
    name:1,
    content:1,
    catetype:1,
    summary:1,
    status:1
  };
  return await db.collection("xlh_thema").doc(event.themaid).field(selectField).get();
}