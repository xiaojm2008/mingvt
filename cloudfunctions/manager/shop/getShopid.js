const getUser = require('../comm/getUser.js');
const mySeq = require('../comm/mySeq.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
module.exports = async(event, wxContext) => {

  const oper_userid = wxContext.OPENID;

  var userinfo = await getUser(oper_userid);

  if (userinfo.sysadmin != "1") {

    res = await db.collection('xlh_shopinfo').where({
      userid: oper_userid
    }).field({
      shopid: 1
    }).get();

    if (res.data && res.data.length > 1) {
      return {
        errMsg: '一个账号最多只能开一个店铺'
      }
    }
  }

  const transaction = await db.startTransaction();

  var shopid = mySeq.mySeq32("SHP");

  var res = await transaction.collection('seq_shopid').doc(shopid).get();
  if (res.data && res.data.length > 0) {
    await transaction.rollback();
    return {
      errMsg: '唯一性系统检查错误，请重试'
    }
  }
  const basedir =  userinfo.basedir + "shop/"+shopid+"/";
  res = await transaction.collection('seq_shopid').doc(shopid).set({
    data: {
      basedir: basedir,
      shopid: shopid,
      userid:oper_userid,
      status:'0'
    }
  });

  await transaction.commit();

  return {
    basedir:basedir,
    shopid: shopid
  };
}