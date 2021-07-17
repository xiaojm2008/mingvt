// 云函数入口文件
const getUserInfo = require("../user/getUserInfo.js")
const mySeq = require("../comm/mySeq.js");
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})

const db = cloud.database();

module.exports = async (event, wxContext) => {

  var {
    favor_id,
    favor_tp /** 字典：100034 */
  } = event;
  /*
  favor_id 将作为xlh_favor._id存储
  favor_id 可能值:
  
  actionid(xlh_enrollaction._id) favor_tp=1
  goodsno(xlh_goods.goodsno) favor_tp=2
  shopid(xlh_shopinfo.shopid) favor_tp=3
  */
  if (!favor_id || !favor_id.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var favorinfo = null;
  //类型：1商品，2店铺，3报名
  if (favor_tp === '1') {
    favorinfo = await db.collection("xlh_goods").where({
      goodsno: favor_id
    }).limit(1).field({
      _id: true,
      //shopid: true,
      //shopname: true,
      //"vgno": true,
      //"deptid": true,
      //spec: true, // "0.5-1kg",
      //unit: true,
      //goods_info: true,
      goodsno: true,
      goodsname: true,
      picpath: true,
      price: true,
      //quantity: true,
      prominfo: true,
      keywords:true,
      updatetime: true
    }).get();
    favorinfo = favorinfo.data && favorinfo.data.length>0 ? favorinfo.data[0]:null;
    favorinfo.cover = favorinfo.picpath.length>1 ? favorinfo.picpath[1].fileID : null;
    delete favorinfo.picpath;
    favorinfo.favor_name = favorinfo.goodsname;
    favorinfo.favor_desc = favorinfo.keywords;
    favorinfo.favor_number = favorinfo.price.saleprice2 || favorinfo.price.saleprice;
    favorinfo.favor_number_desc = "售价（¥）";
  } else if (favor_tp === '2') {
    favorinfo = await db.collection("xlh_shopinfo").where({
      shopid: favor_id
    }).limit(1).field({
      //userid: 1,
      shopid: 1,
      //shopname: 1,
      //imginfo: 1,
      //shoppic: 1,
      picpath:1,
      //phone: 1,
      //contact: 1,
      //address: 1,
      //latitude: 1,
      //longitude: 1,
      opentime: 1,
      closetime: 1,
      //basedir: 1,
      summary: 1,
      status: 1,
      updatetime: 1,
    }).get();
    favorinfo = favorinfo.data && favorinfo.data.length>0 ? favorinfo.data[0]:null;
    favorinfo.cover = favorinfo.picpath.length>1 ? favorinfo.picpath[1].fileID : null;
    delete favorinfo.picpath;
    favorinfo.favor_name = favorinfo.shopname;
    favorinfo.favor_desc = favorinfo.summary;
    favorinfo.favor_number = null;
  } else if (favor_tp === '3') {    
    favorinfo = await db.collection("xlh_enrollaction").doc(favor_id).field({
      //actaddress: 1,
      //actbegintime: 1,
      //actendtime: 1,
      actionid: 1,
      actionname: 1,
      actiontype: 1,
      //actlatitude: 1,
      //actlongitude: 1,
      create_phone: 1,
      //create_userid: 1,
      create_username: 1,
      enrollendtime: 1,
      intro: 1,
      //description:1,
      //imginfo:1,
      picpath: 1,
      //enrollbegintime: 1,
      fee: 1,
      feechild: 1,
      feetype: 1,
      maxperson: 1,
      minperson: 1,
      regtime: 1,
      updatetime: 1
    }).get();
    favorinfo = favorinfo.data;
    favorinfo.cover = favorinfo.picpath.length>1 ? favorinfo.picpath[1].fileID : null;
    delete favorinfo.picpath;
    favorinfo.favor_name = favorinfo.actionname;
    favorinfo.favor_desc = favorinfo.intro;
    favorinfo.favor_number_desc = favorinfo.feetype=='1'? "费用（¥）":"免费";
    favorinfo.favor_number = favorinfo.feetype=='1'? ("成人："+favorinfo.fee+" (儿童 "+(favorinfo.feechild>0?favorinfo.feechild:'免费')+")"):null;
  } else {
    return {
      errMsg: "不支持类型"
    }
  }

  if(!favorinfo){
    return {
      errMsg: "收藏源记录信息不存在"
    }
  }

  var res = await db.collection("xlh_favor").where({
    favor_id: favor_id,
    openid: wxContext.OPENID
  }).limit(1).field({
    _id: 1
  }).get();

  var exists = res.data && res.data.length > 0 ? res.data[0] : null;

  if (exists) {
    favorinfo.updatetime = db.serverDate();
    favorinfo.original_id = favorinfo._id;
    favorinfo._id && (delete favorinfo._id);
    res = await db.collection("xlh_favor").doc(exists._id).set({
      data: favorinfo
    });
    return {
      success: 1,
      errMsg: "已更新收藏"
    }
  }

  var id = mySeq.mySeq32("FAV");

  favorinfo.original_id = favorinfo._id;

  favorinfo._id&&delete favorinfo._id;

  favorinfo.favor_tp = favor_tp;
  favorinfo.favor_id = favor_id;
  favorinfo.openid = wxContext.OPENID;
  favorinfo.updatetime = db.serverDate();
  favorinfo.settime = db.serverDate();

  res = await db.collection("xlh_favor").doc(id).set({
    data: favorinfo
  });

  if (res.stats.created === 1 || res.stats.updated === 1) {
    return {
      success: 1,
      stats: res.stats,
      errMsg: "已收藏成功"
    }
  }

  return {
    errMsg: "已收藏错误"
  }
}