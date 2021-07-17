const query = require('./query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
var getState = async (event, wxContext) => {
  var ctrlParams = {
    page_size: 100,
    orderby_field: 'code',
    orderby_type: 'asc',
    batch_time: -1
  }
  var field={
    name:true,
    code:true
  }
  const cmd = db.command;
  return await query('sys_state', { code: cmd.neq(" ")}, ctrlParams, field);
}

module.exports = getState;