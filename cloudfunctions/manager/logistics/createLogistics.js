const manageRight = require('../comm/manageRight.js');
const logisticsCfg = require('./logisticsCfg.js');
const getUserInfo = require('../comm/getUserInfo.js');
const sendPost = require('../comm/sendPost.js');
const encrypt = require('../comm/encryptMD5.js');
const cloud = require('wx-server-sdk')
const mySeq = require('../comm/mySeq.js');
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

/*
{
"transtype":"logistics",
"actionname":"createLogistics",
"order_id":"1",
"shopid":"0",
"data":{
  "ordercode":"1",
  "shippercode":"SF",
  "sender":{
    "company":"",
    "username":"肖颖靖",
    "phone":"15361689524",
    "province":"广东省",
    "city":"深圳市",
    "area":"宝安区",
    "detail":"裕安一路3024号尚都"
  },
  "receiver":{
    "company":"",
    "username":"李武",
    "phone":"15690981111",
    "province":"上海市",
    "city":"上海市",
    "area":"静安区",
    "detail":"骊山路一号"
  },
  "addservice":[{
    "name":"附加信息",
    "value":"附加值"
  }],
  "weight":122.0,
  "num":12,
  "volumn":12,
  "remark":"无"}
}

{
  "Order" : {
    "LogisticCode" : "233657113517,047238144705,047238144714,047238144723,047238144732,047238144741,047238144750,047238144769,047238144778,047238144787,047238144796,047238144802",
    "ShipperCode" : "SF",
    "OrderCode" : "1",
    "KDNOrderCode" : "KDN1907201710016711"
  },
  "EBusinessID" : "1553391",
  "UniquerRequestNumber" : "54cbf60a-e82c-484d-94e9-917e341cf0a0",
  "ResultCode" : "100",
  "Reason" : "您已预约成功，请提前准备好包裹！",
  "Success" : true
}
*/
/**
 * 预约取件API
预约取件API为用户提供了在线下单，预约快递员上门揽件的功能，为用户解决在线发货需求。
现已支持快递、快运业务，同城配业务即将上线。已覆盖国内主流物流公司，更多公司持续接入入中。
 */
const REQUEST_TYPE = '1001'; //请求指令类型：1001
const DATA_TYPE = '2'; //2:请求、返回数据类型：只支持JSON格式

var _requestOOServ = (requestData, callback) => {

  var params = {};

  params["RequestData"] = encodeURIComponent(requestData);
  params["EBusinessID"] = logisticsCfg.EBusinessID;
  params["RequestType"] = REQUEST_TYPE;
  var dataSign = encrypt(requestData, logisticsCfg.AppKey);
  params["DataSign"] = encodeURIComponent(dataSign);
  params["DataType"] = DATA_TYPE;

  var result = sendPost(logisticsCfg.OOrderService, params, callback);
}


var _initLogisticsOrder = (userInfo, params, oDetail, pri_id) => {

  var shopInfo = userInfo.shopinfo;

  return {
    'OrderCode': pri_id,
    'ShipperCode': params.shippercode, //'YTO','SF',
    'PayType': 1, //邮费支付方式:1-现付，2-到付，3-月结，4-第三方支付
    'ExpType': 1, //快递类型：1-标准快件
    //'Cost': 1.0,
    //'OtherCost': 1.0,
    'Sender': {
      'Company': params.sender.company || shopInfo.shopname,
      'Name': params.sender.username,
      'Mobile': params.sender.phone,
      'ProvinceName': params.sender.province,
      'CityName': params.sender.city,
      'ExpAreaName': params.sender.area,
      'Address': params.sender.detail
    },
    'Receiver': {
      'Company': params.receiver.company,
      'Name': params.receiver.username,
      'Mobile': params.receiver.phone,
      'ProvinceName': params.receiver.province,
      'CityName': params.receiver.city,
      'ExpAreaName': params.receiver.area,
      'Address': params.receiver.detail
    },
    'Commodity': oDetail.goods_info.map((v, i, a) => {
      return {
        'GoodsCode': v.goodsno,
        'GoodsName': v.goodsname,
        'Goodsquantity': v.num,
        'GoodsWeight': v.weight || 0
      }
    }),
    'AddService': params.addservice ? params.addservice.map((v, i, a) => {
      return {
        'Name': v.name,
        'Value': v.value
      }
    }) : null,
    'Weight': params.weight || 0,
    'Quantity': params.num || 0, //包裹数
    'Volume': params.volumn || 0,
    'Remark': params.remark
  };
}
/*
失败：
{
    "EBusinessID": "1237100",
    "Success": false,
    "ResultCode": "105",
    "Reason": "该订单已经存在，请勿重复操作",
    "UniquerRequestNumber":"451d3c7c-b428-490a-a4ed-e368f15f6c74"
}
成功：
{
    "EBusinessID": "1237100",
    "Success": true,
    "Order": {
        "OrderCode": "012657018199",
        " ShipperCode ": " SF ",
        " LogisticCode ": ""
    },
    "ResultCode": "100",
    "Reason": ""
}
*/
var _updLogisticsLog = (pri_id, res) => {
  var logisticsLog = {
    logisticcode: (res.Success == 'false' || res.Success === false) ? null : res.Order.LogisticCode,
    resultcode: res.ResultCode,
    reason: res.Reason,
    uniquerrequestnumber: res.UniquerRequestNumber,
    retcode: (res.Success == 'true' || res.Success === true) ? '0000' : res.ResultCode,
    retmsg: res.Reason,
    updatetime: db.serverDate()
  }
  return db.collection('xlh_logisticslog').doc(pri_id).update({
    data: logisticsLog
  });
}

var _insertLogisticsLog = async(pri_id, oDetail, logisticsOrder, params) => {
  var preLogistics = {
    _id: pri_id,
    request_type: REQUEST_TYPE,
    logis_id: pri_id,
    shopid: oDetail.shopid,
    shopname: oDetail.shopname,
    order_id: oDetail.order_id,
    exp_code: logisticsOrder.ShipperCode, //'SF','ZTO'
    exp_name: params.data.shippername, //
    exp_no: null,
    BN: null,
    logisticcode: null,
    logisticsinfo: logisticsOrder,
    resultcode: null,
    reason: null,
    uniquerrequestnumber: null,
    cancelflag: '0',
    retcode: null,
    retmsg: null,
    settime: db.serverDate(),
    updatetime: db.serverDate()
  }

  return await db.collection('xlh_logisticslog').add({
    data: preLogistics
  });
}

//预约揽件成功了才写 xlh_orderdetail
var _insertLogistics = (pri_id, res, oDetail, logisticsOrder, params) => {
  var logistics = {
    request_type: REQUEST_TYPE,
    logis_id: pri_id,
    shopid: oDetail.shopid,
    shopname: oDetail.shopname,
    order_id: oDetail.order_id,
    exp_code: logisticsOrder.ShipperCode, //'SF','ZTO'
    exp_name: params.data.shippername, //
    exp_no: null,
    BN: null,
    logisticsinfo: logisticsOrder,
    /*
    logisticcode: null,
    resultcode: null,
    reason: null,
    uniquerrequestnumber: null,  
    retcode: null,
    retmsg: null,
    */
    logisticcode: res.Order.LogisticCode,
    resultcode: res.ResultCode,
    reason: res.Reason,
    uniquerrequestnumber: res.UniquerRequestNumber,
    retcode: '0000',
    retmsg: res.Reason,
    cancelflag: '0',
    status:'0', //'0':待揽件，'1':已经揽件,2：'已达到'，'3':对方已经确认收件
    settime: db.serverDate(),
    updatetime: db.serverDate()
  }

  db.collection("xlh_orderdetail").doc(oDetail._id).update({
    data: {
      logis_id: logistics.logis_id
    }
  }).then(res => {
    console.log("xlh_orderdetail", res);
  }).catch(err => {
    console.log("xlh_orderdetail err", err);
  })

  return db.collection('xlh_logistics').doc(pri_id).set({
    data: logistics
  });
}
/**
 * {"order_id":"7991576341511018b90857075ca93af7","shopid":"S0000","data":{"ordercode":"7991576341511018b90857075ca93af7","shippercode":"SF","shippername":"顺丰速运","sender":{"company":"撒士大夫萨芬萨芬的撒飞洒登封市否收到","username":"肖锦明","phone":"15362585256","province":"四川省","city":"成都市","area":"锦江区","detail":"露露脸具体快捷键乐透野兔他哭楼梯提交了152哦了"},"receiver":{"company":"","username":"肖锦明","phone":"15362585256","province":"四川省","city":"成都市","area":"锦江区","detail":"露露脸具体快捷键乐透野兔他哭楼梯提交了152哦了"},"addservice":null,"weight":1,"num":1,"volumn":2,"remark":"无"},"transtype":"logistics","actionname":"createLogistics"}
 * 
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
    shopid: true,
    shopname: true,
    order_id: true,
    "logis_id": true,
    "goods_info.goodsno": true,
    "goods_info.goodsname": true,
    "goods_info.num": true,
    "goods_info.weight": true
  }).get();
  if (!oDetail.data || oDetail.data.length === 0) {
    return {
      errMsg: '订单不存在'
    }
  } else if (oDetail.data.length > 1) {
    return {
      errMsg: '订单号重复' + oDetail.data.length
    }
  }
  oDetail = oDetail.data[0];
  if (!oDetail.goods_info || oDetail.goods_info.length === 0) {
    return {
      errMsg: '您的订单中缺少商品信息',
      order: oDetail
    }
  }

  var logis = await db.collection('xlh_logistics').where(oDetail.logis_id ? {
    logis_id: oDetail.logis_id
  } : {
    order_id: oDetail.order_id,
    shopid: userInfo.shopinfo.shopid,
    retcode: "0000",
    cancelflag: '0'
  }).field({
    _id: 1,
    exp_code: 1,
    order_id: 1,
    cancelflag: 1,
    logis_id: 1,
    retcode: 1
  }).get();

  if (logis.data && logis.data.length > 1) {
    return {
      errMsg: `异常：您的订单存在【${logis.data.length}】笔成功预约的揽件申请！请确认！`
    }
  }

  if (logis.data && logis.data.length > 0 &&
    logis.data[0].retcode == "0000" &&
    logis.data[0].cancelflag != "1") {
    return {
      errMsg: `订单[${oDetail.order_id}]已经预约快递了，请不要重复下单[${logis.data.length}]`
    }
  }

  const pri_id = mySeq.mySeq(mySeq.N3());

  var logisticsOrder = await _initLogisticsOrder(userInfo, event.data, oDetail, pri_id);

  //写揽件申请日志
  await _insertLogisticsLog(pri_id, oDetail, logisticsOrder, event);


  /*
  if (logis) {
    await _insertOrUpdatePreLogistics(oDetail, logisticsOrder, event, true, logis._id);
  } else {
    var res = await _insertOrUpdatePreLogistics(oDetail, logisticsOrder, event);
    if (!res._id) {
      return {
        errMsg: "写预约取件流水失败，请重试！"
      }
    }
    logis = {};
    logis._id = res._id;
  }
  */

  return await new Promise((resolve, reject) => {

    return _requestOOServ(JSON.stringify(logisticsOrder), (err, body) => {
      var res = null;
      if (err) {
        res = {
          errMsg: err.message,
          retcode: '9998'
        };
        reject(res);
      } else {
        var res = JSON.parse(body);

        //更新结果到揽件申请日志
        _updLogisticsLog(pri_id, res).then(reslog => {
          console.log("_updLogisticsLog:", reslog);
        }).catch(errlog => {
          console.log("_updLogisticsLog err:", reslog);
        });
        //106 该订单号已下单成功
        //100 成功
        if (res.ResultCode == '100' || res.ResultCode === '106') {
          //揽件申请成功才会写揽件流水
          _insertLogistics(pri_id, res, oDetail, logisticsOrder, event).then(res11 => {
            if (res11._id) {
              resolve({
                errMsg: res.Reason,
                success: 1,
                retcode: '0000'
              });
            } else {
              reject({
                errMsg: '新增预约揽件流水失败:' + ((res.Success == 'true' || res.Success === true) ? '预览揽件申请成功' : (res.Reason + ":" + res.ResultCode))
              });
            }
          }).catch(err11 => {
            reject(err11);
          });
        } else {
          //预约揽件返回失败 ResultCode
          resolve({
            errMsg: res.Reason,
            retcode: res.ResultCode || '9999',
            success: 0
          })
        }
      }
    })
  }).catch(err => {
    return {
      errMsg: err.message
    };
  });
}