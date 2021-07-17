// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require("../env.js")
})
const db = cloud.database();
/*
var tmp = {
  "order_id": "c5e17845-2b65-45cf-8e18-58fd1823909e",
  "goods": [{
    "goodsno": "100000000008",
    "goodsname":"",
    "model_value":"",
    "info": {
      "content": "asdfsadfddddddd",
      "level": 1,
      "img_arr": ["cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/comment/c5e17845-2b65-45cf-8e18-58fd1823909e1000000000080.png", "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/comment/c5e17845-2b65-45cf-8e18-58fd1823909e1000000000081.png"]
    }
  }, {
    "goodsno": "100000000008",
    "info": {
      "content": "sdfasfsafsdf ",
      "level": 1,
      "img_arr": ["cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/comment/c5e17845-2b65-45cf-8e18-58fd1823909e1000000000080.png", "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/comment/c5e17845-2b65-45cf-8e18-58fd1823909e1000000000081.png"]
    }
  }, {
    "goodsno": "100000000008",
    "info": {
      "content": "",
      "level": 1,
      "img_arr": []
    }
  }, {
    "goodsno": "100000000016",
    "info": {
      "content": "",
      "level": 1,
      "img_arr": []
    }
  }],
  "score": 5,
  "logistics_score": 5,
  "avatarurl": "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLgRDLrC6oploA81EJVDaGo29t3pzOKKclJ6diaIQ42zf0icJUYjbzVYp5lxIliclPLQibiaMZp1OX1HDA/132",
  "nickname": "肖锦？？？"
}
*/
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const {
    _id,
    desc_score,
    logistics_score,
    avatarurl,
    nickname
    /*
    transtype,
    actionname,*/
  } = event;

  var tasks = [];
  if(event.goods_info.length===0){
    return {
      errMsg:"您评论的商品信息空"
    }
  }
  if(!_id || !_id.trim()){
    return {
      errMsg:"订单ID为空"
    }
  }
  if(!nickname){
    return {
      errMsg:"您用户信息为空"
    }
  }
  if(!logistics_score || !desc_score){
    return {
      errMsg:"您还未打分呢"
    }
  }
  event.goods_info.forEach((item, idx, arr) => {
    var comment = {
      "openid": wxContext.OPENID,
      "o_id": _id,//订单ID
      "goodsno": item.goodsno,
      "goodsname": item.goodsname,
      "model_value": item.model_value,
      "model_id": item.model_id,
      "user_img": avatarurl,
      "nickname": nickname,
      "commenttype": item.info.level ? item.info.level.toString() : "",
      "content": item.info.content,
      "imgs": item.info.img_arr,
      "has_img": item.info.img_arr && item.info.img_arr.length > 0 ? true : false,
      "evaluate": null,
      "logistics_score": logistics_score,
      "desc_score": desc_score,
      "score": (logistics_score+desc_score)/2,
      "status": "0",
      "settime": new Date().getTime()
    };

    tasks.push(db.collection('xlh_comment').add({
      data: comment
    }));
  });

  var res = (await Promise.all(tasks));

  res =  res.map(item => item._id);

  if(res.length > 0){
    return {
      success:1,
      errMsg:"谢谢您真诚的评论！"
    }
  }
  return res;
}