// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database();
// 云函数入口函数
module.exports = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    invitation_code
  } = event;
  var invitationlog = await db.collection('xlh_invitationlog').where({
    invitation_code: invitation_code
  }).get();
  invitationlog = invitationlog.data && invitationlog.data.length > 0 ? invitationlog.data[0] : null;
  if (!invitationlog) {
    return {
      errMsg: "邀请码不存在"
    }
  }
  if (invitationlog.invitation_expired) {
    var now = new Date().getTime();
    if (now > invitationlog.invitation_expired) {
      return {
        errMsg: "邀请码已经过期"
      }
    }
    if (invitationlog.status == '1') {
      return {
        errMsg: "邀请码已使用"
      }
    }
  }

  var join_time = new Date().getTime();
  var userInfo = await db.collection('xlh_userinfo').where({
    openid: wxContext.OPENID
  }).field({
    openid: true,
    username: true,
    nickname: true,
    phone: true,
    avatarurl: true
  }).get();
  userInfo = userInfo.data && userInfo.data.length > 0 ? userInfo.data[0] : null;
  if (!userInfo) {
    return {
      errMsg: "您还未注册或者登陆验证用户信息！"
    }
  }
  var p_userInfo = await db.collection('xlh_userinfo').where({
    openid: invitationlog.openid
  }).field({
    openid: true,
    username: true,
    nickname: true,
    phone: true,
    avatarurl: true
  }).get();
  p_userInfo = p_userInfo.data && p_userInfo.data.length > 0 ? p_userInfo.data[0] : null;
  if (!p_userInfo) {
    return {
      errMsg: "团队邀请人未注册或账户异常！"
    }
  }
  var my_level = invitationlog.level == 'A' || invitationlog.level == 'B' ? String.fromCharCode(invitationlog.level.charCodeAt() + 1) : 'C';
  var myTeam = {
    openid: wxContext.OPENID,
    level: my_level,
    username: userInfo.username,
    nickname: userInfo.nickname,
    phone: userInfo.phone,
    avatarurl: userInfo.avatarurl,
    p_avatarurl: p_userInfo.avatarurl,
    p_openid: p_userInfo.openid,
    p_username: p_userInfo.username,
    p_nickname: p_userInfo.nickname,
    p_phone: p_userInfo.phone,
    p_level: invitationlog.level,
    invitation_code: invitation_code,
    settime: join_time,
    updatetime: join_time
  };
  var exists = await db.collection('xlh_myteam').where({
    openid: wxContext.OPENID
  }).field({
    _id: true,
    invitation_code: true,
    origin_teams: true,
  }).get();
  exists = exists.data && exists.data.length > 0 ? exists.data[0] : null;
  if (!exists) {
    /* 
    return {
      errMsg: "您已经加入了其他团队，不能再重复加入"
    }
    */
    var res = await db.collection("xlh_myteam").add({
      data: myTeam
    });
  } else {
    if (exists.invitation_code == invitation_code) {
      myTeam.message = "您已经成功加入不需要重新申请";
    } else {
      if (!exists.origin_teams || (exists.origin_teams && exists.origin_teams.length < 10)) {
        //myTeam = exists;
        //myTeam.message = "您已经加入了其他团队，不能再重复加入";
        const cmd = db.command;
        myTeam.origin_teams = cmd.push([exists]);
        await db.collection('xlh_myteam').doc(exists._id).update({
          data: myTeam
        });
        myTeam.message = "您已经成功加入新的团队";
      } else {
        myTeam.message = "请不需要多次申请变更团队";
      }
    }
  }
  var my_benefit = await db.collection("xlh_userbenefit").where({
    openid: wxContext.OPENID
  }).get();

  my_benefit = my_benefit.data && my_benefit.data.length > 0 ? my_benefit.data[0] : null;
  if (!my_benefit) {
    my_benefit = {
      openid: wxContext.openid,
      username: userInfo.username,
      phone: userInfo.phone,
      level: my_level,
      invitation_code: invitation_code,
      can_cashout: null,
      cashout: 0,
      commission: 0,
      income: 0,
      rewards: 0,
      settime: join_time,
      updatetime: join_time
    };
    await db.collection("xlh_userbenefit").add({
      data: my_benefit
    });
  } else {
    if (exists.invitation_code != invitation_code) {
      await db.collection("xlh_userbenefit").doc(my_benefit._id).update({
        data: {
          origin_level: my_benefit.level,
          level: my_level,
          origin_invitationcode: my_benefit.invitation_code,
          invitation_code: invitation_code,
          updatetime: join_time
        }
      });
    }
  }
  if (invitationlog.invitation_expired) {
    //更新有过期时间的邀请状态
    await db.collection('xlh_invitationlog').doc(invitationlog._id).update({
      data: {
        status: "1"
      }
    });
  }
  return myTeam;
}