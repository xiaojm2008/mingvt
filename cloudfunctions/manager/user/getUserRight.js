const getUserInfo = require('../comm/getUserInfo.js');
const manageRight = require('../comm/manageRight.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

// 云函数入口函数
module.exports = async(event, context) => {

  const {
    transtype,
    actionname,
    userid,
    shopid
  } = event;
  if(!userid || !shopid){
    return {
      errMsg:`参数错误`
    }
  }
  const wxContext = cloud.getWXContext();

  const oper_userid = wxContext.OPENID;
/*
  if (!phone) {
    return {
      errMsg: '需要用户手机号码不能为空'
    }
  }
*/
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
  var roleright = {};
  var role = await manageRight.getUserRole(userid, shopid);
  
  var roleids = Object.values(role.data && role.data.length > 0 && role.data[0].roles ? role.data[0].roles : {});
  roleids = roleids.filter(v => v.status == '1').map(v => v.roleid);
  
  //var roleids = Object.keys(role.data && role.data.length > 0 && role.data[0].roles ? role.data[0].roles : {});
  if (roleids && roleids.length > 0) {
    const cmd = db.command;
    var out = await db.collection('sys_roleright').where({
      shopid: shopid,
      roleid: cmd.in(roleids),
    }).field({
      _id: true,
      roleid: true,
      shopid: true,
      rights:true
    }).get();
    out = out.data && out.data.length > 0 ? out.data : [];
    out.forEach(v=>{
      Object.assign(roleright,v.rights);
    });
   }

  var userright = await db.collection('sys_userright').where({
    shopid: shopid,
    userid: userid
  }).field({
    _id: true,
    userid: true,
    shopid: true,
    rights: true
  }).get();
  userright = userright.data && userright.data.length > 0 ? userright.data[0] :{};

  var outRights = Object.assign(roleright||{},userright.rights||{});
  return { userid: userid, shopid: shopid, rights: outRights };
}