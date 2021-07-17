const query = require('../comm/query.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    invitation_code
  } = event;
  
  var whereCondi = null;
  if (invitation_code) {
    whereCondi = {
      invitation_code: invitation_code
    };
  } else {
    whereCondi = {
      p_openid: wxContext.OPENID
    };
  }

  var ctrlParams = {
    page_size: event.page_size,
    orderby_field: event.orderby_field,
    orderby_type: event.orderby_type,
    batch_time: event.batch_time
  }
  var selectField = {
    openid: true,
    level: true,
    username: true,
    nickname: true,
    phone: true,
    avatarurl: true,
    p_avatarurl: true,
    p_openid: true,
    p_username: true,
    p_nickname: true,
    p_phone: true,
    p_level: true,
    invitation_code: true,
    settime: true,
    updatetime: true
  };
  return await query('xlh_goods', whereCondi, ctrlParams, selectField);
}