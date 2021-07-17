const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    shopid
  } = event;

  const oper_userid = wxContext.OPENID;
  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var selectField = {
    userid: 1,
    shopid: 1,
    shopname: 1,
    imginfo: 1,
    shoppic: 1,
    phone: 1,
    contact: 1,
    address: 1,
    latitude: 1,
    longitude: 1,
    opentime: 1,
    closetime: 1,
    summary: 1,
    status: 1,
    updatetime: 1,
  };
  /**
   *  basic:1,概况
  facilities: 1,环境设施
  services: 1,特色服务
  ensure: 1,保障服务
  consumeway: 1,消费方式
  trafficperipheral: 1,周边交通及商圈
  parameter: 1,其他参数，包括自定义
   * 
   */
  return await db.collection('xlh_shopinfo').where({
    shopid: shopid
  }).get();
}