// 云函数入口文件
const cloud = require('wx-server-sdk')
const getLogisticsPath = require('getLogisticsPath.js')
const getBookingNote = require('getBookingNote.js')
const addBookingNote = require('addBookingNote.js')
cloud.init({
  env: require("./env.js")
})
// 云函数入口函数
exports.main = async (event, context) => {
  const {
    transcode,
    order_id,
    exp_code,
    exp_no
  } = event;

  try {
    if(transcode == "GET_PATH"){
      return getLogisticsPath(order_id);
    } else if (transcode == "GET_BN"){
      return getBookingNote(order_id);
    } else if(transcode=="ADD_BN"){
      return addBookingNote(order_id, exp_code, exp_no);
    } else {
      return {
        errMsg:`不支持的交易代码[${transcode}]`
      }
    }
  } catch (err) {
    console.log(err)
    return {
      errMsg:err.errMsg || err.message
    }
  }
}