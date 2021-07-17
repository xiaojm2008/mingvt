const query = require('../comm/query');

var getCategory = async (event, wxContext) => {
  var ctrlParams = {
    page_size: 100,
    orderby_field: 'code',
    orderby_type: 'asc',
    batch_time: -1
  }
  var whereCondi = {
    status:'1'
  };
  return await query('xlh_category', whereCondi, ctrlParams);
}

module.exports = getCategory;