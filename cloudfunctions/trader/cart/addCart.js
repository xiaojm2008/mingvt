// 云函数入口文件
const cloud = require('wx-server-sdk')
const goodsServ = require('../comm/goodsServ.js');
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var decreaseStockNum = async(willCart) => {
  var whereCondi = {
    goodsno: willCart.goodsno
  };

  var tmp = await db.collection("xlh_goods").where(whereCondi).field({
    stockflag: true,
    quantity: true,
    modelitems: true
  }).get();
  tmp = tmp.result.data && tmp.result.data.length > 0 ? tmp.result.data[0] : null;

  const cmd = db.command;
  if (willCart.model_id && willCart.model_id != "") {

    if (tmp.stockflag != '1') {
      //不用库存控制
      var data = {
        modelitems: {}
      };
      data.modelitems[willCart.model_id] = {};
      data.modelitems[willCart.model_id].buycount = cmd.inc(willCart.num);
      return await db.collection("xlh_goods").where(whereCondi).update({
        data: data
      });

    } else {
      var data = {
        modelitems: {}
      };
      data.modelitems[willCart.model_id] = {};
      data.modelitems[willCart.model_id].stock = cmd.inc(0 - willCart.num);

      if (tmp && tmp.modelitems[willCart.model_id] && tmp.modelitems[willCart.model_id].stock - willCart.num >= 0) {
        return await db.collection("xlh_goods").where(whereCondi).update({
          data: data
        });
      } else {
        return {
          errMsg: `谢谢您的关顾！您购买的型号${willCart.model_value}库存不够，但您可以关注商家，关注最新商品进展！`
        }
      }
    }
  } else {
    if (tmp.stockflag != '1') {
      return await db.collection("xlh_goods").where(whereCondi).update({
        data: {
          quantity: {
            buycount: cmd.inc(willCart.num)
          }
        }
      });
    } else {
      if (tmp && tmp.quantity && tmp.quantity.stockqty - willCart.num >= 0) {
        return await db.collection("xlh_goods").where(whereCondi).update({
          data: {
            quantity: {
              stockqty: cmd.inc(0 - willCart.num),
              buycount: cmd.inc(willCart.num)
            }
          }
        });
      } else {
        return {
          errMsg: `谢谢您的关顾！您购买商品${willCart.goodsname}库存不够，但您可以关注商家，关注最新商品进展！`
        }
      }
    }
  }
}
var getExistsCartGoods = async(willCart) => {
  //const cmd = db.command;
  var whereCondi = {
    openid: willCart.openid,
    goodsno: willCart.goodsno
  };
  willCart.model_id && willCart.model_id != "" ? whereCondi.model_id = willCart.model_id : "";

  var inCart = await db.collection("xlh_cart").where(whereCondi).field({
    _id: true,
    status: true
  }).get();
  if (inCart && inCart.data && inCart.data.length > 0) {
    return inCart.data;
  }
  return null;
}

// 云函数入口函数
module.exports = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    cover,
    goodsno,
    model_id,
    model_value,
    models_mainkey,
    models_mainkey_idx,
    num
  } = event;
  var goods_info = {
    cover,
    goodsno,
    model_id,
    model_value,
    models_mainkey,
    models_mainkey_idx,
    num
  };

  var goodsInfo = await goodsServ.getGoodsInfo([goods_info]);
  if (goodsInfo.errMsg) {
    return goodsInfo.errMsg;
  }

  var cartInfo = goodsInfo.data[0];
  cartInfo.openid = wxContext.OPENID;
  cartInfo.active = true;
  cartInfo.status='0';//'0' 未处理，待支付,'9'已经删除
  cartInfo.updatetime= db.serverDate();

  var existsCartGoods = await getExistsCartGoods(cartInfo);
  if (existsCartGoods) {
    const cmd = db.command
    var tmp = existsCartGoods[0];
    const _id = tmp._id;
    delete tmp._id;
    //原子性
    var upd = await db.collection("xlh_cart").doc(_id).update({
      data: Object.assign(
        tmp, cartInfo, {
          "num": tmp.status == '9' ? 1 : cmd.inc(cartInfo.num) //如果购物车里面的货已经删除了，那么重新修改状态即可      
        })
    });
    if (upd.stats.updated > 0) {
      //var stockRes = await decreaseStockNum(cartInfo);
      return {
        _id: tmp._id,
        success: 1,
        errMsg: `您的商品已经成功追加到购物车`
      };
    }
    return {
      errMsg: "添加到购物车失败！"
    };
  }

  cartInfo.settime = db.serverDate();
  var res = await db.collection("xlh_cart").add({
    data: cartInfo
  });
  if (res._id) {
    return {
      success: 1,
      _id: res._id,
      errMsg: "您的商品已经成功添加到购物车"
    }
  }
  return res;
}