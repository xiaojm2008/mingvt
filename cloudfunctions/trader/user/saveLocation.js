// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();
  var location = {
    openid:wxContext.OPENID,
    latitude: event.latitude,
    longitude: event.longitude,
    accuracy: event.accuracy,
    speed: event.speed,
    altitude: event.altitude,
    verticalAccuracy: event.verticalAccuracy,
    horizontalAccuracy: event.horizontalAccuracy
  };
  location.locationtime = db.serverDate();
  return  await db.collection('xlh_userlocation').add({
    data: location
  });
}