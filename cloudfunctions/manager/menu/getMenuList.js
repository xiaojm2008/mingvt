const query = require('../comm/query');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
/**
 * 获取用户拥有的菜单
 */
module.exports = async (event, wxContext) => {
  const {
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

  var check = await manageRight.checkUserRight(event.transtype, actionname, oper_userid, oper_shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var ctrlParams = {
    openid: oper_userid,
    page_size: 100,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: -1
  }

  var whereCondi = {
    shopid: oper_shopid,
    userid: oper_userid,
  };
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";
  var usermenu = await query('sys_usermenu', whereCondi, ctrlParams, null);
  usermenu = usermenu.data && usermenu.data.length > 0 ? usermenu.data[0] : null;
  
  if (!usermenu) {
    return {
      data: []
    }
  }
 

  var selectField = {
    _id: true,
    id: true,
    name: true,
    url: true,
    params: true,
    seq: true,
    children: true,
    icon: true
  };
  var whereCondi2={

  }
  var menu = await query('sys_menu', whereCondi2, ctrlParams, selectField);
  menu = menu.data && menu.data.length > 0 ? menu.data:null;
  if (!menu){
    return {
      data:[]
    }
  }
  var tmp = {},arr=[],m,mc,um,fi;
  for(var k in usermenu){
    m = menu.find((v,i,a)=>v.id==k), um = usermenu[k];
    if(m){
      tmp = {};
      Object.assign(tmp,m);
      tmp.children = [];
      arr.push(tmp);
    } else {
      continue;
    }
 
    if (Array.isArray(um) && Array.isArray(m.children)){
      mc = m.children;
      if(!mc || mc.length == 0){
        continue;
      }
      um.forEach((v,i,a)=>{
        fi = mc.find((mv,vi,va)=>mv.id==v)
        if(fi){
          tmp.children.push(fi);
        }
      })
    }
  }
  return {
    data:{
      userinfo: userInfo,
      menu:arr
      }
  }
}
