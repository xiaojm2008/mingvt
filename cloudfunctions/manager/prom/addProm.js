const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const mySeq = require('../comm/mySeq.js');
const promFormat = require("../comm/promFormat.js");
const V = require("../comm/validate.js").V;
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    prom
  } = event;
  /**
   * promFormat:格式配置
   * prom=>value检查的数据
   * prom=>fromObj条件判断条件字段的的来源对象
   * prom=>wrapObj有需要setData的字段，setData到的目标对象
   */
  var err = V(promFormat, prom, 'baseinfo', prom, prom, null);
  if (err && err.errMsg) {
    return err;
  }
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
  /*
  var res = db.collection('xlh_promotion').where({ promid: prom.promid }).get();
  if (res.data && res.data.length > 0) {
    return {
      errMsg: '活动已经存在'
    }
  }*/
  if(prom._id !== undefined){
    delete prom._id;
  }
  prom.promno = mySeq.mySeq32(mySeq.N3);
  //prom.goods = [];
  prom.settime = db.serverDate();
  prom.updatetime = db.serverDate();
  prom.shopid = userInfo.shopinfo.shopid;
  prom.shopname = userInfo.shopinfo.shopname;
  prom.create_userid = oper_userid;
  var res = await db.collection('xlh_promotion').add({ data: prom });
  if (res._id) {
    return {
      _id:res._id,
      promno: prom.promno,
      success: 1,
      errMsg: "提交成功"
    }
  }
  return res;
}