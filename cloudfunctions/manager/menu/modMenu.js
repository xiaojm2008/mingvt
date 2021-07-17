const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
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
  if (!menu.originid) {
    return {
      errMsg: '原菜单ID不能为空'
    }
  }
  var res = await db.collection('sys_menu').where({
    id: menu.parentid ? menu.parentid : menu.originid
  }).field({
    children: true
  }).get();
  if (!res.data || res.data.length == 0) {
    return {
      errMsg: '菜单不存在'
    }
  }
  if (menu.level == 1) {
    res = await db.collection('sys_menu').where({
      id: menu.originid
    }).update({
      data: {
        id: menu.id,
        name: menu.name,
        icon: menu.icon,
        params: menu.params,
        seq: menu.seq,
        url: menu.url,
        summary: menu.summary,
        status: menu.status
      }
    });
    if (res.stats.updated == 1) {
      return {
        success: 1,
        errMsg: '更新菜单成功'
      }
    } else {
      return {
        errMsg: '更新菜单失败'
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
      return false;
    }
    if (v.id == menu.originid) {
      j = i;
      return true;
    };
  });
  if (!child) {
    if (menu.originid.length != 6) {
      return {
        success: 0,
        errMsg: '更新子菜单失败，子菜单ID格式错误'
      }
    }
    var subindex = parseInt(menu.originid.substr(3));

    if (subindex < children.length) {
      where.children[subindex] = cmd.eq(null);
      data.children[subindex] = cmd.set(menu);
    } else {
      return {
        errMsg: '子菜单索引溢出'
      }
    }
  } else {
    where.children[j] = {};
    where.children[j].id = menu.originid;
    data.children[j] = menu;
  }

  res = await db.collection('sys_menu').where(where).update({
    data: data
  });
  if (res.stats.updated == 1) {
    return {
      success: 1,
      errMsg: '更新子菜单成功'
    }
  } else {
    return {
      errMsg: '更新子菜单失败'
    }
  }
}