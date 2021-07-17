const baseInfo = require("../comm/fieldFormat.js").goods.baseInfo;
const imgInfo = require("../comm/fieldFormat.js").goods.imgInfo;
const modelItem = require("../comm/fieldFormat.js").goods.modelItem;
const model = require("../comm/fieldFormat.js").goods.model;
const V = require("../comm/validate.js").V;

var fieldCheck = (goodsInfo) => {
  var err = null,
    type = null;
  err = V(baseInfo, goodsInfo, 'baseinfo', goodsInfo, goodsInfo,null);
  if (err && err.errMsg) {
    return err;
  }
  err = V(imgInfo, goodsInfo.imginfo, 'imginfo', goodsInfo, goodsInfo.imginfo,null);
  if (err && err.errMsg) {
    return err;
  }
  err = V(modelItem, goodsInfo.modelitems, 'modelitems', goodsInfo,goodsInfo.modelitems,null);
  if (err && err.errMsg) {
    return err;
  }

  err = V(model, goodsInfo.models, 'models', goodsInfo,goodsInfo.models,null);
  if (err && err.errMsg) {
    return err;
  }
}

module.exports = fieldCheck;