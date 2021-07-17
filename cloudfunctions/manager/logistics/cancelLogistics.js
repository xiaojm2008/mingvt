const manageRight = require('../comm/manageRight.js');
const logisticsCfg = require('./logisticsCfg.js');
const getUserInfo = require('../comm/getUserInfo.js');
const sendPost = require('../comm/sendPost.js');
const encrypt = require('../comm/encryptMD5.js');
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

/*
{"transtype":"logistics",
"actionname":"cancelLogistics",
"order_id":"1",
"shopid":"0",
"shippercode":"SF"
}
{
  "EBusinessID" : "1553391",
  "ResultCode" : "100",
  "Success" : true
}
{
  "EBusinessID" : "1553391",
  "ResultCode" : "8037",
  "Reason" : "客户订单号已取消功能校验",
  "Success" : false
}
*/
const REQUEST_TYPE = '1004'; //取消揽件
const DATA_TYPE = '2'; //请求、返回数据类型：只支持JSON格式

var _requestOOServ = (requestData, callback) => {

  var params = {};

  params["RequestData"] = encodeURIComponent(requestData);
  params["EBusinessID"] = logisticsCfg.EBusinessID;
  params["RequestType"] = REQUEST_TYPE;
  var dataSign = encrypt(requestData, logisticsCfg.AppKey);
  params["DataSign"] = encodeURIComponent(dataSign);
  params["DataType"] = DATA_TYPE;

  var result = sendPost(logisticsCfg.OOrderService_Cancel, params, callback);
}

var _initCancelLogistics = (logis) => {
  // shippercode 'YTO','SF',
  return {
    'OrderCode': logis.logis_id,
    'ShipperCode': logis.exp_code
    /*,  
        'Commodity': oDetail.goods_info.map((v, i, a) => {
          return {
            'GoodsCode': v.goodsno,
            'GoodsName': v.goods_name,
            'Goodsquantity': v.num,
            'GoodsWeight': v.weight || 0
          }
        })*/
  };
}
/*字典：100006
const status_map = {
  '0': '待付款',
  '1': '待发货',
  '2': '待收货',
  '3': '待评价',
  '4': '退款审核中',
  '5': '退款中',
  '6': '已完成',
  '7': '已关闭',
  '8': '已删除',
  'c': '已经取消'
};*/
var _doResult = (res, logis) => {
  //xlh_logistics
  //xlh_bookingnote
  db.collection('xlh_orderdetail').where({
    logis_id:logis.logis_id
  }).update({
    data:{
      status:'1' //待发货状态
    }
  }).then(res=>{
    
  });

  return db.collection('xlh_logistics').doc(logis._id).update({
    data: {
      cancelflag:'1',
      cancel_retmsg: res.Reason,
      cancel_retcode: res.ResultCode,
      updatetime: db.serverDate
    }
  });
}
/**
 * 支持快递公司：顺丰速运、优速快递、韵达速递、德邦快递、中通快递、百世快递、承诺
达、申通快递、壹米滴答。
 */
module.exports = async(event, wxContext) => {

  if (!event.order_id || !event.order_id.trim()) {
    return {
      errMsg: "订单号不能空"
    }
  }

  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var oDetail = await db.collection('xlh_orderdetail').where({
    shopid: userInfo.shopinfo.shopid,
    order_id: event.order_id
  }).field({
    logis_id: 1,
    shopid: 1,
    order_id: 1,
    status: 1
  }).get();
  if (!oDetail.data || oDetail.data.length === 0) {
    return {
      errMsg: `订单[${event.order_id}]不存在`
    }
  } else if (oDetail.data.length > 1) {
    return {
      errMsg: '订单号重复:' + oDetail.data.length
    }
  }
  oDetail = oDetail.data[0];

  //xlh_logistics
  //xlh_bookingnote
  var logis = await db.collection('xlh_logistics').where(oDetail.logis_id ? {
    logis_id: oDetail.logis_id
  } : {
    order_id: oDetail.order_id,
    shopid: userInfo.shopinfo.shopid,
    retcode: "0000",
    cancelflag: '0',
  }).field({
    exp_code: 1,
    logis_id: 1,
    retcode: 1
  }).get();

  if (logis.data && logis.data.length > 1) {
    return {
      errMsg: `您的订单存在多笔预约揽件！请确认！${logis.data.length}`
    }
  }
  logis = (logis.data && logis.data.length > 0) ? logis.data[0] : null;
  if (!logis) {
    return {
      errMsg: `您的订单[${event.order_id}]没有预约揽件哦,或已经取消了`
    }
  } else if (logis.cancelflag == '1') {
    return {
      errMsg: `您的订单预约揽件已经取消了`
    }
  } else if (!logis.exp_code || !logis.exp_code.trim()) {
    return {
      errMsg: "预约取件订单快递公司代码未空！"
    }
  }

  var cancelOrder = _initCancelLogistics(logis);

  return await new Promise((resolve, reject) => {
    return _requestOOServ(JSON.stringify(cancelOrder), (err, body) => {
      var res = null;
      if (err) {
        res = {
          errMsg: err.message,
          retcode: "9998"
        };
        reject(res);
        return;
      }
      var res = JSON.parse(body);
      if (res.ResultCode == '100') {
        //预约取件取消成功才更新流水
        _doResult(res, logis).then(res11 => {
          resolve({
            errMsg: res.Reason||"您已经成功取消预约揽件申请",
            success: 1,
            updated: res11.stats && res11.stats.updated || '',
            retcode: '0000'
          });          
        }).catch(err11 => {
          reject(err11);
        });
      } else{
        resolve({
          errMsg: res.Reason ||"您已经取消预约揽件失败，请重试",
          success: 0,         
          retcode: res.ResultCode || '9999'
        })
      }
    })
  }).catch(err => {
    return {
      errMsg: err.message
    };
  });
}

/*
            EBusinessID: "1553391"
Order: {ShipperCode: "SF", OrderCode: "1"}
Reason: "缺少参数[缺少货物信息]"
Success: false
UniquerRequestNumber: "16210445-afde-4efa-9281-cbca0b2072b9"
__proto__: Object
            */