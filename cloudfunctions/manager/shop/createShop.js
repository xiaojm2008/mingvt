const addFounder = require('../user/addFounder.js'); //即原来的addSysUserInfo
const getUser = require('../comm/getUser.js');
const init999 = require('../role/init999.js');
const V = require("../comm/validate.js").V;
const shopFormat = require("../comm/shopFormat.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
//店铺配置信息表
var _insertShopCfg = async(shopid)=>{
  var res = await db.collection("xlh_shopcfg").doc(shopid).get();
  if(res.data){
    return;
  }
  return await db.collection("xlh_shopcfg").doc(shopid).set({data:{
    APPR_ADDGOODS:'0',//新增商品是否审批0否,1是
    APPR_MODGOODS:'0',//修改商品是否审批
    APPR_DELGOODS:'0' 
  }});
}
//资金变动序列号
var _insertSeqDetailChg = async(shopid)=>{
  var res = await db.collection("seq_shopdetailchg").doc(shopid).get();
  if(res.data){
    return;
  }
  return await db.collection("seq_shopdetailchg").doc(shopid).set({data:{
    seq:0
  }});
}
var _insertSeqOrderId = async(shopid)=>{
  var res = await db.collection("seq_orderid").doc(shopid).get();
  if(res.data){
    return;
  }
  return await db.collection("seq_orderid").doc(shopid).set({data:{
    seq:0
  }});
}
//资金表
var _insertBalShop = async(shopid,shopname)=>{
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
}

var _insertBalShop2 = async(shopid,shopname)=>{

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
module.exports = async(event, wxContext) => {
  const {
    shopinfo
  } = event;
  /**
   * shopFormat:格式配置
   * shopinfo=>value检查的数据
   * shopinfo=>fromObj条件判断条件字段的的来源对象
   * shopinfo=>wrapObj有需要setData的字段，setData到的目标对象
   */
  var err = V(shopFormat, shopinfo, 'baseinfo', shopinfo, shopinfo, null);
  if (err && err.errMsg) {
    return err;
  }
  const oper_userid = wxContext.OPENID;

  var userinfo = await getUser(oper_userid);
 
  if (!userinfo) {
    return {
      errMsg: "您还未登陆，请登陆后再试！"
    };
  }
  if (!userinfo) {
    return {
      regflag:0,
      errMsg: "您还未登陆，请登陆后再试！"
    };
  } else if(!userinfo.basedir || !userinfo.basedir.trim()){
    return {
      regflag:1,
      errMsg: "用户配置信息错误！"
    };
  }
  
  if (!shopinfo.shopid || !shopinfo.shopid.trim()){
    return {
      errMsg: "店铺ID空异常！"
    };
  }

  if (shopinfo._id !== undefined) {
    //修改店铺信息
    const _id = shopinfo._id;
    delete shopinfo._id;
    shopinfo.updatetime = db.serverDate();
    shopinfo.oper_userid = oper_userid;

    var addSysuser= await addFounder(wxContext.OPENID, shopinfo);
    if (!addSysuser.success) {
      return addSysuser;
    }

    var res = await db.collection('xlh_shopinfo').doc(_id).update({
      data: shopinfo
    });

    var balshop = await _insertBalShop2(shopinfo.shopid,shopinfo.shopname);
    await _insertSeqDetailChg(shopinfo.shopid);
    await _insertSeqOrderId(shopinfo.shopid);
    await _insertShopCfg(shopinfo.shopid);

    if (res.stats.updated >= 0) {
    
      var userRight = await init999(event, wxContext);
      if (!userRight.success) {
        return userRight;
      }
      return {
        _id: _id,
        shopid: shopinfo.shopid,
        balshop:balshop,
        basedir:shopinfo.basedir,
        success: 1,
        errMsg: "修改成功"
      }
    }
    return res;
  }
  var res = await db.collection('xlh_shopinfo').where({
    shopid: shopinfo.shopid
  }).field({
    shopname:1,
    userid: 1
  }).get();

  if (res.data && res.data.length > 0) {
   /* if (res.data[0].shopname==shopinfo.shopname){
      shopinfo._id = res.data[0]._id;     
    } else {*/
      return {
        errMsg: '店铺已经存在,请返回做修改操作'
      }
    //}   
  }

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

  //配置店铺信息存储目录
  shopinfo.basedir = userinfo.basedir+"shop/"+shopinfo.shopid+"/";

  //新增店铺信息
  shopinfo.settime = db.serverDate();
  shopinfo.updatetime = db.serverDate();
  shopinfo.userid = oper_userid;
  
  var addSysuser = await addFounder(wxContext.OPENID, shopinfo);
  if (!addSysuser.success) {
    return addSysuser;
  }
  
  shopinfo.countofimg = 0;
  //修改为shopid为_id
  res = await db.collection('xlh_shopinfo').doc(shopinfo.shopid).set({
    data: shopinfo
  });
  if (res._id) {

    //20200105 新增一条记录，用于订单结算处理
    await _insertBalShop(shopinfo.shopid,shopinfo.shopname);
    await _insertSeqDetailChg(shopinfo.shopid);
    await _insertSeqOrderId(shopinfo.shopid);
    var shpcfg = await _insertShopCfg(shopinfo.shopid);

    await db.collection('seq_shopid').where({
      shopid: shopinfo.shopid
    }).update({
      data: {
        status: '1'
      }
    });

    var addUseright = await init999(event, wxContext);
    if (!addUseright.success) {
      return addUseright;
    }
    return {
      _id: res._id,
      basedir:shopinfo.basedir,
      shopid: shopinfo.shopid,
      shpcfg:shpcfg,
      success: 1,
      errMsg: "提交成功"
    }
  }
  return res;
}