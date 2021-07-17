//const query = require('yutian').query;
const query = require('../comm/query');
//const manageRight = require('../comm/manageRight.js');
//const getUserInfo = require('../comm/getUserInfo.js');

module.exports = async (event, wxContext) => {
  const userid = wxContext.OPENID;
/*
  var userInfo = await getUserInfo(userid);
  if (userInfo.errMsg) {
    return userInfo;
  }
  const shopid = userInfo.shopinfo ? userInfo.shopinfo.shopid : '';
  if (!shopid) {
    return {
      errMsg: '您还未开店，信息不存在'
    }
  }

  var check = await manageRight.checkUserRight(event.transtype, actionname, userid, shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }
*/
  var ctrlParams = {
    openid: userid,
    page_size:null,
    orderby_field: "code",
    orderby_type: "asc",
    batch_time: -1
  }
  var selectField = {
   code:1,
   name:1,
   summary:1
  };
  //event.status && event.status != "" ? (whereCondi.status = event.status) : "";
  return await query('sys_expcode_kdn', {}, ctrlParams, selectField);
}
