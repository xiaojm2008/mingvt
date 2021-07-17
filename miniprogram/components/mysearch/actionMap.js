const goodsServ = require("../../lib/services/goods.js");
const shopServ = require("../../lib/services/shop.js");
const orderServ = require("../../lib/services/order.js");
const promServ = require("../../lib/services/prom.js");
const app = getApp();
module.exports = {
  goods: {
    title:"商品信息",
    condi: null,
    action: goodsServ.search,
    defParams: {
      shopid:app.getShopid()
    },
    temptype: "goodslist",
    transfer: [
      ["title", "商品信息"],
      //["img", "$picpath[0].fileID"],
      ["img", "$cover"],
      ["type", "goods"],
      ["text", "$goodsname"],
      ["ext", "$shopname"],
      ["value", "$goodsno"]
    ],
    page: "/pages/goodsDetail/goodsDetail?goodsno="
  },
  shop: {
    title: "店铺信息",
    condi: null,
    action: shopServ.search,
    defParams: {
      shopid: app.getShopid()
    },
    temptype: "shoplist",
    transfer: [
      ["title", "店铺信息"],
      ["img", "$picpath[0].fileID"],
      ["type", "shop"],
      ["text", "$shopname"],
      ["ext", ""],
      ["value", "$shopid"]
    ],
    page: "/pages/shopDetail/shopDetail?shopid="
  },
  order: {
    title: "我的订单",
    condi: null,
    action: orderServ.search,
    defParams: {
      shopid: app.getShopid()
    },
    temptype: "orderlist",
    transfer: [
      ["title", "我的订单"],
      //["img", "$goods_info[0].cover"],
      ["img", "$cover"],
      ["type", "order"],
      //["text", "$goods_info[0].goodsname"],
      ["text", "$goodsname"],
      ["ext", "$settime"],
      ["value", "$_id"]
    ],
    page: "/pages/orderDetail/orderDetail?_id="
  },
  actioninfo: {
    title: "活动信息",
    condi: null,
    action: "action.searchAction",
    manager:"trader",
    defParams: {
      shopid: app.getShopid()
    },
    temptype: "actionlist",
    transfer: [
      ["title", "活动信息"],
      ["img", "$picpath"],
      ["type", "actioninfo"],
      ["text", "$actionname"],
      ["ext", "$intro"],
      ["value", "$actionid"]
    ],
    page: "/act/actiondetail/actiondetail?dataid="
  },
  prom: {
    title: "优惠信息",
    condi: null,
    action: promServ.search,
    defParams: {
      shopid: app.getShopid()
    },
    temptype: "promlist",
    transfer: [
      ["title", "优惠信息"],
      ["img", "$prompic[0].fileID"],
      ["type", "prom"],
      ["text", "$goodsname"],
      ["ext", "$promname"],
      ["value", "$promno"]
    ],
    page: "/pages/goodsDetail/goodsDetail?promno="
  },
  favor: {
    title: "我的收藏",
    condi: null,
    action: "favor.getFavorList",
    manager:"trader",
    defParams: {
      shopid: app.getShopid()
    },
    temptype: "actionlist",
    transfer: [
      ["title", "我的收藏"],
      ["img", "$cover"],
      ["type", "favor"],
      ["text", "$favor_name"],
      ["ext", "$favor_desc"],
      ["favor_tp","$favor_tp"],
      ["value", "$favor_id"]
    ],
    page: "/pages/myFavor/myFavor?favor_id=",
    pageParams:["favor_tp"]
  }
}