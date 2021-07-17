//var stockDec = require('../comm/stockDec.js');
const stockHelper = require('../comm/stockHelper.js');
const payConfig = require('../payConfig.js');
const mySeq = require('../comm/mySeq.js');
const retryUpdOrderDetail = require("../comm/retryUpdOrderDetail.js");
const myNum = require("../comm/myNum.js");
//var getField = require('./getXmlField.js');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({
  explicitArray: false,
  ignoreAttrs: true,
  errThrown: true
});
var nonceStr = require('../comm/nonceStr.js');
var checkSign = require('../comm/checkSign.js');
var crypto = require('crypto');
var request = require('request');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
const PAY_SUCCESS = "1";
const PAY_FAIL = "0";
const PAY_PEN = "2"; //待支付/或者未知状态（超时时候未收到应答）
/*
var prepaylog = {
  appid: getField(body, "appid"),
  mch_id: getField(body, "mch_id"),
  device_info: getField(body, "device_info"),
  nonce_str: getField(body, "nonce_str"),
  sign: getField(body, "sign"),
  prepay_id: getField(body, "prepay_id"),
  retmsg: getField(body, "retmsg"),
  retcode: getField(body, "retcode"),
  return_code: getField(body, "return_code"),   
  return_msg: getField(body, "return_msg"),
  result_code: getField(body, "result_code"),
  err_code_des: getField(body, "err_code_des"),
  err_code: getField(body, "err_code"),
  trade_type: getField(body, "trade_type"),
  code_url: getField(body, "code_url")
}*/

var _doResult = (prepaylog, payment) => {
  try {
    var result = null;
    if (prepaylog.result_code == "SUCCESS") {
      if (!checkSign(prepaylog)) {
        result = {
          prepay_id: null,
          retmsg: "验证微信返回报文签名失败"
        }
      } else {
        result = {
          prepay_id: prepaylog.prepay_id
        };
      }
    } else {

      result = {
        prepay_id: null,
        retcode: prepaylog.retcode,
        retmsg: prepaylog.retmsg,
        return_code: prepaylog.return_code,
        return_msg: prepaylog.return_msg,
        err_code: prepaylog.err_code,
        err_code_des: prepaylog.err_code_des
      };
    }

    prepaylog.settime = db.serverDate();
    prepaylog.openid = payment.openid;
    prepaylog.order_openid = payment.order_openid;
    prepaylog.pay_id = payment.pay_id;
    prepaylog.order_id = payment.order_id;
    prepaylog.primary_id = payment.primary_id;
    prepaylog.shopid = payment.shopid;
    prepaylog.total_pay = payment.total_pay;
    //写预支付流水
    db.collection('xlh_wxprepaylog').add({
      data: prepaylog
    });
    return result;
  } catch (err) {
    return {
      return_msg: err.message
    };
  }
}
var _genReqSign = (payment) => {
  var goods_tag = payment.selected_benefit && payment.selected_benefit.discount_type == '01' ? `&goods_tag=${payment.selected_benefit.discount_tag}` : '';
  var str = `appid=${payment.appid}&body=${payConfig.body}&detail=${payment.goods_info_str}${goods_tag}&mch_id=${payConfig.mch_id}&nonce_str=${payment.nonce_str}&notify_url=${payConfig.notify_url}&openid=${payment.openid}&out_trade_no=${payment.pay_id}&spbill_create_ip=${payConfig.ip}&total_fee=${payment.total_pay}&trade_type=JSAPI&key=${payConfig.key}`;
  //toUpperCase 一定转换为大写
  payment.sign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

var _initReqBody = (payment) => {
  var goods_tag = '';
  if (payment.selected_benefit && payment.selected_benefit.discount_type == '01') {
    goods_tag = `<goods_tag>${payment.selected_benefit.discount_tag}</goods_tag>`
  }
  /*
  out_trade_no
  商户系统内部订单号，要求32个字符内，只能是数字、大小写字母_ -|*@ ，且在同一个商户号（mch_id）下唯一。
  */
  return `<xml>
  <appid><![CDATA[${payConfig.appid}]]></appid>
  <body><![CDATA[${payConfig.body}]]></body>
  <detail><![CDATA[${payment.goods_info_str}]]></detail>
  ${goods_tag}
  <mch_id><![CDATA[${payConfig.mch_id}]]></mch_id>
  <nonce_str><![CDATA[${payment.nonce_str}]]></nonce_str>
  <notify_url><![CDATA[${payConfig.notify_url}]]></notify_url>
  <openid><![CDATA[${payment.openid}]]></openid>  
  <out_trade_no><![CDATA[${payment.pay_id}]]></out_trade_no>
  <spbill_create_ip><![CDATA[${payConfig.ip}]]></spbill_create_ip>
  <total_fee>${payment.total_pay}</total_fee>
  <trade_type>JSAPI</trade_type>
  <sign><![CDATA[${payment.sign}]]></sign>
  </xml>`;
}

var _initPayment = (result) => {
  var times = new Date().getTime(); //appId=${result.appid}&
  var str = `appId=${result.appid}&nonceStr=${result.nonce_str}&package=prepay_id=${result.prepay_id}&signType=MD5&timeStamp=${times}&key=${payConfig.key}`;
  var paySign = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  return {
    timeStamp: times.toString(),
    nonceStr: result.nonce_str,
    package: `prepay_id=${result.prepay_id}`,
    signType: 'MD5',
    paySign: paySign,
    outTradeNo: result.pay_id
  };
}
/*
<xml>
   <return_code><![CDATA[SUCCESS]]></return_code>
   <return_msg><![CDATA[OK]]></return_msg>
   <appid><![CDATA[wx2421b1c4370ec43b]]></appid>
   <mch_id><![CDATA[10000100]]></mch_id>
   <nonce_str><![CDATA[IITRi8Iabbblz1Jc]]></nonce_str>
   <openid><![CDATA[oUpF8uMuAJO_M2pxb1Q9zNjWeS6o]]></openid>
   <sign><![CDATA[7921E432F65EB8ED0CE9755F0E86D72F]]></sign>
   <result_code><![CDATA[SUCCESS]]></result_code>
   <prepay_id><![CDATA[wx201411101639507cbf6ffd8b0779950874]]></prepay_id>
   <trade_type><![CDATA[JSAPI]]></trade_type>
</xml>
*/
/*
var _calcOrderTotalPay = (oDetail) => {
  var total_pay = 0;
  oDetail.goods_info.forEach(v => {
    total_pay += parseInt(v.price * 100) * v.num; //toFixed
  });
  if (oDetail.total_pay.toFixed(2) != (total_pay / 100).toFixed(2)) {
    return {
      errMsg: "支付金额与订单金额不相等"
    }
  }
}*/
var _getPaymentLog = async(pay_id) => {
  return await db.collection("xlh_paymentlog").where({
    pay_id: pay_id
  }).field({
    order_id: 1,
    pay_id:1,
    mergeflag:1,
    primary_id: 1, //对应xlh_orderdetail._id
    order_num: 1, //订单数量
    goods_num: 1,
    total_pay: 1,
    status: 1,
    errmsg: 1
  }).get();
}

//xlh_paymentlog
var _insertPaymentLog = async(payment) => {
  return await db.collection("xlh_paymentlog").add({
    data: payment
  });
}

var _getOrderDetail = async(event) => {

  const wxContext = cloud.getWXContext()
  const {
    _id,
    order_id,
    mergeflag,
    total_pay
  } = event;

  var goods_info = null,
    oDetail = null,
    order_num = 0,
    order_total_pay = 0;

  if (!_id || !_id.trim()) {
    if (!order_id || !order_id.trim()) {
      return {
        errMsg: "订单号空异常"
      }
    }
    if(mergeflag!==1){
      return {
        errMsg: "支付异常（MF参数错误）"
      }
    }
    //这个情况是多个商铺的产品一起支付，根据order_id支付
    oDetail = await db.collection('xlh_orderdetail').where({
      order_id: order_id
    }).field({
      openid: true,
      pay_id: true,
      order_id: true,
      shopid:true,
      shopname:true,
      goods_info: true,
      total_pay: true
    }).get();
    if (!oDetail.data || oDetail.data.length === 0) {
      return {
        errMsg: "订单空异常，请重新下单"
      }
    }
  
    goods_info = oDetail.data.reduce((pre, cur, arr) => {
      return pre.concat(cur.goods_info.map(v => {
        order_total_pay += v.saleprice;
        return {
          cover:v.cover,
          goods_id: v.goods_id, //商品主键docid
          shopid:cur.shopid, //后面生成statis_incomemonth要用到，参考cashout模块
          shopname:cur.shopname,
          goodsno: v.goodsno,
          goodsname: v.goodsname,
          model_value: v.model_value,
          model_id: v.model_id,
          stockflag: v.stockflag,
          price: v.price,
          saleprice: v.saleprice,
          total_pay: v.total_pay,
          num: v.num
        }
      }));
    }, []);

    order_num = oDetail.data.length;
    oDetail = oDetail.data[0];

  } else {
    //根据_id查询（只有一笔记录，按商户支付，一个商户一笔）
    oDetail = await db.collection('xlh_orderdetail').doc(_id).field({
      openid: true,
      pay_id: true,
      order_id: true,
      shopid: true,
      shopname: true,
      goods_info: true,
      total_pay: true
    }).get();
    if (!oDetail.data) {
      return {
        errMsg: "订单异常，请重新下单"
      }
    }
    goods_info = oDetail.data.goods_info.map((v, idx, arr) => {
      order_total_pay += v.saleprice;
      return {
        cover:v.cover,
        goods_id: v.goods_id, //商品主键docid
        shopid:oDetail.data.shopid, //后面生成statis_incomemonth要用到，参考cashout模块
        shopname:oDetail.data.shopname,
        goodsno: v.goodsno,
        goodsname: v.goodsname,
        model_value: v.model_value,
        model_id: v.model_id,
        stockflag: v.stockflag,
        price: v.price,
        saleprice: v.saleprice,
        total_pay: v.total_pay,
        num: v.num
      }
    });
    order_num = 1;
    oDetail = oDetail.data;
  }

  if (myNum.neq(order_total_pay, total_pay)) {
    return {
      errMsg: "支付金额与订单金额不相等"
    }
  }

  return {
    mergeflag:order_num > 1 ? 1 : 0,
    primary_id: order_num > 1 ? null : oDetail._id,
    shopid: order_num > 1 ? null : oDetail.shopid, //shopid=null时候，多个商铺的订单一起支付。后面商铺提现的cashout模块里面需要拆分开。
    shopname: order_num > 1 ? null : oDetail.shopname,
    order_num: order_num,
    goods_num: goods_info.length,
    pay_id: oDetail.pay_id,
    order_id: oDetail.order_id,
    order_openid: oDetail.openid, //订单所有者
    openid: wxContext.OPENID, //支付者
    appid: wxContext.APPID,
    goods_info: goods_info,
    total_pay: total_pay
  };
}
/*
{"transcode":"PRE_ORDER","_id":"rdNtFADsS19blCGcVWfAdUXCmIJi0d3YgLWC0HvYk1e3iKga","order_id":"sandboxstr131","openid":"ounQF5gNI1fojHjR6JnyBekJpowQ","total_pay":131}
------
{"_id":null,"order_id":"47315773642611140c2b8e15faaff0b0","shopid":null,"total_pay":1.33,"transtype":"wx","actionname":"unifiedOrder"}
------
{"_id":null,"order_id":"19615773660304274aac777ee0552910","shopid":null,"total_pay":1.18,"transtype":"wx","actionname":"unifiedOrder"} 
---------------
{"_id":null,"order_id":"34415773654173591db973b010b4cea2","shopid":null,"total_pay":1.18,"transtype":"wx","actionname":"unifiedOrder"}

注意了：如果前台传 order_id，那么一定是合并支付（多商家的商品一起支付，这个时候为了防止问题，是否需要多传一个标志呢。比如: mergeflag =1）
*/
module.exports = async(event, wxContext) => {

  var oDetail = await _getOrderDetail(event);
  if (oDetail.errMsg) {
    return oDetail;
  }
  if (oDetail.pay_id) {
    //已经支付过了，需要检查是否重复支付
    var _payment = await _getPaymentLog(oDetail.pay_id);
    if (_payment.data && _payment.data.length > 0
     && _payment.data[0].status === PAY_SUCCESS
     && oDetail.order_num === _payment.data[0].order_num
     && oDetail.goods_num === _payment.data[0].goods_num
     && myNum.toFen(oDetail.total_pay) === _payment.data[0].total_pay) {
      return await retryUpdOrderDetail(_payment.data[0]);
    }
  }

  var stockCheck = await stockHelper.handleStock(oDetail, true);
  if (!stockCheck.success) {
    return stockCheck;
  }
  /**长度6000 商品详细描述，对于使用单品优惠的商户，该字段必须按照规范上传，详见“单品优惠参数说明” */
  oDetail.goods_info_str = oDetail.goods_info.length > 1 ? `共${oDetail.goods_info.length}件商品` : oDetail.goods_info[0].goodsname;
  oDetail.nonce_str = nonceStr();
/*
  var res = _calcOrderTotalPay(oDetail);
  if (res && res.errMsg) {
    return res;
  }
*/
  var payment = Object.assign({}, oDetail);
  payment.settime = new Date();
  payment.status = PAY_PEN;//等待支付状态
  payment.total_pay = myNum.toFen(oDetail.total_pay);
  payment.pay_id = mySeq.mySeq32(mySeq.N3());
  //支付确认成功的日期,用的是业务服务器的时间，即查询支付结果的日志（注意：与paytime可能不相等），参考queryOrder
  //payment.confirmdate = null;
  //把goods_info[].shopid去重并且转换为[shopid1,shopid2,shopid3]字符串数组，后面在cashout.genIncomeMonth.js查询统计中使用
  payment.shopids = Object.keys(oDetail.goods_info.reduce((p,c)=>{
    p[c.shopid]=1;
    return p;
  },{}));
  //add by xiaojm at 20200216 pay_id作为主键
  payment._id = payment.pay_id;

  //更新支付流水，类似物流处理需要处理logis_id（见：manager/logistics/createLogistics)
  var res = await db.collection('xlh_orderdetail').where({
      order_id: payment.order_id
    }).update({
      data: {
        pay_id: payment.pay_id,
        updatetime: db.serverDate()
      }
    });

  var res = await _insertPaymentLog(payment);
  if (!res._id) {
    return res;
  }

  _genReqSign(payment);

  var reqParams = _initReqBody(payment);

  return new Promise((resolve, reject) => request({
    url: payConfig.unified_url,
    method: 'POST',
    body: reqParams
  }, (err, res, body) => {
    if (!body) {

      stockHelper.handleStock(payment).then(rls=>{
        reject({
          errMsg: "返回报文未空"+`(${rls.errMsg})`
        })
      })
      return;
    }
    xmlParser.parseString(body, (err, res) => {
      if (err) {
        stockHelper.handleStock(payment).then(rls=>{
          reject({
            errMsg: `${err.message||err.errMsg}(${rls.errMsg})`
          })
        })     
        return;
      }
      var result = _doResult(res.xml, payment);

      if (!result.prepay_id) {
        //_rollBackStock(payment);
        stockHelper.handleStock(payment).then(rls=>{
          reject({
            errMsg: `${result.err_code_des}:${result.retmsg}_${result.return_msg}(${rls.errMsg})`
          })
        })
        return;
      }
      result.nonce_str = payment.nonce_str;
      result.pay_id = payment.pay_id;
      result.appid = payment.appid;

      var payParams = _initPayment(result);
      payParams.sandbox = payConfig.key == payConfig.sandbox_key;
      payParams.pay_id = payment.pay_id;
      //不要返回success了。用pay_id判断是否处理成功
      //payParams.success=1;
      resolve(payParams);
    });

  }));
}