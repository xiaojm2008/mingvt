const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});
const DEBUG = false;
const PAY_FAIL = "0";
const PAY_PEN = "2"; //待支付
/**
 * commitflag:
 * true/1 "减少库存,增加购买量处理" 
 * false/0:'增加库存,减少购买量处理';
 * stockflag：
 * 1：商品需要库存控制处理
 */
var _handleStock21 = async (oGoods, commitflag, stockflag, transaction) => {
  var res = null;
  const cmd = db.command;
  if (oGoods.model_id) {
    var data = {
      modelitems: {},
      quantity: {}
    };
    data.modelitems[oGoods.model_id] = {};
    stockflag == '1' && (data.modelitems[oGoods.model_id].stock = cmd.inc(commitflag ? 0 - oGoods.num : oGoods.num));
    data.modelitems[oGoods.model_id].buycount = cmd.inc(commitflag ? oGoods.num : 0 - oGoods.num);
    data.quantity.buycount = cmd.inc(commitflag ? oGoods.num : 0 - oGoods.num);
    res = await transaction.collection("xlh_goods").doc(oGoods.goods_id).update({
      data: data
    });
  } else {
    var data = {
      quantity: {}
    };
    data.quantity.buycount = cmd.inc(commitflag ? oGoods.num : 0 - oGoods.num);
    stockflag == '1' && (data.quantity.stockqty = cmd.inc(commitflag ? 0 - oGoods.num : oGoods.num));
    res = await transaction.collection("xlh_goods").doc(oGoods.goods_id).update({
      data: data
    });
  }
  return res;
}

/**
 * commitflag:
 * true/1 "减少库存,增加购买量处理" 
 * false/0:'增加库存,减少购买量处理';
 * stockflag：
 * 1：商品需要库存控制处理
 */
var _handleStock = async (stockInfo, commitflag, transaction) => {
  var res = null;
  const cmd = db.command;
  if (oGoods.model_id) {
    var data = {
      modelitems: {},
      quantity: {}
    };
    data.modelitems[oGoods.model_id] = {};
    stockflag == '1' && (data.modelitems[oGoods.model_id].stock = cmd.inc(commitflag ? 0 - oGoods.num : oGoods.num));
    data.modelitems[oGoods.model_id].buycount = cmd.inc(commitflag ? oGoods.num : 0 - oGoods.num);
    data.quantity.buycount = cmd.inc(commitflag ? oGoods.num : 0 - oGoods.num);
    res = await transaction.collection("xlh_goods").doc(oGoods.goods_id).update({
      data: data
    });
  } else {
    var data = {
      quantity: {}
    };
    data.quantity.buycount = cmd.inc(commitflag ? oGoods.num : 0 - oGoods.num);
    stockflag == '1' && (data.quantity.stockqty = cmd.inc(commitflag ? 0 - oGoods.num : oGoods.num));
    res = await transaction.collection("xlh_goods").doc(oGoods.goods_id).update({
      data: data
    });
  }
  return res;
}
/**
 * 
 * @param {*} orderInfo  订单信息或者支付信息
 * @param {*} commitflag false/0：支付失败库存回滚处理，true/1：支付前减库存处理。 
 */
var handleStock = async (orderInfo, commitflag) => {

  //SEC=SECUR,不需要检查商品库存
  if(orderInfo.order_id && orderInfo.order_id.substr(0, 3) == 'SEC'){
    //这种订单是不需要处理库存
    return;
  }

  var project = {
    goodsno: 1,
    goodsname: 1,
    stockflag: 1,
    quantity: 1
  }
  /*
  return {
    DEBUG:DEBUG,
    orderInfo:orderInfo,
    errMsg:"商品ID空异常"
  }*/
  //排序

  try {
    const transaction = DEBUG ? db: await db.startTransaction();

    //回滚处理
    if(!commitflag){

      if(!orderInfo.pay_id){
        return{
          errMsg:"库存回滚参数错误！"
        }
      }
      var payment = await transaction.collection('xlh_paymentlog').doc(orderInfo.pay_id).get();
      payment = payment.data;
      if(!payment){
        return{
          errMsg:"支付不存在！"
        }
      }
      if(payment.stock_rollback==1){

        await transaction.rollback();

        return {
          errMsg:"库存回滚重复处理！"
        }
      }
      if (payment.status != PAY_FAIL && payment.status != PAY_PEN) {
        await transaction.rollback();
        return {
          errMsg: `支付非失败状态:${payment.status}`
        }
      }
      orderInfo = payment;
    }

    orderInfo.goods_info.sort((a,b)=>a.goods_id<=b.goods_id?-1:1);;
    const len = orderInfo.goods_info.length;
    var commitStock=[],rollbackStock=[],goodsNum=0;
    var models = [];
  
    for (var i=0;i <len;i++) {

      var oGoods = orderInfo.goods_info[i];
      if(!oGoods.goods_id){
        DEBUG ? null : await transaction.rollback();
        return {
          errMsg:"商品ID空异常"
        }
      }

      //var model_id = null;
      var _project = Object.assign({}, project);

      if(i<len-1 && oGoods.goods_id === orderInfo.goods_info[i+1].goods_id){
        //同一个商品不同型号
        //_project.modelitems = 1;
        models.push( {goods_id:oGoods.goods_id,model_id:oGoods.model_id||null,goodsname:oGoods.goodsname,num:oGoods.num});
        continue;
      } else {
        //model_id = oGoods.model_id;
        models.push( {goods_id:oGoods.goods_id,model_id:oGoods.model_id||null,goodsname:oGoods.goodsname,num:oGoods.num});
        /*
        if (model_id) {
          //输出转换：只取对应v.model_id，其他的不用，提供网络效率
          _project["modelitems." + model_id + ".price"] = true,
            _project["modelitems." + model_id + ".stock"] = true,
            _project["modelitems." + model_id + ".subname"] = true,
            _project["modelitems." + model_id + ".buycount"] = true;
          //project.modelitem = [mp, ms, sn, bc];
        }*/
      }

      /*
      return {
        DEBUG:DEBUG,
        transaction:transaction,
        goods:oGoods,
        errMsg:"商品ID空异常"
      }*/
      var bErr=false,stockInfo = null,willUpdStock=null;

      for(var j=0;j<models.length;j++){
        /**models 内是同一个goods_id不同型号的的商品 */
        var modelitem = models[j];

        if(j==0){
          //多型号才需要加载型号信息
          /* 启用事务，不能加field,所以没有必要指定输出field
          if(model_id){
            if(m_len===1){
              //输出转换：只取对应v.model_id，其他的不用，提供网络效率
              _project["modelitems." + model_id + ".price"] = true,
                _project["modelitems." + model_id + ".stock"] = true,
                _project["modelitems." + model_id + ".subname"] = true,
                _project["modelitems." + model_id + ".buycount"] = true;
              //project.modelitem = [mp, ms, sn, bc];
            } else {
              _project.modelitems = 1;
            }
          }*/
          /*
          stockInfo = await transaction.collection('xlh_goods')
          .doc("d68532785e457ba90f3e6f2017dd165d")
          //.field(_project) //用transaction 就不能加field输出指定字段
          .get();*/

          stockInfo = await transaction.collection('xlh_goodsstock')
            .doc(modelitem.goods_id)
            //.field(_project) //用transaction 就不能加field输出指定字段
            .get();
          stockInfo = stockInfo.data;
          if(!stockInfo){
            await transaction.rollback();
            return {
              errMsg:"库存信息不存在"
            }
          }
        }
          //DEBUG ? null : await transaction.rollback();
        /*return {
            DEBUG:DEBUG,
            transaction:transaction,
            goods:goods,
            errMsg:"商品ID空异常"
          }*/

        var stock = 0,
          buycount = 0,
          num = modelitem.num, //购买数量
          model_id = modelitem.model_id;
          //合计数量
          goodsNum+=num;

        //商品必须进行库存控制
        if (commitflag) {
           //多型号产品的减少库存处理
          if (model_id) {
            stock = stockInfo.modelitems[model_id].stock;
            buycount = stockInfo.modelitems[model_id].buycount;            
            goodsname = stockInfo.modelitems[model_id].subname;

            if(stockInfo.stockflag == '1'){
              //需要检查库存
              stockInfo.modelitems[model_id].stock = stockInfo.modelitems[model_id].stock-num;     
              if (stockInfo.modelitems[model_id].stock < 0) {
                bErr = true;
              }
            }  
            stockInfo.modelitems[model_id].buycount =  (stockInfo.modelitems[model_id].buycount||0)+num; //该类型商品历史购买量
            //stockInfo.quantity.buycount = (stockInfo.quantity.buycount||0)+num; //所有类型的商品的汇总
            stockInfo.modelitems[model_id].num = num; //最近一笔销售量（只是方便查询）

          } else {
            //单型号产品的减少库存处理
            if(!stockInfo.quantity){
              stockInfo.quantity = {};
              stockInfo.quantity.stockqty = 0;
              stockInfo.quantity.buycount = 0;
              stockInfo.quantity.stockqty = 0;
            }
            stock = stockInfo.quantity.stockqty;
            buycount = stockInfo.quantity.buycount;
            goodsname = modelitem.goodsname;
            if(stockInfo.stockflag == '1'){
               //需要检查库存
              stockInfo.quantity.stockqty = stockInfo.quantity.stockqty-num;
              if (stockInfo.quantity.stockqty < 0) {
                bErr = true;
              }
            }
            stockInfo.quantity.buycount = (stockInfo.quantity.buycount||0)+num; //商品历史购买量（所有类型的商品的汇总）
            stockInfo.quantity.num = num; //最近一笔销售量（只是方便查询）
          }
          if(bErr){
            DEBUG ? null : await transaction.rollback();
            //库存不够
            return {
              goods_id: modelitem.goods_id,
              errMsg: `谢谢您的关顾(${num})！您购买商品[${goodsname.length > 20 ? goodsname.substr(0, 20) : goodsname}]库存[${stock}]不够！`,
              stock: stock,
              buycount: buycount,
              num: num
            }
          }
        } else {
          //多型号产品的回滚处理
          if (model_id) {
            stock = stockInfo.modelitems[model_id].stock;
            buycount = stockInfo.modelitems[model_id].buycount;
            goodsname = stockInfo.modelitems[model_id].subname;

            if(stockInfo.stockflag == '1'){
              stockInfo.modelitems[model_id].stock = (stockInfo.modelitems[model_id].stock||0)+num;  
            }

            stockInfo.modelitems[model_id].buycount =  (stockInfo.modelitems[model_id].buycount||0)-num; //该类型商品历史购买量
            //stockInfo.quantity.buycount = (stockInfo.quantity.buycount||0)-num; //所有类型的商品的汇总

            stockInfo.modelitems[model_id].num = num; //最近一笔销售量（只是方便查询）

            if (stockInfo.modelitems[model_id].buycount < 0) {
              bErr = true;
            }
          } else {
            //单一型号产品回滚
            if(!stockInfo.quantity){
              stockInfo.quantity = {};
              stockInfo.quantity.stockqty = 0;
              stockInfo.quantity.buycount = 0;
              stockInfo.quantity.stockqty = 0;
            }
            stock = stockInfo.quantity.stockqty;
            buycount = stockInfo.quantity.buycount;
            goodsname = modelitem.goodsname;

            if(stockInfo.stockflag == '1'){
              stockInfo.quantity.stockqty = (stockInfo.quantity.stockqty||0)+num;
            }

            stockInfo.quantity.buycount = (stockInfo.quantity.buycount||0)-num; //商品历史购买量（所有类型的商品的汇总）
            stockInfo.quantity.num = num; //最近一笔销售量（只是方便查询）

            if (stockInfo.quantity.buycount < 0) {
              bErr = true;
            } 
          } //end model_id

          if(bErr){
            DEBUG ? null : await transaction.rollback();
            //购买数量小于0，释放库存有问题
            return {
              goods_id: modelitem.goods_id,
              errMsg: `释放库存异常(${num})！商品[${goodsname.length > 20 ? goodsname.substr(0, 20) : goodsname}]销量[${buycount}]释放错误！`,
              stock: stock,
              buycount: buycount,
              num: num
            }
          } 
           
        } //if commitflag(0:回滚，1提交) 

        if (model_id){
          if(!willUpdStock){
            willUpdStock = {modelitems:{}};
          }
          willUpdStock.modelitems[model_id] = {
            stock:stockInfo.modelitems[model_id].stock,
            buycount:stockInfo.modelitems[model_id].buycount,          
            num:stockInfo.modelitems[model_id].num
          }
          //总销量（所有型号合计）这样做事务可能有冲突！
          /*willUpdStock.quantity = {
            buycount: stockInfo.quantity.buycount
          }*/
        } else {
          if(!willUpdStock){
            willUpdStock = {quantity:{}};
          } 
          willUpdStock.quantity = {
            stockqty:stockInfo.quantity.stockqty,
            buycount: stockInfo.quantity.buycount,
            num:stockInfo.quantity.num
          }          
        }
      } //end models loop

      var stockRes = null;
      if(willUpdStock){
        stockRes = await transaction.collection("xlh_goodsstock").doc(oGoods.goods_id).update({
          data:willUpdStock
        })
      }

      models=[]; //清理后开始下一个goods_id
      if(commitflag){
        commitStock.push({goods_id:oGoods.goods_id,stockInfo:willUpdStock});       
      } else {
        rollbackStock.push({goods_id:oGoods.goods_id,stockInfo:willUpdStock});
      }
      console.log(`goods_id:${oGoods.goods_id}`,stockRes, models,willUpdStock);

    } // end orderInfo.goods_info loop

    /**
     * 20200216 xiaojm apppend 代码是记录库存变动，还有回滚时候的标志.
     * 如果是单个商户支付，那么就能用orderInfo.primary_id(即orderInfo._id)
     */
    var rollbacklog = { 
      settime:new Date(),
      mergeflag:orderInfo.mergeflag
    };

    const log_id = orderInfo.mergeflag?orderInfo.order_id:orderInfo.primary_id;

    if(commitflag){
      rollbacklog.commit_stock = commitStock;
      rollbacklog.commit_primary_id = orderInfo.primary_id;
      rollbacklog.commit_order_id = orderInfo.order_id;
      rollbacklog.commit_goods_num = goodsNum;    
      await transaction.collection("xlh_rollbackstocklog").doc(log_id).set({
        data:rollbacklog
      })
    } else {
      rollbacklog.rollback_stock = rollbackStock;
      rollbacklog.rollback_primary_id = orderInfo.primary_id;
      rollbacklog.rollback_order_id = orderInfo.order_id;
      rollbacklog.rollback_goods_num = goodsNum;    
      //设置回滚成功标志位
      await transaction.collection('xlh_paymentlog').doc(orderInfo.pay_id).update({
        data: {
          stock_rollback:1
        }
      });

      await transaction.collection("xlh_rollbackstocklog").doc(log_id).update({
        data:rollbacklog
      })
    }
   
    DEBUG ? null : await transaction.commit();

    return {
      success:1,
      errMsg:commitflag?"处理成功":"库存已回滚"
    };
  } catch (err) {
    //DEBUG ? null : await transaction.rollback();
    return {
      errMsg:err.errMsg||err.message
    };
  }
}

module.exports = {
  handleStock: handleStock
}