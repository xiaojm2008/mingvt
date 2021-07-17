const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
const cmd = db.command;
/*
var getGoods=(goods,field)=>{
  var tasks = goods.map(v => {
    var where = {}, project = Object.assign({}, field);
    where.goodsno = v.goodsno;
    if (v.model_id) {
      //输出转换：只取对应v.model_id，其他的不用，提供网络效率
      var mp = "$modelitems." + v.model_id + ".price",
        ms = "$modelitems." + v.model_id + ".stock",
        sn = "$modelitems." + v.model_id + ".subname"
      pic = "$modelitems." + v.model_id + ".picpath";
      //0：mp：价格，1：ms:库存
      project.modelitem = [mp, ms, sn, pic];
    }
    return db.collection('xlh_goods')
      .aggregate()
      .match(where)
      .project(project)
      .end();
  });

  return (await Promise.all(tasks));
}*/
/*
聚合效率有点低,把条件project.matched= $.neq(["$modelitems." + v.model_id, null]);，去掉可以，性能提高了。
不用where也型
var where = {};
    where.goodsno = v.goodsno;
    if (v.model_id) {
      const $ = db.command.aggregate
      //where.modelitems = {};
      //where.modelitems[v.model_id]
      //project.matched = $.eq(["$modelitems." + v.model_id + ".subid", v.model_id]);
      //project.matched = $.neq(["$modelitems." + v.model_id, null]);
      var mp = "$modelitems." + v.model_id + ".price",
        ms = "$modelitems." + v.model_id + ".stock",
        sn = "$modelitems." + v.model_id + ".subname"
      pic = "$modelitems." + v.model_id + ".picpath";
      project.modelitem = [mp, ms, sn, pic];
    }
    return db.collection('xlh_goods')
      .aggregate()
      .match(where)
      .project(project)
      .end();
      promtype 0：主题活动（themeactivity） 1:直减; 2:折扣 3:限时抢购 4:满减(组合价格) 5:秒杀; 6:品牌团;7:量贩团 8砍价
*/
var getPic = (goods) => {
  if (goods.picpath.length > 1) {
    return goods.picpath[1].fileID;
  } else if (goods.picpath.length === 1) {
    return goods.picpath[0].fileID;
  } else {
    return null;
  }
}
/**
 * goods:商品数据
 * models_mainkey_idx:有多种型号的商品其每种型号对应的图片所在位置KEY 的 index
 */
var getCorver = (goods, model_id, models_mainkey, models_mainkey_idx) => {
  if (!model_id) {
    return getPic(goods);
  } else if (goods.modelitems[model_id].picpath) {
    /*
    return goods.modelitems[model_id].picpath; 报错误：
    "[FailedOperation] multiple write errors: [{write errors: [{Cannot create field 'fileID' in element {cover: "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/shop/000000/ounQF5gNI1fojHjR6JnyBekJpowQ/S0000goods/GOO15817314158268504acf9958192a1/f179568539e955a..."}}]}, {<nil>}]; "
    加上.fileID即可
    */
    return goods.modelitems[model_id].picpath.fileID;
  }
  var submodels = goods.models && goods.models[models_mainkey] ? goods.models[models_mainkey].submodels : null;
  if (!submodels) {
    throw new Error(models_mainkey + "子模型空异常")
  }
  var model_id_arr = model_id.split(","),
    subkey = null,
    picpath = null;

  if (model_id_arr.length <= models_mainkey_idx) {
    throw new Error("商品信息有变更,为了保障您的权益请重新进入商品详情页");
  }
  subkey = model_id_arr[models_mainkey_idx];
  picpath = submodels[subkey].picpath;
  return picpath && picpath.fileID || getPic(goods);
}

var getGoodsInfo2 = async (goodsInfo) => {
  if (!goodsInfo || !goodsInfo.length || goodsInfo.length == 0) {
    return {
      data: null,
      errMsg: "商品信息为空"
    };
    return;
  }
  var order_pay = 0,
    total_pay = 0,
    outArr = [],
    outShop = {},
    errMsg = null;
  //modelitems:1,
  //presales: 1,
  //deptid: 1,
  //subid: 1,
  var field = {
    _id: 1,
    shopid: 1,
    shopname: 1,
    goodsno: 1,
    goodsname: 1,
    goods_type: 1,
    stockflag: 1,
    price: 1,
    quantity: 1,
    picpath: 1,
    models_mainkey: 1, //有多种型号的商品其每种型号对应的图片所在位置KEY
    selected_benefit: 1
  };
  console.log("getGoodsInfo", goodsInfo);
  var tasks = goodsInfo.map(v => {
    var where = {},
      project = Object.assign({}, field);
    where.goodsno = v.goodsno;
    //model_id:以逗号组合的型号的KEY
    if (v.model_id) {
      //输出转换：只取对应v.model_id，其他的不用，提供网络效率
      var mp = "$modelitems." + v.model_id + ".price",
        ms = "$modelitems." + v.model_id + ".stock",
        sn = "$modelitems." + v.model_id + ".subname" //蓝色|M160-165|尼纶纤维
      pic = "$modelitems." + v.model_id + ".picpath.fileID"
      submodels = null;
      if (v.models_mainkey) {
        //mainflag对应的model的key即models_mainkey
        submodels = "$models." + v.models_mainkey + ".submodels";
        project.modelitem = [mp, ms, sn, pic, submodels];
      } else {
        project.modelitem = [mp, ms, sn, pic];
      }
    }
    return db.collection('xlh_goods')
      .aggregate()
      .match(where)
      .project(project)
      .end();
  });

  var res = (await Promise.all(tasks));

  for (var i in res) {
    var goods = res[i] && res[i].list && res[i].list.length > 0 ? res[i].list[0] : null;
    if (!goods) {
      return {
        errMsg: goodsInfo[i].model_val || goodsInfo[i].goodsname + "信息不存在"
      };
    } else if (goods.goodsno != goodsInfo[i].goodsno) {
      return {
        errMsg: goodsInfo[i].model_val || goodsInfo[i].goodsname + "查询商品信息有误"
      };
    }
    if (goods.stockflag === '1' && (!goods.quantity || !goods.quantity.stockqty || goods.quantity.stockqty <= 0)) {
      return {
        errMsg: goodsInfo[i].model_val || goodsInfo[i].goodsname + "商品库存不足"
      };
    }

    var modelitem = goods.modelitem && goods.modelitem.length > 0 ? goods.modelitem : null;
    var price = modelitem ? parseFloat(modelitem[0]) : goods.price.saleprice; //单个商品价格
    var saleprice = price * goodsInfo[i].num; //单个商品价格*购买数量
    order_pay += saleprice; //整个订单金额
    //order_total_pay 订单中所有商品价格和sum(saleprice)
    const outGoods = {
      goods_id: goods._id,
      shopid: goods.shopid,
      shopname: goods.shopname,
      goods_type: goods.goods_type,
      presales: goods.presales,
      //modelitem ? modelitem[3] : goods.picpath,goodsInfo[i].cover,
      cover: getCorver(goods, goodsInfo[i].model_id, goodsInfo[i].models_mainkey_idx),
      goodsname: goods.goodsname,
      goodsno: goods.goodsno,
      model_name: modelitem ? modelitem[2] : null, //蓝色|M160-165|尼纶纤维
      model_value: goodsInfo[i].model_value, //=model_name(蓝色|M160-165|尼纶纤维)
      model_id: goodsInfo[i].model_id,
      models_mainkey: goodsInfo[i].models_mainkey,
      models_mainkey_idx: goodsInfo[i].models_mainkey_idx,
      stockflag: goods.stockflag,
      stock: modelitem ? Number(modelitem[1]) : (goods.quantity && goods.quantity.stockqty || 0),
      num: goodsInfo[i].num,
      price: price,
      saleprice: saleprice,
      order_total_pay: order_pay
    };
    /**
     * outShop:{
     *  shopid1:[goods,goods],
     *  shopid2:[goods2,goods2],
     *  shopid3:[goods3,goods3]
     * }
     */
    if (outShop[outGoods.shopid]) {
      total_pay += saleprice; //单个商品价格*购买数量
      //某一个店铺订单中所有商品的金额（一个订单可能是多个商铺在一次支付的，即一个订单编号包含多个店铺的商品）
      outGoods.total_pay = total_pay;
      outShop[outGoods.shopid].push(outGoods);
    } else {
      outGoods.total_pay = saleprice;
      total_pay = 0;
      total_pay += saleprice;
      outShop[outGoods.shopid] = [];
      outShop[outGoods.shopid].push(outGoods);
    }
    outArr.push(outGoods);
  };
  return {
    data: outArr,
    data2: outShop
  };
};

/**
 * 
 * @param {Array} goodsinfo [
 *{"goodsno":"S0000201909120143519898f7c62b70944","goodsname":"V型派男士外套","model_id":"3252,450c,2cea","model_value":"红色|M160-165|尼纶纤维","num":7,"price":22},     {"goodsno":"S0000201909120143519898f7c62b70944","goodsname":"V型派男士外套","model_id":"e52d,5f34,2cea","model_value":"灰色|XXL175-180|尼纶纤维","num":1,"price":75},{"goodsno":"S0000201909120046316726a87a59e272b","goodsname":"客气就好","model_id":"2581,1c06","model_value":"MM一族|黄色","num":1,"price":280}] 
 * @description addOrder.js call
 */
var getGoodsInfo = async (goodsInfo) => {

  if (!goodsInfo || goodsInfo.length === 0) {
    return {
      errMsg: "商品列表空异常"
    }
  }
  var project = {
    _id: 1,
    shopid: 1,
    shopname: 1,
    goodsno: 1,
    goodsname: 1,
    goods_type: 1,
    stockflag: 1,
    price: 1,
    quantity: 1,
    picpath: 1,
    models_mainkey_idx: 1,
    models_mainkey: 1, //有多种型号的商品其每种型号对应的图片所在位置KEY
    selected_benefit: 1 /**客户选择的权益，一般多中优惠活动时候用的 */
  }

  goodsInfo.sort((a, b) => a.goodsno <= b.goodsno ? -1 : 1);

  const len = goodsInfo.length;

  var models = [],
    order_pay = 0,
    total_pay = 0,
    outArr = [],
    outShop = {},
    errMsg = null;

  for (var i = 0; i < len; i++) {

    var oGoods = goodsInfo[i];
    if (!oGoods.goodsno) {
      return {
        errMsg: "商品ID空异常"
      }
    }

    //var model_id = null;
    var _project = Object.assign({}, project);

    if (i < len - 1 && oGoods.goodsno === goodsInfo[i + 1].goodsno) {
      //同一个商品不同型号
      //_project.modelitems = 1;
      models.push({
        goodsno: oGoods.goodsno,
        model_id: oGoods.model_id || null,
        model_value: oGoods.model_value || null,
        num: oGoods.num,
        price: oGoods.price
      });
      continue;
    } else {
      //model_id = oGoods.model_id;
      models.push({
        goodsno: oGoods.goodsno,
        model_id: oGoods.model_id || null,
        model_value: oGoods.model_value || null,
        num: oGoods.num,
        price: oGoods.price
      });
    }


    /*
    return {
      DEBUG:DEBUG,
      transaction:transaction,
      goods:oGoods,
      errMsg:"商品ID空异常"
    }*/
    var bErr = false,
      stockInfo = null;

    for (var j = 0; j < models.length; j++) {
      /**models 内是同一个goods_id不同型号的的商品 */
      var modelitem = models[j];

      if (j == 0) {
        if (oGoods.model_id) {
          models.forEach(v => {
            _project["modelitems." + v.model_id + ".price"] = 1,
              _project["modelitems." + v.model_id + ".stock"] = 1,
              _project["modelitems." + v.model_id + ".subname"] = 1,
              _project["modelitems." + v.model_id + ".buycount"] = 1;
              _project["modelitems." + v.model_id + ".picpath.fileID"] = 1; //add by xiaojm at 20200308 21:36
          })
          if (oGoods.models_mainkey) {
            _project["models." + oGoods.models_mainkey + ".submodels"] = 1;
          }
          //project.modelitem = [mp, ms, sn, bc];
        }

        stockInfo = await db.collection('xlh_goodsstock')
          .doc(modelitem.goodsno)
          .field(_project)
          .get();
        stockInfo = stockInfo.data;
        if (!stockInfo) {
          return {
            errMsg: oGoods.model_value + "库存信息不存在"
          }
        }
      } // end j==0

      if (stockInfo.goodsno != modelitem.goodsno) {
        return {
          errMsg: modelitem.model_value + "商品信息有误"
        };
      }

      if (stockInfo.stockflag == '1') {
        if (!modelitem.model_id) {
          if (stockInfo.quantity.stockqty <= 0 ||
            stockInfo.quantity.stockqty - modelitem.num < 0) {
            return {
              errMsg: stockInfo.goodsname + `商品库存不足[${stockInfo.quantity?stockInfo.quantity.stockqty:0}][${modelitem.num}]`
            }
          }
        } else {
          var temp = stockInfo.modelitems;
          if (!temp) {
            return {
              errMsg: stockInfo.goodsname + `的[${modelitem.model_value}]型号信息空异常`
            }
          }
          temp = temp[modelitem.model_id];
          if (!temp) {
            return {
              errMsg: '未找到' + (stockInfo.goodsname) + `的[${modelitem.model_value}]型号信息`
            }
          } else if (temp.stock <= 0 || temp.stock - modelitem.num < 0) {
            return {
              errMsg: stockInfo.goodsname + `的[${modelitem.model_value}]型号库存不足[${temp.stock}][${modelitem.num}]`
            }
          }
        }
      }

      var itemStock = modelitem.model_id && stockInfo.modelitems ? stockInfo.modelitems[modelitem.model_id] : null;

      var price = itemStock ? itemStock.price : stockInfo.price.saleprice; //单个商品价格

      var saleprice = price * modelitem.num; //单个商品价格*购买数量
      order_pay += saleprice; //整个订单金额
      //order_total_pay 订单中所有商品价格和sum(saleprice)
      const outGoods = {
        goods_id: stockInfo._id,
        shopid: stockInfo.shopid,
        shopname: stockInfo.shopname,
        goods_type: stockInfo.goods_type,
        presales: stockInfo.presales,
        //modelitem ? modelitem[3] : goods.picpath,goodsInfo[i].cover,
        cover: getCorver(stockInfo, modelitem.model_id, stockInfo.models_mainkey, stockInfo.models_mainkey_idx),
        goodsname: stockInfo.goodsname,
        goodsno: stockInfo.goodsno,
        model_name: itemStock ? itemStock.subname : null, //蓝色|M160-165|尼纶纤维
        model_value: modelitem.model_value||'', //=model_name(蓝色|M160-165|尼纶纤维)
        model_id: modelitem.model_id,
        models_mainkey: stockInfo.models_mainkey,
        models_mainkey_idx: stockInfo.models_mainkey_idx,
        stockflag: stockInfo.stockflag,
        stock: itemStock ? itemStock.stock : (stockInfo.quantity.stockqty || 0),
        num: modelitem.num,
        price: price,
        saleprice: saleprice,
        order_total_pay: order_pay
      };
      /**
       * outShop:{
       *  shopid1:[goods,goods],
       *  shopid2:[goods2,goods2],
       *  shopid3:[goods3,goods3]
       * }
       */
      var shopGoodsArr = outShop[outGoods.shopid]
      if (shopGoodsArr) {
        outGoods.total_pay = shopGoodsArr[shopGoodsArr.length - 1].total_pay + saleprice; //单个商品价格*购买数量
        shopGoodsArr.push(outGoods);
        //某一个店铺订单中所有商品的金额（一个订单可能是多个商铺在一次支付的，即一个订单编号包含多个店铺的商品）
        //outGoods.total_pay = total_pay;
      } else {
        outGoods.total_pay = saleprice;
        outShop[outGoods.shopid] = [];
        outShop[outGoods.shopid].push(outGoods);
      }
      outArr.push(outGoods);
    } //END models LOOP
    models = [];
  }
  return {
    data: outArr,
    data2: outShop
  };
}
module.exports = {
  //getGoods: getGoods,
  getGoodsInfo: getGoodsInfo
};