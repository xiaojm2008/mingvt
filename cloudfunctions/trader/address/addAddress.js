// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

// 云函数入口函数
module.exports = async(event, context) => {
  const {
    address_info
  } = event;
  var db = cloud.database();
  const wxContext = cloud.getWXContext();
  address_info.openid = wxContext.OPENID;

  if (address_info.is_default) {
    await db.collection("xlh_address").where({
      openid: address_info.openid
    }).update({
      data: {
        is_default: 0
      }
    });
  }
  var _id = address_info._id;
  if (address_info._id != undefined) delete address_info._id;
  if (_id && _id != "") {
    address_info.updatetime = new Date().getTime();
    return db.collection("xlh_address").doc(_id).set({
      data: address_info
    });
  } else {
    //if(address_info._id != undefined) delete address_info._id;
    address_info.settime = new Date().getTime();
    address_info.updatetime = new Date().getTime();
    return db.collection("xlh_address").add({
      data: address_info
    });
  }
}