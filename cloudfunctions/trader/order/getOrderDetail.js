// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var _getOrderByPayId= async(pay_id)=>{
    var order = await db.collection("xlh_orderdetail").where({
      pay_id:pay_id
    }).get();
    order = order.data && order.data.length>0?order.data:null;
    if(!order){
      return {
        errMsg:"订单信息不存在"
      }
    }
    var out = order[0];
    order.forEach((v,i,a)=>{
      if(i>0){
        Array.prototype.push.apply(out.goods_info,v.goods_info);
      }
    })
    return out;
}
// 云函数入口函数
module.exports = async(event, context) => {
  return new Promise((resolve, reject) => {
    const wxContext = cloud.getWXContext()
    const {
      _id,
      pay_id,
      orderid
    } = event;

    if (!_id || !_id.trim()) {
      if(pay_id && pay_id.trim()){
        return _getOrderByPayId(pay_id).then(res=>{
          resolve({data:res});
        }).catch(err=>{
          reject(err)
        });
      } 
      if(!orderid){
        return {
          errMsg:"订单号为空"
        }
      }
      db.collection('xlh_orderdetail').where({
        openid: wxContext.OPENID,
        order_id: orderid
      }).get().then(res => resolve({
        data: res.data
      })).catch(res => reject(res));
    } else {
      db.collection('xlh_orderdetail').doc(_id).get().then(res => resolve({
        data: [res.data]
      })).catch(res => reject(res));
    }
  });
}