// 云函数入口文件
const cloud = require('wx-server-sdk')
const mySeq = require('../comm/mySeq.js');
const goodsServ = require('../comm/goodsServ.js');
cloud.init({
  env: require("../env.js")
})

var getTotalPay = async (wxContext, goodsInfo) => {
  return goodsInfo[goodsInfo.length - 1].total_pay;
};
var getTotalNum = (goodsInfo) => {
  return goodsInfo.reduce(function (prev, curr, idx, arr) { return prev.num + curr.num; })
}
var initOrderInfo = async (event, wxContext) => {

  try {
    var goodsInfo = await goodsServ.getGoodsInfo(event.goodsInfo);
    if (goodsInfo.errMsg) {
      return goodsInfo.errMsg;
    }
    var total_pay = await getTotalPay(wxContext, goodsInfo);
    var orderInfo = {
      order_id: mySeq.mySeq32('PEN'),
      openid: wxContext.OPENID,
      discount_cut_price: 0,
      goods_info: goodsInfo,
      tostore_data: {},
      total_pay: total_pay,
      total_num: getTotalNum(goodsInfo),
      status: '0',
      settime: db.serverDate(),
      updatetime: db.serverDate()
    };
    return orderInfo;
  } catch (err) {
    throw err;
  }
};

/*
{"goodsInfo":[{"goodsno":"S000020190721120922819afe08f39f552","goodsname":"肖锦测试x","model_id":"modelitem_0","model_value":null,"num":1,"price":0}],"transtype":"order","actionname":"addOrder"}
*/
module.exports = async (event, context) => {

  const wxContext = cloud.getWXContext();
  const db = cloud.database();

  try {
    var orderInfo = await initOrderInfo(event, wxContext);
    var res = await db.collection('xlh_orderpending').add({
      data: orderInfo
    });
    return { order_id: orderInfo.order_id };
  } catch (err) {
    return { errMsg: err.message };
  }
};