var utils = require("../utils/rpc.js");

const SERV_MANAGER = "trader";
const TRANSTYPE = "coupon";

const SERV_GET_COUPONLIST = "getCouponList"; //获取购物券（非指定用户）
const SERV_TAKE_COUPON = "takeCoupon"; //领取购物券
const SERV_GET_MY_COUPONLIST = "getMyCouponList";//获取我的购物券

var getCouponList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_COUPONLIST;
  return utils.requestEx(SERV_MANAGER, params);
};
var takeCoupon = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_TAKE_COUPON;
  return utils.requestEx(SERV_MANAGER, params);
};
var getMyCouponList = (params) => {
  params.transtype = TRANSTYPE;
  params.actionname = SERV_GET_MY_COUPONLIST;
  return utils.requestEx(SERV_MANAGER, params);
};

module.exports = {
  getCouponList: getCouponList,
  takeCoupon: takeCoupon,
  getMyCouponList, getMyCouponList
}