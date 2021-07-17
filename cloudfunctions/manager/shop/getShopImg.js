/**
 * 不用了，参考listShopImg
 */
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
  if (!shopid) {
    return {
      errMsg: '参数错误'
    }
  }
  return await db.collection('xlh_shopinfo').where({
    shopid: shopid
  }).field({imginfo2:1,_id:1}).get();
}