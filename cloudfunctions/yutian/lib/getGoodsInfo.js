const cloud = require('wx-server-sdk')
//const getModelsValue = require('./getModelsValue.js')
cloud.init();
var getGoodsInfo = async(goodsInfo) => new Promise((resolve, reject) => {
  /*
  goodsInfo:[{
    goodsno:goodsno,
    model_id:model_id,
    model_value:model_value,
    num:num,
    price:price
  },,]
  */
  if (!goodsInfo || !goodsInfo.length || goodsInfo.length == 0) {
    reject({
      message: "商品信息为空"
    });
    return;
  }
  var original_pay = 0;
  const outArr = [];
  const db = cloud.database();
  const cmd = db.command;
  var selectField = {
    shopid: true,
    shopname: true,
    goods_type: true,
    vgno: true,
    deptid: true,
    goodsno: true,
    goodsname: true,
    stockflag: true,
    price: true,
    quantity: true,
    modelitems: true,
    models: true,
    selected_benefit: true,
    picpath: true
  };
  try {

    console.log("getGoodsInfo", goodsInfo);
    db.collection('xlh_goods').where({
      goodsno: cmd.in(goodsInfo.map((item, idx, arr) => {
        return item.goodsno;
      }))
    }).field(selectField).get().then(res => {
      arr = res && res.data && res.data.length > 0 ? res.data : null;
      if (!arr) {
        reject({
          message: "商品信息不存在"
        });
        return;
      }
      for (var i = 0; i < goodsInfo.length; i++) {
        //var price = 0;
        var orderGoods = goodsInfo[i];
        var srcGoods = arr.find((item, idx, obj) => {
          if (!orderGoods.model_id || orderGoods.model_id == "") {
            orderGoods.price = item.price.saleprice;
            orderGoods.saleprice = parseFloat((item.price.saleprice * orderGoods.num).toFixed(2));
            return orderGoods.goodsno == item.goodsno;
          } else if (item.goodsno == orderGoods.goodsno) {
            if (!item.modelitems) {
              console.log(`don't find model_id = ${orderGoods.model_id}, src goods modelitems is null`);
              return false;
            }
            var modelitem = null;
            if (typeof item.modelitems.length == "undefined") {
              modelitem = item.modelitems[orderGoods.model_id];
            } else {
              modelitem = item.modelitems.find((m_item, idx, arr) => {
                return m_item.id == orderGoods.model_id;
              });
            }
            if (!modelitem) {
              console.log(`don't find model_id = ${orderGoods.model_id},when in src goods modelitems is not exists `, item.modelitems);
              return false;
            } else {
              console.log(`find model_id =  ${orderGoods.model_id} is exists`, item.modelitems);
              orderGoods.price = modelitem.price;
              orderGoods.saleprice = parseFloat((modelitem.price * orderGoods.num).toFixed(2));
              orderGoods.subname = modelitem.subname;
              return true;
            }
          } else {
            console.log(`dont't find src goods ${item.goodsno} != order goods ${orderGoods.goodsno}`);
            return false;
          }
        }); //find end

        if (!srcGoods) {
          reject({
            message: `商品[${orderGoods.goodsname}][${orderGoods.goodsno}]信息不存在`
          });
          return;
        }
        original_pay += orderGoods.saleprice;
        var model = orderGoods.model_id && srcGoods.modelitems ? srcGoods.modelitems[orderGoods.model_id] : null;
        var outItem = {
          shopid: srcGoods.shopid,
          shopname: srcGoods.shopname,
          goods_type: srcGoods.goods_type,
          cover: srcGoods.spicpath || srcGoods.mpicpath,
          goodsname: srcGoods.goodsname,
          goodsno: orderGoods.goodsno,
          model_value: orderGoods.model_value,
          model_id: orderGoods.model_id,
          model_subname: orderGoods.subname,
          stockflag: srcGoods.stockflag,
          stock: model ? model.stock : srcGoods.quantity.stockqty,
          num: orderGoods.num,
          price: orderGoods.price, //单个商品价格:goods.price.saleprice
          saleprice: orderGoods.saleprice, //goods.price.saleprice*num
          original_pay: original_pay, //订单中所有商品价格和sum(goods.price.saleprice*num)
        };
        outArr.push(outItem)
      } // goods_list 
      resolve(outArr);
    }).catch(err => {
      console.log("getGoodsInfo", err);
      reject({
        errMsg: err.message
      });
      return;
    });
  } catch (err) {
    reject(err);
  };
});
module.exports = getGoodsInfo;