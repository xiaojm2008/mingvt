const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    batch_time,
    page_size,
    shopid,
    imgtype,
    imgname,
    imgcate
  } = event;

  const oper_userid = wxContext.OPENID;

  var ctrlParams = {
    openid: oper_userid,
    page_size: page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: batch_time
  }

  var whereCondi = {
    shopid: shopid
  };
  //imgtype && imgtype != "" ? (whereCondi.imgtype = imgtype) : "";
  imgcate && imgcate != "" ? (whereCondi.imgcate = imgcate) : "";
  if (imgname) {
    whereCondi.imgname = {
      $regex: '.*' + imgname,
      $options: 'i'
    }
  }

  return await query('xlh_shopimg', whereCondi, ctrlParams, null);
}