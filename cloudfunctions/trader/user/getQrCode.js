// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database({
  env:"xiaovt-818we"
});

var getUserBenfit = async function(userid) {
  var userBenfit = await db.collection('xlh_userbenefit').where({
    openid: userid
  }).get();
  return userBenfit && userBenfit.data.length > 0 ? userBenfit.data[0] : null;
}
var saveQR = async function(userid, qr) {
  var file = await cloud.uploadFile({
    cloudPath: `qr/${userid}_invitation.png`,
    fileContent: qr.buffer,
  });
  /*if (file.fileID) {
    var stats = await db.collection('xlh_userbenefit').where({
      openid: userid
    }).update({
      data: {
        qr_path: file.fileID
      }
    });
    if (stats.stats.updated != 1) {
      return file.fileID;
    }
    return file.fileID;
  }*/
  return file.fileID;
}
// 云函数入口函数
module.exports = async(event, context) => {
  const {
    width,
    scene,
    content,
    user_level,
    user_id
  } = event;
  var debug = false;

  /*
    var userBenefit = await getUserBenfit(user_id);
   
    if (userBenefit && userBenefit.level != 'A' && userBenefit.level != 'B' && userBenefit.qr_path) {
        return {
          buffer: userBenefit.qr_path,
          contentType: "string",
        };   
    }
*/
  const config = await db.collection('sys_config').get();
  if (config.data && config.data.length > 0) {
    debug = config.data[0].debug;
  }
  var siginin = 'act/siginin/siginin';
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: scene,
    page: debug ? null : siginin,
    width: width||430
  })
  if (!result.buffer || result.buffer.byteLength == 0) {
    return {
      errMsg: "生成二维码失败！"
    };
  }
  return result;
  /*
  var fileId = await saveQR(user_id, result);
  return {
    buffer: fileId,
    contentType: "string",
  };
*/
}