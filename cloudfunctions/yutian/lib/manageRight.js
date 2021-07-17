// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database();

var getUserRole = async (userid, shopid) => {
  return await db.collection('sys_userrole').where({
    shopid: shopid,
    userid: userid,
    status: '1'
  }).field({roles:true}).get();
}
var checkUserRight = async (type,actionname, userid, shopid) => {
  var cond = {};
  cond.shopid = shopid;
  cond.userid = userid;
  cond.rights[`${type}_${actionname}`].status='1';
  var userRight = await db.collection('sys_userright').where(cond).field(({ _id: true })).get();
  if(userRight.data.length > 0){
    return true;
  }  else {
    var roles = await getUserRole(userid,shopid);
    roles = roles.data && roles.data.length > 0 ? roles.data[0].roles:null;
    if (!roles){
      return false;
    }
    const cmd = db.command;
    var roleids = roles.map((v, i, a) => { return v.roleid; });
    cond.roleid = cmd.in(roleids);
    cond.rights[`${type}_${actionname}`].status = '1';
    var roleright = await db.collection('sys_roleright').where(cond).field({_id:true}).get();
    return roleright.data && roleright.data.length > 0;    
  }
} 
var checkRoleRight = async (type,actionname, roleid, shopid) => {
  var cond = {};
  cond.shopid = shopid;
  cond.roleid = roleid;
  cond.rights[`${type}_${actionname}`].status = '1';
  return await db.collection('sys_roleright').where(cond).get();
} 

module.exports = {
  checkUserRight: checkUserRight,
  checkRoleRight: checkRoleRight,
  getUserRole: getUserRole

}