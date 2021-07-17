var stockHelper = require('../comm/stockHelper.js');
var payConfig = require('../payConfig.js');
var nonceStr = require('../comm/nonceStr.js');
var utils = require('../comm/utils.js');
var checkSign = require('../comm/checkSign.js');
const retryUpdOrderDetail = require("../comm/retryUpdOrderDetail.js");
var crypto = require('crypto');
var request = require('request');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: true
});
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const PAY_PEN = "2"; //待支付
const PAY_SUCCESS = "1";
const PAY_FAIL = "0";
const PAY_EXCEPT = "3"; //含TIMEOUT

const ORST_PEN_PAY = "0"; //待支付
const ORST_PEN_DELIVERY = "1"; //待发货
var trade_state = {
  SUCCESS: "支付成功",
  REFUND: "转入退款",
  NOTPAY: "未支付",
  CLOSED: "已关闭",
  REVOKED: "已撤销（付款码支付）",
  USERPAYING: "用户支付中（付款码支付）",
  PAYERROR: "支付失败(其他原因，如银行返回失败)"
};
/*
   '0': '待付款',
        '1': '待发货',
        '2': '待收货',
        '3': '待评价',
        '4': '退款审核中',
        '5': '退款中',
        '6': '已完成',
        '7': '已关闭'
*/
/*SUCCESS—支付成功
REFUND—转入退款
NOTPAY—未支付
CLOSED—已关闭
REVOKED—已撤销（付款码支付）
USERPAYING--用户支付中（付款码支付）
PAYERROR--支付失败(其他原因，如银行返回失败)
  */
/* var result = {
  "pay_id": payment.pay_id,
  "mch_id": payresult.mch_id,
  "sub_mch_id": payresult.sub_mch_id,
  "transaction_id": payresult.transaction_id,
  "fee_type": payresult.fee_type,
  "coupon_fee": payresult.coupon_fee,
  "settlement_total_fee": payresult.settlement_total_fee,
  "cash_fee": payresult.cash_fee,
  "total_fee": payresult.total_fee,
  "result_code": payresult.result_code,
  "return_code": payresult.return_code,
  "return_msg": payresult.return_msg,
  "err_code": payresult.err_code,
  "err_code_des": payresult.err_code_des,
  "trade_state": payresult.trade_state,
  "trade_state_desc": payresult.trade_state_desc + "_" + trade_state_desc,
  "time_end": payresult.time_end
};*/
var updPaymentStatus = (payment)=>{
  db.collection('xlh_paymentlog').doc(payment.pay_id).update({
    data: {
      status:PAY_EXCEPT
    }
  })
}

var _doResult = (payresult, payment) => {
  return new Promise((resolve, reject) => {
    //var orderSt = ORST_PEN_DELIVERY; //待发货
    var trade_state_desc = trade_state[payresult.trade_state];

    if (payresult.result_code == "SUCCESS" && payresult.return_code == "SUCCESS" && payresult.trade_state == "SUCCESS") {
      if (!checkSign(payresult)) {
        payresult.pay_msg = "验证微信返回报文签名失败";
        payresult.pay_status = PAY_FAIL;
        //orderSt = ORST_PEN_PAY;
      } else if (parseInt(payresult.total_fee) != payment.total_pay) {
        payresult.pay_msg = "支付金额不比配！请与商家联系或确认后重新下单！";
        payresult.pay_status = PAY_FAIL;
        //orderSt = ORST_PEN_PAY;
      } else {
        payresult.pay_msg = trade_state_desc;
        payresult.pay_status = PAY_SUCCESS;
        //orderSt = ORST_PEN_DELIVERY;
        //20190724
      }
    } else {
      payresult.pay_msg = `${trade_state_desc}！备注：${payresult.return_msg},${payresult.err_code_des||""} ${payresult.trade_state_desc}:${payresult.trade_state}`;
      payresult.pay_status = PAY_FAIL;
      //orderSt = ORST_PEN_PAY;
    };

    payresult.openid = payment.openid; //支付者
    payresult.primary_id = payment.primary_id;
    payresult.order_openid = payment.order_openid; //订单所有者
    payresult.order_id = payment.order_id;
    payresult.pay_id = payment.pay_id;
    payresult.total_pay = payment.total_pay;
    //payresult.pay_status = payresult.pay_status;
    //payresult.pay_msg = payresult.pay_msg;
    //payresult.updatetime = db.serverDate();
    payresult.settime = db.serverDate();

    db.collection('xlh_wxpayresult').add({
      data: payresult
    });
    
    payment.confirmdate = utils.dateFormat(new Date(),"yyyyMMdd"),
    payment.confirmtime = utils.dateFormat(new Date(),"hhmmss"),
    payment.paytime = payresult.time_end, //14位字符串    
    payment.payresulttime = new Date();//支付结果查询时间
    payment.updatetime = db.serverDate(),
    payment.status = payresult.pay_status,
    payment.errmsg = payresult.pay_msg;
    
    var order = {
      "mergeflag":payment.mergeflag,
      "order_num":payment.order_num,
      "pay_id":payment.pay_id,
      "paystatus":payment.status, //支付状态
      "confirmdate":payment.confirmdate,
      "confirmtime":payment.confirmtime,   
      "paytime": payment.paytime, //payresult.time_end 
      "deliverytime": null,//发货时间
      "receivingtime":null,//收货时间
      "dealtime": null,//成交时间
      "updatetime": payment.updatetime,
      "errmsg": payment.errmsg,
      "status": payment.status == PAY_SUCCESS ? ORST_PEN_DELIVERY : ORST_PEN_PAY //订单状态
    }

    /**
     * time_end 支付完成时间，格式为yyyyMMddHHmmss，如2009年12月25日9点10分10秒表示为20091225091010。其他详见时间规则
     */
    _updPaymentLog(payment).then(res => {
      if (res.stats.updated < 1) {
        reject({
          success:0, /**本地业务逻辑成功失败标志 */
          mergeflag:payment.mergeflag,
          pay_status: payresult.pay_status, /**支付逻辑失败标志 */
          pay_id: payresult.pay_id, //payresult.pay_id = payment.pay_id 
          errMsg: "更新订单支付流水状态失败！"
        });
        return;
      }
      var prom=null;
      if(payment.mergeflag==1){
        //是合并支付的
        /*
        if(order.order_num==1){
          //异常情况
          reject({
            success:0, 
            pay_status: payresult.pay_status,
            pay_id: payresult.pay_id, //payresult.pay_id = payment.pay_id 
            errMsg: "当前支付方式存在问题！"
          });
          */
         if (!payment.order_id) {
          reject({
            success:0,
            mergeflag:payment.mergeflag,
            pay_status: order.paystatus,
            pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
            errMsg: "订单ID空异常！"
          });
          return;
        }
        prom = _updOrderDetailByOid(payment.order_id,order)
      }  else {
        if (!payment.primary_id) {
          reject({
            success:0,
            mergeflag:payment.mergeflag,
            pay_status: order.paystatus,
            pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
            errMsg: "订单_ID空异常！"
          });
          return;
        } else if(order.order_num>1){
          reject({
            success:0,
            mergeflag:payment.mergeflag,
            pay_status: order.paystatus,
            pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
            errMsg: "非合并支付订单异常！"
          });
          return;
        }
        prom = _updOrderDetailByPid(payment.primary_id,order);
      }
      prom.then(res => {
        if (res.stats.updated != order.order_num) {
          reject({
            success:0,
            mergeflag:payment.mergeflag,
            pay_status: order.paystatus,
            pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
            errMsg: `更新订单失败：订单共[${order.order_num}]笔，已更新[${res.stats.updated}]笔！`
          });
          return;
        }
        //pay_status=='1'支付成功，其他失败
        resolve({
          mergeflag:payment.mergeflag,
          success:order.paystatus==PAY_SUCCESS?1:0,
          pay_status: order.paystatus,
          pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
          errMsg: order.errmsg
        });
      }).catch(err => {
        reject({
          success:0,
          mergeflag:payment.mergeflag,
          pay_status: order.paystatus,
          pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
          errMsg: err.message || err.errMsg
        });
      })
      /*
      _updOrderDetail(payment.mergeflag, order).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      });*/


    }).catch(err => {
      reject({
        success:0,
        mergeflag:payment.mergeflag,
        pay_status: payresult.pay_status,
        pay_id: payresult.pay_id, //payresult.pay_id = payment.pay_id 
        errMsg: err.message || err.errMsg
      });
    });
  });
}

var _updPaymentLog = (payment) => {
  return db.collection('xlh_paymentlog').doc(payment.pay_id).update({
    data: {
      confirmdate:payment.confirmdate,
      confirmtime:payment.confirmtime,
      paytime:payment.paytime, //14位字符串    
      updatetime:payment.updatetime,
      status: payment.status,
      errmsg:payment.errmsg
    }
  });
}
var _updOrderDetailByOid = (order_id,order) => {
  return db.collection('xlh_orderdetail').where({
    order_id: order_id,
    status:ORST_PEN_PAY
  }).update({
    data: order
  });
}

var _updOrderDetailByPid = (primary_id,order) => {
  return db.collection('xlh_orderdetail').doc(primary_id).update({
    data: order
  });
}

var _genReqSign = (payment) => {
  var str = `appid=${payment.appid}&mch_id=${payConfig.mch_id}&nonce_str=${payment.nonce_str}&out_trade_no=${payment.pay_id}&sign_type=MD5&key=${payConfig.key}`;
  payment.sign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

var _initReqBody = (payment) => {
  return `<xml>
   <appid><![CDATA[${payment.appid}]]></appid>
   <mch_id><![CDATA[${payConfig.mch_id}]]></mch_id>
   <nonce_str><![CDATA[${payment.nonce_str}]]></nonce_str>
   <out_trade_no><![CDATA[${payment.pay_id}]]></out_trade_no>
   <sign><![CDATA[${payment.sign}]]></sign>
   <sign_type>MD5</sign_type>
  </xml>`;
}

var _getPaymentLog = async(event) => {
  return await db.collection("xlh_paymentlog").where(event.pay_id ? {
    pay_id: event.pay_id
  } : (event.primary_id?{
      primary_id: event.primary_id //对应xlh_orderdetail._id
    }:{
      order_id: event.order_id //对应xlh_orderdetail._id
    })).field({
    appid: 1,
    mergeflag:1,
    pay_id: 1,
    order_id: 1,
    primary_id: 1, //对应xlh_orderdetail._id
    order_num: 1, //订单数量
    total_pay: 1,
    openid: 1,
    order_openid: 1,
    status: 1,
    errmsg: 1,
    stock_rollback:1,
    goods_info: 1
  }).get();
}
/**
 * pay_id:6581577365418967a797aa693e0d2189
 *  {"_id":null,"pay_id":"6581577365418967a797aa693e0d2189","transtype":"wx","actionname":"queryOrder"}
 */
module.exports = async(event, wxContext) => {

  if(!event.pay_id && !event.primary_id && !event.order_id){
    return {
      errMsg: "查询参数错误：订单号，支付流水号等错误！"
    }
  }

  var payment = await _getPaymentLog(event);
  if (!payment.data || payment.data.length === 0) {
    return {
      errMsg: "订单支付流水不存在：" + event.pay_id||event.primary_id
    }
  }

  payment = payment.data[0];

  if (payment.status == PAY_SUCCESS) {
    var res = await retryUpdOrderDetail(payment);
    if (res) {
      return res;
    }
    return {
      errMsg: "本订单已经支付成功"
    }
  } else if(payment.status == PAY_FAIL){
    if(payment.stock_rollback!=1){
      //_rollBackStock(payment);
      var rls = await stockHelper.handleStock(payment);
      return {
        errMsg:payment.errmsg+"("+(rls.errMsg)+")"
      }
    }
    return {
      errMsg:payment.errmsg
    }
  }
  payment.nonce_str = nonceStr();

  _genReqSign(payment);

  var reqParams = _initReqBody(payment);

  return new Promise((resolve, reject) => request({
    url: payConfig.query_url,
    method: 'POST',
    body: reqParams
  }, (err, res, body) => {
    if (!body) {

      updPaymentStatus(payment);

      reject({
        errMsg: "返回报文未空"
      })
      return;
    }
    xmlParser.parseString(body, (err, res) => {
      if (err) {
        //网络异常情况怎么处理？？获取不到支付结果，必须重试
        /* 未明确获取失败，不需要回滚
        if(payment.stock_rollback!=1){
          _rollBackStock(payment);
        }*/
        updPaymentStatus(payment);

        reject({
          errMsg: `${err.message}:${JSON.stringify(res)}`
        })
        return;
      }
      _doResult(res.xml, payment).then(res => {
        if(res.pay_status != PAY_SUCCESS){
          //回滚库存,payment和orderInfo的结构中都会有goods_info
          stockHelper.handleStock(payment).then(rls => {
            res.errMsg+="("+rls.errMsg+")";
            resolve(res);
          });       
          return;
        }
        resolve(res);
      }).catch(err => {
        if(res.pay_status != PAY_SUCCESS){
          stockHelper.handleStock(payment).then(rls => {
            err.errMsg+="("+rls.errMsg+")";
            reject(err);
          });     
          return;
        }
        reject(err);
      });
    });
  }));
}


/*
var payresult = {
  openid: getField(body, "openid"),
  sub_mch_id: getField(body, "sub_mch_id"),
  cash_fee_type: getField(body, "cash_fee_type"),
  trade_state: getField(body, "trade_state"),
  nonce_str: getField(body, "nonce_str"),
  return_code: getField(body, "return_code"),
  err_code_des: getField(body, "err_code_des"),
  time_end: getField(body, "time_end"),
  mch_id: getField(body, "mch_id"),
  trade_type: getField(body, "trade_type"),
  trade_state_desc: getField(body, "trade_state_desc"),
  settlement_total_fee: getField(body, "settlement_total_fee"),
  sign: getField(body, "sign"),
  cash_fee: getField(body, "cash_fee"),
  is_subscribe: getField(body, "is_subscribe"),
  return_msg: getField(body, "return_msg"),
  fee_type: getField(body, "fee_type"),
  bank_type: getField(body, "bank_type"),
  attach: getField(body, "attach"),
  device_info: getField(body, "device_info"),
  out_trade_no: getField(body, "out_trade_no"),
  transaction_id: getField(body, "transaction_id"),
  total_fee: getField(body, "total_fee"),
  appid: getField(body, "appid"),
  result_code: getField(body, "result_code"),
  err_code: getField(body, "err_code"),
  coupon_count: getField(body, "coupon_count"),
  coupon_fee:getField(body, "coupon_fee")
};
if (payresult.coupon_count && payresult.coupon_count>0){
  for (var i = 0; i < payresult.coupon_count;i++){   
    payresult[`coupon_type_${i}`] = getField(body, `coupon_type_${i}`);
    payresult[`coupon_id_${i}`] = getField(body, `coupon_id_${i}`)
    payresult[`coupon_fee_${i}`] = getField(body, `coupon_fee_${i}`)
  }
}
 if (!checkSign(payresult)) {
    return {errMsg :"验证微信返回报文签名失败"};
  }


var _updOrderDetail = (order) => {

  return new Promise((resolve, reject) => {
    var prom = null;
    if (order.order_num === 1) {
      if (!order.primary_id) {
        reject({
          success:0,
          pay_status: order.paystatus,
          pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
          errMsg: "更新订单状态异常：订单明细ID空！"
        });
        return;
      }
      //用xlh_orderdetail._id更新没有问题。
      prom = _updOrderDetailByPid(order);
    } else {
        //用xlh_orderdetail.order_id更新,需要考虑一个order_id对应多个订单情况下，
        //其中某个订单已经支付了（但是一般这个是异常情况）
      prom = _updOrderDetailByOid(order)
    }
    prom.then(res => {
      if (res.stats.updated != order.order_num) {
        reject({
          success:0,
          pay_status: order.paystatus,
          pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
          errMsg: `更新订单失败：订单共[${order.order_num}]笔，已更新[${res.stats.updated}]笔！`
        });
        return;
      }
      //pay_status=='1'支付成功，其他失败
      resolve({
        success:order.paystatus==PAY_SUCCESS?1:0,
        pay_status: order.paystatus,
        pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
        errMsg: order.errmsg
      });
    }).catch(err => {
      reject({
        success:0,
        pay_status: order.paystatus,
        pay_id: order.pay_id, //payresult.pay_id = payment.pay_id 
        errMsg: err.message || err.errMsg
      });
    })
  });
}
*/