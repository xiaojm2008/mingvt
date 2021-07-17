/**
 * 该文件废弃，具体见stockHelper.js
 */
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

//aggregate这个方式不好使用事务哦
var getGoods = async(goods, field) => {
  var tasks = goods.map(v => {
    var where = {},
      project = Object.assign({}, field);
    where.goodsno = v.goodsno;
    if (v.model_id) {
      //输出转换：只取对应v.model_id，其他的不用，提供网络效率
      var mp = "$modelitems." + v.model_id + ".price",
        ms = "$modelitems." + v.model_id + ".stock",
        sn = "$modelitems." + v.model_id + ".subname"
      bc = "$modelitems." + v.model_id + ".buycount";
      project.modelitem = [mp, ms, sn, bc];
    }
    return db.collection('xlh_goods')
      //.doc(v._id)
      .aggregate()
      .match(where)
      .project(project)
      .end();
  });

  return Promise.all(tasks);
}

var _writeRollBackStockLog = async(failLog, errMsg, errCode) => {
  failLog.errmsg = errMsg;
  failLog.errcode = errCode;
  await db.collection("xlh_rollbackstocklog").add({
    data: failLog
  });
}
var _rollBackStock = async(goodsArr) => {
  for (var i in goodsArr) {
    //成功的操作了库存商品，将回滚处理
    var succ = goodsArr[i];
    try {
      succ.target_plus = !succ.src_plus;
      succ.src_oper_desc = succ.src_plus ? "减少库存,增加购买量处理" : '增加库存,减少购买量处理';
      succ.target_oper_desc = succ.target_plus ? "减少库存,增加购买量处理" : '增加库存,减少购买量处理';
      var res = await _handleStock(succ, succ.target_plus, succ.stockflag === '1');
      if (!res.stats || !res.stats.updated === 0) {
        //记录回滚失败的日志      
        await _writeRollBackStockLog(succ, res.stats.errMsg || res.errMsg, "9999");
        return;
      }
    } catch (e) {
      //记录回滚失败的日志
      await _writeRollBackStockLog(succ, e.errMsg || e.message, "9999");
      return;
    }
    //succ.target_stock = succ.target_plus ? (succ.src_stock - succ.num) : (succ.src_stock + succ.num);
    //succ.target_buycount = succ.target_plus ? (succ.src_buycount + succ.num) : (succ.src_buycount - succ.num);
    await _writeRollBackStockLog(succ, '成功', "0000");
  }
}
/**
 * stock:是否需要增加库存
 * plus:
 * true "减少库存,增加购买量处理" 
 * false:'增加库存,减少购买量处理';
 */
var _handleStock = async(oGoods, plus, stock) => {
  var res = null;
  const cmd = db.command;
  if (oGoods.model_id && oGoods.model_id.trim()) {   
    var data = {
      modelitems: {},
      quantity:{}
    };
    data.modelitems[oGoods.model_id] = {};
    stock && (data.modelitems[oGoods.model_id].stock = cmd.inc(plus ? 0 - oGoods.num : oGoods.num));
    data.modelitems[oGoods.model_id].buycount = cmd.inc(plus ? oGoods.num : 0 - oGoods.num);
    data.quantity.buycount = cmd.inc(plus ? oGoods.num : 0 - oGoods.num);
    res = await db.collection("xlh_goods").where({
      goodsno: oGoods.goodsno
    }).update({
      data: data
    });
  } else {
    res = await db.collection("xlh_goods").where({
      goodsno: oGoods.goodsno
    }).update({
      data: {
        quantity: {
          buycount: cmd.inc(plus ? oGoods.num : 0 -  oGoods.num)
        }
      }
    });
  }
  return res;
}

/**
 * plus：false
 * 回滚库存
 */
var handleStock = async(orderInfo, plus) => {
  
  var prefix = orderInfo.order_id.substr(0, 3);
  if(prefix == 'SEC'){
    //这种订单是不需要处理库存
    return;
  }

  var goodsList = (await getGoods(orderInfo.goods_info, {
    _id:1,
    goodsno: 1,
    goodsname: 1,
    stockflag: 1,
    quantity: 1
  })).reduce((pre, cur) => {
    return pre.concat(cur.list);
  }, []);
  //不用goodsList.map((v)=>{}),因为里面涉及到async _handleStock函数的调用，
  //map里面的函数要不就要定义为async。
  //即goodsList.map(async(v)=>{})的方式
  var goods = null,
    doStockSucc = [];
  for (var i = 0; i < goodsList.length; i++) {
    goods = goodsList[i];
    var oGoods = orderInfo.goods_info[i],
      stock = 0,
      buycount = 0,
      num = oGoods.num,
      goodsname = oGoods.goodsname;
    if (goods.stockflag === '1' && plus) {
      //需要检查库存
      if (oGoods.model_id && oGoods.model_id != "") {
        stock = goods.modelitem[1] || 0;
        buycount = goods.modelitem[3] || 0;
        goodsname = goods.modelitem[2];
      } else {
        stock = goods.quantity.stockqty || 0;
        buycount = goods.quantity.buycount || 0;
      }
      if (stock - num < 0) {
        //库存不够
        return {
          errMsg: `谢谢您的关顾！您购买商品${goodsname.length > 20 ? goodsname.substring(0, 20) : goodsname}(:${oGoods.goodsno})库存不够，但您可以关注商家，关注最新商品进展！`,
          stock: stock,
          buycount: stock,
          num: num
        }
      }
    }
    //buycount = buycount+num
    try {
      var res = await _handleStock(oGoods, plus, goods.stockflag === '1');
      if (!res.stats || !res.stats.updated === 0) {
        //需要回滚成功的处理的库存
        await _rollBackStock(doStockSucc);
        return {
          errMsg: res && res.stats ? res.stats.errMsg : (res ? res.errMsg || `更新库存信息异常` : ''),
          stock: stock,
          buycount: stock,
          num: num
        }
      } else {
        oGoods.stockflag = goods.stockflag;
        oGoods.src_plus = plus;
        oGoods.src_stock = stock;
        oGoods.src_buycount = buycount;
        doStockSucc.push(oGoods);
      }
    } catch (e) {
      //需要回滚成功的处理的库存
      await _rollBackStock(doStockSucc);
      return {
        errMsg: e.errMsg || e.message
      }
    }
  }
  return null;//doStockSucc;
}

module.exports = {
  handleStock: handleStock
}