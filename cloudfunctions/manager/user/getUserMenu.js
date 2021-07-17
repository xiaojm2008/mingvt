const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var assign = (src,target)=>{
  for(var k in target){
    if(src[k]){
  
      Object.assign(src[k],target[k]);
    } else {

    }
  }
}
// 云函数入口函数
module.exports = async(event, context) => {

  const {
    transtype,
    actionname
  } = event;
  var {
    userid,
    shopid
  } = event;
  var outUserInfo = false;
  if (!userid) {
    outUserInfo = true;
  }
  const wxContext = cloud.getWXContext();

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
  if (!outUserInfo) {
    var check = await manageRight.checkUserRight(transtype, actionname, oper_userid, oper_shopid);
    if (!check.auth) {
      return {
        errMsg: check.errMsg
      }
    }
  }
  userid = userid ? userid : oper_userid;
  shopid = shopid ? shopid : oper_shopid;

  var menus = {};
  var role = await manageRight.getUserRole(userid, shopid);

  var roleids = Object.values(role.data && role.data.length > 0 && role.data[0].roles ? role.data[0].roles : {});
  roleids = roleids.filter(v => v.status == '1').map(v => v.roleid);

  //var roleids = Object.keys(role.data && role.data.length > 0 && role.data[0].roles ? role.data[0].roles : {});
  if (roleids && roleids.length > 0) {
    const cmd = db.command;
    var out = await db.collection('sys_rolemenu').where({
      shopid: shopid,
      roleid: cmd.in(roleids),
    }).field({
      roleid: true,
      shopid: true,
      menus: true
    }).get();
    out = out.data && out.data.length > 0 ? out.data : [];
    out.forEach(v => {
      for(var m in v.menus){
        if(menus[m]){
          Object.assign(menus[m].children, v.menus[m].children);
        } else {
          menus[m]={};
          Object.assign(menus[m], v.menus[m]);
        }
      }
      //Object.assign(menus, v.menus);
    });
  }
  return {
    userid: userid,
    shopid: shopid,
    menus: menus,
    userinfo: outUserInfo ? userInfo : null
  };
}