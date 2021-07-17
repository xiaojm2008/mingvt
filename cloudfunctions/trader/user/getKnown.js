const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
module.exports = async (event, context) => {
  const {
    field
  } = event;
  const db = cloud.database();
  var outField = {};  
  outField = field ? outField[field] = true : null;
  return outField ? await db.collection('xlh_known').field(outField).get() : await db.collection('xlh_known').get();
}