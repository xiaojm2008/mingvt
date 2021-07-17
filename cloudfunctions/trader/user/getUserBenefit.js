// 云函数入口文件
const cloud = require('wx-server-sdk')
const uuid = require('uuid');
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const MAX_MEMBER_NUM = 10;
const M = 1000;
const N = 9999;
var genInvitationCode = async function(ben) {
  var max_invitation = MAX_MEMBER_NUM;
  var config = await db.collection('sys_config').get();
  config = config.data && config.data.length > 0 ? config.data[0] : null;
  if (config) {
    max_invitation = config.max_invitation || MAX_MEMBER_NUM;
  }
  max_invitation = ben.level == 'A' || ben.level == 'B' ? (ben.max_membernum || max_invitation) : 999999999;

  if ((ben.membernum || 0) > max_invitation) {
    return {
      errMsg: `生成邀请码失败，您最多可邀请${max_invitation}人加入`
    }
  }

  //ben.invitation_code = Math.floor(Math.random() * (N + 1 - M) + M);
  var uuid4 = uuid.v4();
  if (!uuid) {
    return {
      errMsg: `生成邀请码失败，uuid 异常`
    }
  }
  var invitation_code = uuid4 ? uuid4.replace(/-/g, '') : null;
  var invitation_expired = 5000 * 60;
  if (config) {
    invitation_expired = config.invitation_expired || 5000 * 60;
  }
  var invitation_time = new Date().getTime();
  invitation_expired = ben.level == 'A' || ben.level == 'B' ? invitation_time + invitation_expired : 0;
  var invitationlog = {
    openid: ben.openid,
    level: ben.level,
    max_invitation: max_invitation,
    invitation_code: invitation_code,
    invitation_time: invitation_time,
    invitation_expired: invitation_expired
  };

  await db.collection('xlh_invitationlog').add({
    data: invitationlog
  });
  /*
    var upd = await db.collection('xlh_userbenefit').where({
      openid: ben.openid
    }).update({
      data: {
        invitation_code: ben.invitation_code,
        invitation_time: ben.invitation_time,
        invitation_expired: ben.invitation_expired
      }
    });
    if (upd.stats.updated != 1) {
      return {
        errMsg: "生成邀请码失败"
      }
    }
    */
  return invitationlog;
}
// 云函数入口函数
module.exports = async(event, context) => {
  const {
    gen
  } = event;
  const wxContext = cloud.getWXContext()
  try {
    var ben = await db.collection('xlh_userbenefit').where({
      openid: wxContext.OPENID
    }).field({ level: true, max_membernum: true, membernum:true, openid:true}).get();
    ben = ben && ben.data.length > 0 ? ben.data[0] : null;
    if (gen == 1 && ben) {
      return await genInvitationCode(ben);
    } else if (!ben) {
      return {
        errMsg: '用户权益信息不存在'
      }
    }
    return ben;
  } catch (err) {
    return {
      errMsg: err.message || err.errMsg
    }
  }
}