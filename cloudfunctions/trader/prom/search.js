const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async(event, wxContext) => {
  const {
    batch_time,
    page_size,
    shopid,
    text
  } = event;
  if (!text || !text.trim()) {
    return {
      data: []
    }
  }
  var ctrlParams = {
    page_size: page_size,
    care_total: false,//不考虑查询totalNum（总记录数，增加性能）    
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: batch_time
  }
  const cmd = db.command;
  /*
  _.or([
  {
    progress: _.gt(80)
  },
  {
    done: true
  }
])
 */
  /*
    whereCondi.promname = {
      $regex: '.*' + text,
      $options: 'i'
    }
    whereCondi.promfullname = {
      $regex: '.*' + text,
      $options: 'i'
    }*/
  var whereCondi =
    cmd.or([{
        promname: db.RegExp({
          regexp: '.*' + text,
          options: 'i'
        })
      },
      {
        promfullname: db.RegExp({
          regexp: '.*' + text,
          options: 'i'
        })
      },
      {
        goodsname: db.RegExp({
          regexp: '.*' + text,
          options: 'i'
        })
      }
    ]);

  shopid && shopid.trim() != "" ? whereCondi.and([{
    shopid: shopid
  }]) : "";

  var outField = {
    promtype: 1,
    promname: 1,
    prompic: 1,
    goodsname: 1
  };
  return await query('xlh_goodsprom', whereCondi, ctrlParams, outField);
}