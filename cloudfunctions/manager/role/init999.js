const getUserInfo = require('../comm/getUserInfo.js');
//获取所有菜单
const listMenu = require('../menu/listMenu.js');
//给角色分配菜单权限
const addRoleMenu = require('./addRoleMenu.js');
const addRoleRight = require('./addRoleRight.js');
const action = require("../action.js");
const constants = require("../comm/constants.js");
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();



var _addRoleMenu = async(event, wxContext, shopid) => {
  var res = await listMenu(event, wxContext);

  if (res.data && res.data.length) {

    var menus = res.data.reduce((pre, cur, a) => {
      pre[cur.id] = cur;
      if (cur.children && cur.children.length > 0) {
        cur.children = cur.children.reduce((p, c) => {
          p[c.id] = c;
          return p;
        }, {});
      }
      return pre;
    }, {});

    res = await addRoleMenu({
      roleid: constants.SYS_ROLEID,
      shopid: shopid,
      menus: menus
    }, wxContext);
  }
  return res;
}

var _addUserRole = async(userid, shopid) => {

  var res = await db.collection('sys_userrole').where({
    userid: userid,
    shopid: shopid
  }).field({
    userid: 1
  }).get();

  if (res.data && res.data.length > 0) {
    var cmd = db.command;
    res = await db.collection('sys_userrole').doc(res.data[0]._id).update({
      data: {
        roles: cmd.set({
          "9999": {
            roleid: constants.SYS_ROLEID,
            rolename: constants.SYS_ROLENAME,
            status: "1"
          }
        }),
        mod_userid: "1",
        updatetime: db.serverDate()
      }
    });
    if (res.stats && res.stats.updated) {
      return {
        success: 1,
        errMsg: `修改用户角色成功`
      }
    }
  } else {
    res = await db.collection('sys_userrole').add({
      data: {
        userid: userid,
        shopid: shopid,
        roles: {
          "9999": {
            roleid: constants.SYS_ROLEID,
            rolename: constants.SYS_ROLENAME, //"管理员",
            status: "1"
          }
        },
        create_userid: "1",
        updatetime: db.serverDate(),
        settime: db.serverDate()
      }
    });
    if (res._id) {
      return {
        success: 1,
        errMsg: `分配用户角色成功`
      }
    }
  }
  return res;
}
/**
 * 只有创建者才有权限执行，一般非外部接口，在shop/createShop.js中执行
 * 
 */
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
  if (!userInfo.shopinfo || userInfo.shopinfo.create_userid != constants.FOUNDER_ID) {
    return {
      errMsg: "只有创建者才有权限操作本功能"
    };
  }
  var userDo = await _addUserRole(oper_userid, userInfo.shopinfo.shopid);
  if (!userDo.success) {
    return userDo;
  }
  userDo = await _addRoleMenu(event, wxContext, userInfo.shopinfo.shopid);
  if (!userDo.success) {
    return userDo;
  }
  var rights = {};
  action.forEach((v) => {
    var right = v.children.reduce((p, c) => {
      p[c.type + "_" + c.id] = {
        "type": c.type,
        "actionname": c.id,
        "desc": c.name,
        "roleid": constants.SYS_ROLEID,
        "shopid": userInfo.shopinfo.shopid,
        "status": "1"
      }
      return p;
    }, {});
    Object.assign(rights, right);
  });
  userDo = await addRoleRight({
    roleid: constants.SYS_ROLEID,
    shopid: userInfo.shopinfo.shopid,
    rights: rights,
  }, wxContext);
  if (!userDo.success) {
    return userDo;
  }
  return {
    success: 1,
    errMsg: "操作成功"
  }
}