
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

module.exports = getModelsValue;