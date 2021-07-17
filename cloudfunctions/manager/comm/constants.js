module.exports = {
  FOUNDER_ID: '1', //创建者等于1，表示当前用户就是店铺的创始人，否则是管理者
  SYS_ROLEID: "9999",
  SYS_ROLENAME: "管理员",
    /**
   * 
待付款:'0'
待发货:'1'
待收货:'2' 
待评价:'3'
已完成:'6'
   */
  ORST_PEN_PAY: "0",//待支付
  ORST_PEN_DELIVERY: "1", //待发货
  ORST_PEN_RECV:"2",   //待收货
  ORST_PEN_COMMENT:"3", //待评价
  ORST_OK:"6"
}