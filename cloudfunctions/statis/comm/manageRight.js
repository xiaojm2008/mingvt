//const actionList = require('../action.js');
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database();

var getUserRole = async(userid, shopid) => {
  return await db.collection('sys_userrole').where({
    shopid: shopid,
    userid: userid
  }).field({
    roles: true
  }).get();
}
var checkUserRight = async(type, actionname, userid, shopid) => {
  var cond = {
      rights: {}
    },
    k = `${type}_${actionname}`;
  cond.shopid = shopid;
  cond.userid = userid;
  cond.rights[k] = {};
  cond.rights[k].status = '1';
  var userRight = await db.collection('sys_userright').where(cond).field(({
    _id: true
  })).get();
  if (userRight.data.length > 0) {
    return {
      auth: true
    };
  } else {
    var role = await getUserRole(userid, shopid);
    var roleids = Object.values(role.data && role.data.length > 0 && role.data[0].roles ? role.data[0].roles : {});
    roleids = roleids.filter(v => v.status == '1').map(v => v.roleid);
    //var roleids = Object.keys(role.data && role.data.length > 0 && role.data[0].roles ? role.data[0].roles : {});
    if (roleids.length == 0) {
      return {
        auth: false,
        errMsg: `您没有【${getRightDesc(type, actionname)}】操作的权限` 
      };
    }
    const cmd = db.command;
    cond = {
      rights: {}
    };
    cond.shopid = shopid;
    cond.roleid = cmd.in(roleids);
    cond.rights[k] = {};
    cond.rights[k].status = '1';
    var roleright = await db.collection('sys_roleright').where(cond).field({
      _id: true
    }).get();
    return {
      auth: roleright.data && roleright.data.length > 0,
      errMsg: roleright.data && roleright.data.length > 0 ? '' : `您没有${getRightDesc(type, actionname)}操作的权限` 
    };
  }
}
var checkRoleRight = async(type, actionname, roleid, shopid) => {
  var cond = {};
  cond.shopid = shopid;
  cond.roleid = roleid;
  cond.rights[`${type}_${actionname}`].status = '1';
  return await db.collection('sys_roleright').where(cond).get();
}

var getRightDesc = (type, actionname) => { 
  return actionname;
}
//getRightDesc: getRightDesc,
module.exports = {
  getRightDesc:getRightDesc,
  checkUserRight: checkUserRight,
  checkRoleRight: checkRoleRight,
  getUserRole: getUserRole
}