const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
var delRoleMenu = async(event, wxContext,parentid) => {
  var where = {
      menus: {}
    },
    data = {
      menus: {}
    },
    cmd = db.command;
  if (parentid){
    //直接删除父菜单权限
    where.menus[parentid] = cmd.neq(null);
    data.menus[parentid] = cmd.remove();
  } else if (event.menu.parentid) {
    //删除子菜单
    where.menus[event.menu.parentid] = { children:{}};
    where.menus[event.menu.parentid].children[event.menu.id] = cmd.neq(null);
    data.menus[event.menu.parentid] = { children: {}};
    data.menus[event.menu.parentid].children[event.menu.id] = cmd.remove();
  } else {
    //删除父菜单权限
    where.menus[event.menu.id] = cmd.neq(null);
    data.menus[event.menu.id] = cmd.remove();
  }
  return await db.collection('sys_rolemenu').where(where).update({
    data: data
  });
}
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    menu
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
  var res = await db.collection('sys_menu').where({
    id: menu.parentid ? menu.parentid : menu.id
  }).field({
    children: true
  }).get();
  if (!res.data || res.data.length == 0) {
    return {
      errMsg: '菜单不存在'
    }
  }
  if (!menu.parentid) {
    if (res.data[0].children && res.data[0].children.length > 0) {
      if (res.data[0].children.some(v => v)) {
        return {
          errMsg: '菜单下面还有子菜单，请先删除子菜单'
        }
      }
    }
    res = await delRoleMenu(event,wxContext);
    var removerolemenu = res.stats?res.stats.updated:null;
    res = await db.collection('sys_menu').where({
      id: menu.id
    }).remove();
    if (res.stats.removed == 1) {
      return {
        success: 1,
        removerolemenu: removerolemenu,
        errMsg: '删除菜单成功'
      }
    } else {
      return {
        removerolemenu: removerolemenu,
        errMsg: '删除菜单失败'
      }
    }
  }

  if (!menu.parentid || menu.parentid.trim() == '') {
    return {
      errMsg: '父菜单ID不能为空'
    }
  }

  var children = res.data[0].children,
    j = -1,
    nullnum = 0,
    where = {
      id: menu.parentid,
      children: {}
    },
    data = {
      children: {}
    };
  const cmd = db.command;
  var child = children.find((v, i) => {
    if (!v) {
      nullnum++;
    } else if (v.id == menu.id) {
      j = i;
      return true;
    };
  });
  if (nullnum == children.length) {
    res = await delRoleMenu(event, wxContext, menu.parentid);
    var removerolemenu = res.stats ? res.stats.updated : null;
    res = await db.collection('sys_menu').where({
      id: menu.parentid
    }).remove();
    if (res.stats.removed == 1) {
      return {
        success: 1,
        removerolemenu: removerolemenu,
        errMsg: '删除父菜单成功'
      }
    } else {
      return {
        removerolemenu: removerolemenu,
        errMsg: '删除父菜单失败'
      }
    }
  }
  if (child) {
    res = await delRoleMenu(event, wxContext);
    var removerolemenu = res.stats ? res.stats.updated : null;
    where.children[j] = {};
    where.children[j].id = menu.id;
    data.children[j] = cmd.remove();
    res = await db.collection('sys_menu').where(where).update({
      data: data
    });
    if (res.stats.updated == 1) {
      return {
        success: 1,
        removerolemenu: removerolemenu,
        errMsg: '删除子菜单成功'
      }
    } else {
      return {
        removerolemenu: removerolemenu,
        errMsg: '删除子菜单失败'
      }
    }
  } else {
    return {
      errMsg: '子菜单不存在'
    }
  }
}