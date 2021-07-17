var utils = require("../utils/rpc.js");
const SERV_MANAGER = "trader";
const TRANSTYPE = "goods";

const SERV_GET_GOODSDETAIL = "getGoodsDetail";
const SERV_GET_GOODSLIST = "getGoodsList";
const SERV_GET_TOPRANKLIST = "getTopRankList";
const SERV_CAROUSEL = "getCarousel";
const SERV_SEARCH = "search";
const SERV_GETADDITIONAL="getAdditional";

var getAdditional = (params)=>{
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GETADDITIONAL;

  return utils.requestEx(SERV_MANAGER, params);
}
var getCarousel = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_CAROUSEL;

  return utils.requestEx(SERV_MANAGER, params);
};
var search = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_SEARCH;
  return utils.requestEx(SERV_MANAGER, params);
};
var getGoodsDetail = (params) => {
  if (!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_GOODSDETAIL;
  return utils.requestEx(SERV_MANAGER, params);
};
var getGoodsList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_GOODSLIST;
  return utils.requestEx(SERV_MANAGER, params);
};
var getTopRankList = (params)=>{
  if(!params) params = {};
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_TOPRANKLIST;
  return utils.requestEx(SERV_MANAGER, params);
};
var getModelsValue = (goodsInfo, origmodel_id) => {
  if (!origmodel_id || origmodel_id == "") {
    return "";
  }
  var modelitems = goodsInfo.modelitems,
    models = goodsInfo.models;
  var modelitem = null;
  if (typeof modelitems.length == "undefined") {
    modelitem = modelitems[origmodel_id];
  } else {
    modelitem = modelitems.find((m_item, idx, arr) => {
      return m_item.id == origmodel_id;
    });
  }
  var modelarr = modelitem.model ? modelitem.model.split(",") : [];
  var models_value = modelarr.map((model_id, idx, arr) => {
    //var submodelnames = "";
    var fkeys = Object.keys(models);
    for (var k = 0; k < fkeys.length; k++) {
      var model_v = models[fkeys[k]];
      for (var i = 0; i < model_v.submodelid.length; i++) {
        if (model_v.submodelid[i] == model_id) {
          return model_v.submodelname[i];
        }
      }
    }
  });
  return models_value;
};

module.exports = {
  search: search,
  getAdditional:getAdditional,
  getModelsValue: getModelsValue,
  getCarousel: getCarousel,
  getTopRankList: getTopRankList,
  getGoodsDetail: getGoodsDetail,
  getGoodsList:getGoodsList
}