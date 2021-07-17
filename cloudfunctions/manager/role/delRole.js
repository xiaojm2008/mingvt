const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const getRoleInfo = require('./getRoleInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var delUserRole = async(event, wxContext) => {
  const cmd = db.command;
  var where = {
      roles: {}
    },
    data = {
      roles: {}
    };
  where.roles[event.roleid] = cmd.neq(null);
  data.roles[event.roleid] = cmd.remove();
  return await db.collection('sys_userrole').where(where).update({
    data: data
  });
}
var delRoleRight = async(event, wxContext) => {
  return await db.collection('sys_roleright').where({
    roleid: event.roleid,
    shopid: event.shopid
  }).remove();
}
var delRoleMenu = async (event, wxContext) => {
  return await db.collection('sys_rolemenu').where({
    roleid: event.roleid,
    shopid: event.shopid
  }).remove();
}

var delUserRightFromRole = async(event, wxContext) => {
  var res = await db.collection('sys_roleright').where({
    shopid: event.shopid,
    roleid: event.roleid
  }).field({
    rights: true
  }).get();
  if (res.data && res.data.length >= 0) {
    var rights = res.data[0] ? res.data[0].rights : null;
    if (!rights) {
      return {
        removeuserright: 0
      }
    }
    var tasks = [];
    for (var right in rights) {
      var cmd = db.command;
      var where = {
          rights: {},
          shopid: event.shopid
        },
        data = {
          rights: {}
        };
      where.rights[right] = {};
      where.rights[right].roleid = cmd.neq(null)
      //where.rights[right].mod_userid = cmd.eq(null)
      data.rights[right] = cmd.remove();
      tasks.push(db.collection('sys_userright').where(where).update({
        data: data
      }));
    }
    if (tasks.length > 0) {
      Promise.all(tasks).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      });
    }
  }
  return {
    removeuserright: 0
  }

}
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname
  } = event;

  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  const oper_shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
  if (!oper_shopid) {
    return {
      errMsg: '您还未开店，信息不存在'
    }
  }
  var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
  var res = await db.collection('sys_role').where({
    roleid: event.roleid,
    shopid: event.shopid
  }).remove();
  if (res.stats.removed == 1) {
    //还需要删除sys_userrole
    delUserRightFromRole(event, wxContext);
    res = await delUserRole(event, wxContext);
    var res2 = await delRoleRight(event, wxContext);
    var res3 = await delRoleMenu(event, wxContext);
    return {
      success: 1,
      roleid: event.roleid,
      removeuserrole: res.stats?res.stats.updated:null,
      removeroleright: res2.stats? res2.stats.removed:null,
      removerolemenu:res3.stats?res3.stats.removed:null,
      errMsg: `删除角色成功`
    }
  } else if (res.stats.removed == 0) {
    delUserRightFromRole(event, wxContext);
    res = await delUserRole(event, wxContext);
    var res2 = await delRoleRight(event, wxContext);
    var res3 = await delRoleMenu(event, wxContext);
    return {
      success: 1,
      roleid: event.roleid,
      removeuserrole: res.stats?res.stats.updated:null,
      removeroleright: res2.stats?res2.stats.removed:null,
      removerolemenu: res3.stats ? res3.stats.removed : null,
      errMsg: `角色不存在`
    }
  }
  return res;
}