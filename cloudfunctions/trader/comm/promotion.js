const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const cmd = db.command;
/*
活动配置
xlh_promotion
promtype 0：主题活动（themeactivity） 1:直减; 2:折扣 3:限时抢购 4:满减(组合价格) 5:秒杀; 6:品牌团;7:量贩团 8砍价
  promid           varchar(20), #促销活动ID
  promname         varchar(100),#活动名称
  promfullname     varchar(50), #活动名称
  promtype         char(1),     #100027 促销类型 0：主题活动（themeactivity） 4：满减（fullcut）
  limittimeflag    char(1), #限时标识 0 不限时，但是可以随时结束 。1 限时
  begtime     char(14),#yyyymmddhhMMss
  endtime     char(14),#yyyymmddhhMMss
  endflag     char(1),#是否结束标识
  prominfo         varchar(512),
  summary         varchar(1024),#活动介绍
商品活动
xlh_goodsprom：
  goodsno       varchar(20),    #商品编号
  promid           varchar(20), #促销活动ID
  promtype         char(1),
  promname         varchar(100),
  limittimeflag    char(1), #限时标识 0 不限时，但是可以随时结束 。1 限时
  begtime     char(14),#yyyymmddhhMMss
  endtime     char(14),#yyyymmddhhMMss
  endflag     char(1),#是否结束标识
  prominfo       varchar(512),
  status          char(1),
 店铺活动
xlh_shopprom:
  shopid        char(4) not null, #店铺
  promid           varchar(20), #促销活动ID
  promtype         char(1),
  limittimeflag    char(1), #限时标识 0 不限时，但是可以随时结束 。1 限时
  begtime     char(14),#yyyymmddhhMMss
  endtime     char(14),#yyyymmddhhMMss
  endflag     char(1),
  enableflag  char(1),#启用标识 1 启用
  prominfo         varchar(512),
折扣活动：promtype = 2
xlh_discount：
  promid           varchar(20), #促销活动ID
  promname         varchar(100),#活动名称
  promfullname     varchar(50), #活动名称
  limittimeflag    char(1), #限时标识 0 不限时，但是可以随时结束 。1 限时
  begtime     char(14),#yyyymmddhhMMss
  endtime     char(14),#yyyymmddhhMMss
  endflag     char(1),#
  prominfo         varchar(512),
  discount      float(3,2),  #折扣
  limitqty      float(16,2), #限制数量，0不限制
满减(组合价格) ，直减：
xlh_fullcut
 promid           varchar(20), #促销活动ID
 promtype          char(1),    #4:满减(组合价格) 1:直减;
 promname         varchar(100),#活动名称
 promfullname   varchar(50), #活动名称
 limittimeflag    char(1), #限时标识 0 不限时，但是可以随时结束 。1 限时
 begtime     char(14),#yyyymmddhhMMss
 endtime     char(14),#yyyymmddhhMMss
 endflag     char(1),
 prominfo         varchar(512),
 cutamt         float(16,2), #减额
 fullamt            float(16,2), #满减
 砍价活动：
 xlh_bargain （帮忙砍价的人员 xlh_bargainlog）
 xlh_groupbuy 

*/
var expiredHandel = (expired,colle)=>{
  db.collection(colle).where({
    goodsno: cmd.in(expired.map((item, idx, arr) => {
      return item.goodsno;
    })),
    status: '1'
  }).update({
    status:'0'
  }).then(res=>{
    
  });
}

var getGoodsProm = async(goodsInfo) => {
  const now = new Date().getTime();
  const field = {
    goodsno: 1, //商品编号
    promid: 1, //促销活动ID
    promtype: 1,
    promname: 1,
    limittimeflag: 1, //限时标识 0 不限时，但是可以随时结束 。1 限时
    begtime: 1, //yyyymmddhhMMss
    endtime: 1, //yyyymmddhhMMss
    endflag: 1, //是否结束标识
    prominfo: 1,
    status: 1
  }
  var prom = await db.collection('xlh_goods').where({
    goodsno: cmd.in(goodsInfo.map((item, idx, arr) => {
      return item.goodsno;
    })),
    status: '1'
  }).field(field).get();
  prom = prom.data && prom.data.length > 0 ? prom.data : null;
  var expired = [];
  var ok = prom.reduce((pre, cur, arr) => {
    if (cur.limittimeflag == '1' 
    && (now < new Date(cur.begtime).getTime() || now > new Date(cur.endtime).getTime())) {
      expired.push(cur);
      return;
    }
    pre[cur.goodsno] = cur;
    return pre;
  }, {});
  expiredHandel(expired,'xlh_goods');

  return ok;
}
var goodsPromHandle = async(goodsInfo,prom)=>{

}
var getShopProm = async(shops)=>{

}
var shopPromHandle = async(shops, prom) => {

}
module.exports ={
  getGoodsProm: getGoodsProm,
  goodsPromHandle: goodsPromHandle,
  getShopProm: getShopProm,
  shopPromHandle: shopPromHandle
} 