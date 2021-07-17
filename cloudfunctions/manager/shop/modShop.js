/**
 * 修改和新增都用createShop，该方法废弃
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var _insertBalShop = async(shopid,shopname)=>{

  //var transaction = await db.startTransaction();

  var exists = null;
  try{
    exists = await db.collection("bal_shop").doc(shopid).field({shopid:1,totalamt:1}).get();
    exists = exists.data;
    if(exists){
      return exists;
    }
  } catch(err) {
    exists = null;
  }
  const balshop = {
    shopid:shopid,
    shopname:shopname,
    totalamt:0,
    available:0,
    frozen:0,
    order_num:0,
    goods_num:0,
    settlemonth:null,
    settime:new Date(),
    updatetime:new Date()
  };
  return await db.collection("bal_shop").doc(shopid).set({data:balshop});
  //await transaction.commit();
}

module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    shopinfo
    } = event;
  if(!shopinfo._id){
    return {
      errMsg: '参数错误'
    }
  }
  const oper_userid = wxContext.OPENID;
  const _id = shopinfo._id;
  delete shopinfo._id;

  /*
  var res = db.collection('xlh_promotion').where({ promid: prom.promid }).get();
  if (res.data && res.data.length > 0) {
    return {
      errMsg: '活动已经存在'
    }
  }*/
  //shopinfo.userid = oper_userid;
  shopinfo.updatetime = db.serverDate();
  
  var res = await db.collection('xlh_shopinfo').doc(shopinfo._id).update({ data: shopinfo });

  var balshop = await _insertBalShop(shopinfo.shopid,shopinfo.shopname);

  if (res.stats.updated>=0) {
    return {
      _id: _id,
      shopid: shopinfo.shopid,
      balshop:balshop,
      success: 1,
      errMsg: "修改成功"
    }
  }
  return res;
}