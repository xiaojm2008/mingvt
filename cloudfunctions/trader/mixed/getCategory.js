const query = require('../comm/query.js');

module.exports = async (event, wxContext) => {
  const {
    actionname,
    transtype,
    catetype
  } = event;
  
  var ctrlParams = {
    openid: wxContext.openid,
    page_size: 100,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: -1
  }

  var whereCondi = {
  };
  event.status && event.status != "" ? (whereCondi.status = event.status) : "";
  catetype && catetype != "" ? (whereCondi.catetype = catetype) : "";
  var selectField = {
    _id: true,
    code: true,
    name: true,
    img: true,
    items: true,
    url: true,
    seq: true
  };
  return await query('xlh_category', whereCondi, ctrlParams, selectField);
}
