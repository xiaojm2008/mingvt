// 云函数入口文件
const cloud = require('wx-server-sdk')
const mySeq = require('../comm/mySeq.js');
const goodsServ = require('../comm/goodsServ.js');
const myNum = require("../comm/myNum.js");
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const ORST_PEN_PAY = "0"; //待支付
const ORST_PEN_DELIVERY = "1"; //待发货

var _groupByShop = (goodsInfo, order) => {
  /*
  groupByShop商品按商铺分类
  {
    SHOPID0:[goodsinfo0,goodsinfo1],
    SHOPID1:[goodsinfo10,goodsinfo11],
  }
  goodsinfo0:商品信息
  {
    stockflag: ,
    stock:,
    num: ,
    price:,
    saleprice: ,
    total_pay：//按shopid分组的商品价格和
    order_total_pay: //所有商品价格和
  }
  */
  var groupByShop = goodsInfo.data2
  allGoodsInfo = goodsInfo.data,
    arr = [],
    order_total_pay = 0;

  for (var k in groupByShop) {
    var v = groupByShop[k];
    //total_pay: v[v.length - 1].order_total_pay, //订单所有商铺所有商品的支付金额，即订单金额。
    arr.push(Object.assign({
      //_id:mySeq.mySeq32(mySeq.N3()), //唯一ID 让系统生成吧
      shopid: k, //商铺ID
      shopname: v[0].shopname,
      total_pay: v[v.length - 1].total_pay, //一个商铺（按商铺分组）所有商品的支付金额   
      goods_num: v.length, //订单中的商品数量
      goods_info: v
    }, order));
  }

  order_total_pay = arr[0].total_pay;

  if (arr.length > 1) {
    order_total_pay = 0;
    //订单中包含了多个商铺的商品，那么需要生成order_subid
    arr.forEach(v => {
      order_total_pay += v.total_pay;
    });
  }

  if (myNum.neq(order_total_pay, allGoodsInfo[allGoodsInfo.length - 1].order_total_pay)) {
    throw new Error(`订单金额有误：${myNum.toFen(order_total_pay)} ：${myNum.toFen(allGoodsInfo[allGoodsInfo.length - 1].order_total_pay)}`)
  }

  return arr;
}

var _initOrderInfo = async (event) => {
  var {
    _id,
    order_id,
    remark,
    addressinfo,
    totalpay,
    goodsinfo
  } = event;
  const wxContext = cloud.getWXContext();

  var goodsInfo = await goodsServ.getGoodsInfo(goodsinfo);

  if (goodsInfo.errMsg) {
    throw new Error(goodsInfo.errMsg);
  }
  //如果 order_id 不Null,那么order_id不用重新生成,生成订单的时候先remove
  var orderInfo = {
    order_id: order_id && order_id.trim() ? order_id : mySeq.mySeq32(mySeq.N3()),
    remark: remark,
    openid: wxContext.OPENID,
    additional_info: null,
    address_info: addressinfo,
    can_use_benefit: null,
    discount_cut_price: 0,
    //goods_info: goodsInfo,
    selected_benefit: {
      "discount_type": null
    },
    tostore_data: {},
    status: ORST_PEN_PAY,
    settime: db.serverDate(),
    updatetime: db.serverDate()
  };

  var arr = _groupByShop(goodsInfo, orderInfo);

  return arr;

};
var _check = (event) => {
  var addressinfo = event.addressinfo;
  if (!addressinfo) {
    return {
      errMsg: '收件人地址信息不能空'
    }
  }
  if (!addressinfo.name || !addressinfo.name.trim()) {
    return {
      errMsg: '收件人不能空'
    }
  }
  if (!addressinfo.contact || !addressinfo.contact.trim()) {
    return {
      errMsg: '收件人电话号码不能空'
    }
  }
  if (!addressinfo.province.text || !addressinfo.province.text.trim()) {
    return {
      errMsg: '收件人省份不能空'
    }
  }
  if (!addressinfo.city.text || !addressinfo.city.text.trim()) {
    return {
      errMsg: '收件人城市不能空'
    }
  }
  if (!addressinfo.district.text || !addressinfo.district.text.trim()) {
    return {
      errMsg: '收件人县（区）不能空'
    }
  }
  if (!addressinfo.detailaddress || !addressinfo.detailaddress.trim()) {
    return {
      errMsg: '收件人详细地址不能空'
    }
  }
}
var _addOrder = async (wxContext, orderArr, origin_order_id) => {
  var res = null;
  if (origin_order_id && origin_order_id.trim()) {
    //如果原来的订单存在,并且都没有支付成功，才能移除或者修改订单
    res = await db.collection('xlh_orderdetail').where({
      order_id: origin_order_id,
      status: ORST_PEN_DELIVERY //待发货了
    }).field({
      shopid: 1
    }).get();
    if (res.data && res.data.length > 0) {
      return {
        errMsg: '订单已经支付成功，不需要重新支付'
      }
    }
    res = await db.collection('xlh_orderdetail').where({
      order_id: origin_order_id,
      status: ORST_PEN_PAY //待支付
    }).remove();
    /*
    if (!res.stats || res.stats.removed === 0) {
      return {
        errMsg: '移除源订单信息失败'
      }
    }*/
  }
  var tasks = [],
    succ = [];

  //插入订单,add 不支持传数组
  /*
  res = await db.collection('xlh_orderdetail').add({
    data: orderArr
  });
  */

  orderArr.forEach((v, i, a) => {
    tasks.push(db.collection('xlh_orderdetail').add({
      data: v
    }))
  });

  res = await Promise.all(tasks);
  res.forEach((v, i, a) => {
    if (v._id) {
      orderArr[i]._id = v._id;
      succ.push(orderArr[i]);
    }
  });

  var willDel = succ.reduce((pre, cur) => {
    pre = pre.concat(cur.goods_info.map(v => db.collection("xlh_cart").where(v.model_id && v.model_id.trim() ? {
      openid: wxContext.OPENID,
      goodsno: v.goodsno,
      model_id: v.model_id
    } : {
      openid: wxContext.OPENID,
      goodsno: v.goodsno
    }).remove()));
    return pre;
  }, []);

  if (willDel.length > 0) {
    res = await Promise.all(willDel);
  }
  if (succ.length != orderArr.length) {
    return {
      success: 0,
      order_id: orderArr[0].order_id,
      errMsg: '存在部分商品提交失败，请确认是否继续支付！'
    }
  }
  return {
    success: 1,
    _id: orderArr.length === 1 ? orderArr[0]._id : null,
    shopid: orderArr.length === 1 ? orderArr[0].shopid : null,
    order_id: orderArr[0].order_id,
    errMsg: '订单提交成功！'
  }
}
/*
 {"goodsinfo":[{"goodsno":"S0000201909120143519898f7c62b70944","goodsname":"V型派男士外套","model_id":"3252,450c,2cea","model_value":"红色|M160-165|尼纶纤维","num":7,"price":22},{"goodsno":"S0000201909120143519898f7c62b70944","goodsname":"V型派男士外套","model_id":"e52d,5f34,2cea","model_value":"灰色|XXL175-180|尼纶纤维","num":1,"price":75},{"goodsno":"S0000201909120046316726a87a59e272b","goodsname":"客气就好了我无聊哦们昆明门头扣扣莫用没有用你有嗯偷偷哦我头目哦头模头欧诺某木木木哦头","model_id":"2581,1c06","model_value":"MM一族牟看看|黄色的通","num":1,"price":280}],"transtype":"order","actionname":"addOrder"}
---------------------
 {"order_id":null,"remark":"","totalpay":1.18,"addressinfo":{"_id":"face13585d3a7e1002e910176ce3e88a","city":{"code":"","text":"成都市"},"contact":"15362585256","detailaddress":"露露脸具体快捷键乐透野兔他哭楼梯提交了152哦了","district":{"code":"","text":"锦江区"},"is_default":1,"name":"肖锦明","openid":"ounQF5gNI1fojHjR6JnyBekJpowQ","province":{"code":"","text":"四川省"},"updatetime":1576335360584},"goodsinfo":[{"cover":"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000/goods/new_20191213/a1b2711245ab2e616337fb803b0c8ef5.jpg","goodsno":"GOO1576237559995d019c2ad1f6f0292","goodsname":"商品20191213-2000","model_id":"","model_value":"","models_mainkey":"","models_mainkey_idx":-1,"num":1,"price":0.01},{"cover":"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000/goods/new_20191215/d6ca24b6c6245cb506f663b6d00bbd02.jpg","goodsno":"GOO15763410420990f61d3efa88c57c6","goodsname":"商品20191215","model_id":"a024,16df","model_value":"普通版|含在线视频课程","models_mainkey":"c0e4","models_mainkey_idx":0,"num":1,"price":0.01},{"cover":"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000/goods/new_20191213/b33ca18591d490ed508df7b768717e19.jpg","goodsno":"GOO15762372308609f90c14c8a580776","goodsname":"商品201912130727","model_id":"21ab,4099,6500","model_value":"咖啡色|165-170|涤纶","models_mainkey":"16fc","models_mainkey_idx":0,"num":1,"price":0.15},{"cover":"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/SHP15771868785484d2bf06a29f92081/goods/new_20191225/7a9e7e9a6bf9436566fc20ac4587305b.jpg","goodsno":"GOO157728496604773b7b89b54034cb6","goodsname":"f","model_id":"","model_value":"","models_mainkey":"","models_mainkey_idx":-1,"num":1,"price":1},{"cover":"cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/SHP15771868785484d2bf06a29f92081/goods/GOO15772834373523c376d4d40cb27e5/e6d412c332d387ab5540f3b9433bc672.jpg","goodsno":"GOO15772834373523c376d4d40cb27e5","goodsname":"测试商店的商品1","model_id":"","model_value":"","models_mainkey":"","models_mainkey_idx":-1,"num":1,"price":0.01}],"transtype":"order","actionname":"addOrder"}
*/
module.exports = async (event, context) => {
  var {
    _id,
    order_id
  } = event;

  const wxContext = cloud.getWXContext();

  var res = _check(event);
  if (res && res.errMsg) {
    return res;
  }

  var orderArr = await _initOrderInfo(event);
  if (orderArr.length === 0) {
    return {
      order_id: null,
      errMsg: '生成订单失败：空订单！'
    }
  }

  if (!_id || !_id.trim()) {
    return _addOrder(wxContext, orderArr, order_id);
  } else {
    //更新订单
    res = await db.collection('xlh_orderdetail').doc(_id).field({
      status: 1
    }).get();
    if (res.data && res.data.status != ORST_PEN_PAY) {
      return {
        errMsg: '当前订单非待支付状态！'
      }
    }
    res = await db.collection('xlh_orderdetail').doc(_id).set({
      data: orderArr[0]
    });
    if (res.stats && res.stats.updated === 1) {
      return {
        success: '1',
        _id: _id,
        order_id: order_id,
        errMsg: '更新订单成功！'
      }
    }
    return {
      _id: _id,
      order_id: order_id,
      errMsg: '更新订单失败！'
    }
  }
};