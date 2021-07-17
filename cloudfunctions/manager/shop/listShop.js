const query = require('../comm/query.js');
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
/**
 * {
 * }
 * 
 */
module.exports = async(event, wxContext) => {
  const {
    transtype,
    actionname,
    shopname,
    username,
    userid,
    status
  } = event;

  const oper_userid = wxContext.OPENID;

  var userInfo = await getUserInfo(oper_userid);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var ctrlParams = {
    openid: oper_userid,
    page_size: 10,
    orderby_field: ["status", "updatetime"],
    orderby_type: ["desc", "desc"],
    batch_time: -1
  }

  var whereCondi = {

  };
  status && status != "" ? (whereCondi.status = status) : "";
  userid && userid != "" ? (whereCondi.userid = userid) : "";
  if (shopname) {
    whereCondi.shopname = {
      $regex: '.*' + shopname,
      $options: 'i'
    }
  }
  if (username) {
    whereCondi.username = {
      $regex: '.*' + username,
      $options: 'i'
    }
  }

  var selectField = {
    userid: 1,
    shopid: 1,
    shopname: 1,
    imginfo: 1,
    shoppic: 1,
    phone: 1,
    contact: 1,
    address: 1,
    latitude: 1,
    longitude: 1,
    opentime: 1,
    closetime: 1,
    basedir:1,
    summary: 1,
    status:1,
    updatetime: 1,
  };
  /**
   *  basic:1,概况
  facilities: 1,环境设施
  services: 1,特色服务
  ensure: 1,保障服务
  consumeway: 1,消费方式
  peripheral: 1,周边交通及商圈
  parameter: 1,其他参数，包括自定义
   * 
   */
  return await query('xlh_shopinfo', whereCondi, ctrlParams, selectField);

}