var payConfig = {
  appid:'wx59e74c021081f517',
  mch_id:'',
  body:'伊秀秀商品交易',
  ip: '1',
  key: '',
  sandbox_key: '',
  real_key:'',
  unified_url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',//统一下单URL sandboxnew
  query_url: 'https://api.mch.weixin.qq.com/pay/orderquery',
  cashout_url:'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers', //提现到零钱
  notify_url:'https://www.xiaojinming2008.com/payResult',  
  gesignkey_url:'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey',
  refund_url:'https://api.mch.weixin.qq.com/secapi/pay/refund'
}
module.exports = payConfig;
/*
{
  "_id":"281fb4bf5d03bfb70162d8ba71d80ec7",
  "order_id":"4f6bfd3a-66f6-4ec1-8411-c72c4e3e3a6d",
  "total_pay":5,
  "transcode": "PRE_ORDER"
}
<xml>
  <return_code><![CDATA[FAIL]]></return_code>
  <retmsg><![CDATA[输入请求参数xml格式错误]]></retmsg>
  <retcode><![CDATA[1]]></retcode>
</xml>
商户在小程序中先调用该接口在微信支付服务后台生成预支付交易单，返回正确的预支付交易后调起支付。
小程序ID	           appid	            是	String(32)	wxd678efh567hg6787	微信分配的小程序ID
商户号	             mch_id	          是	String(32)	1230000109	微信支付分配的商户号
设备号	             device_info	      否	String(32)	013467007045764	自定义参数，可以为终端设备号(门店号
随机字符串	          nonce_str	        是	String(32)	5K8264ILTKCH16CQ2502SI8ZNMTM67VS	随机字符串，长度
签名	               sign	            是	String(32)	C380BEC2BFD727A4B6845133519F3AD6	通过签名算法计算
签名类型	            sign_type	        否	String(32)	MD5	签名类型，默认为MD5，支持HMAC-SHA256和MD5。
商品描述	            body	            是	String(128)	腾讯充值中心-QQ会员充值	商品简单描述，该字段请按照规
商品详情	            detail	          否	String(6000)商品详细描述，对于使用单品优惠的商户，该字段必须按照
附加数据	            attach	          否	String(127)	深圳分店	附加数据，在查询API和支付通知中原样返回，可
商户订单号	          out_trade_no      是	String(32)	20150806125346	商户系统内部订单号，要求32个字符内，
标价币种	            fee_type	        否	String(16)	CNY	符合ISO 4217标准的三位字母代码，默认人民币：
标价金额	            total_fee	        是	Int	88	    订单总金额，单位为分，详见支付金额
终端IP	             spbill_create_ip	是	String(64)	123.12.12.123	支持IPV4和IPV6两种格式的IP地址。调用
交易起始时间	        time_start	      否	String(14)	20091225091010	订单生成时间，格式为
交易结束时间	        time_expire       否 	String(14)	20091227091010	订单失效时间，格式为
订单优惠标记	        goods_tag	        否	String(32)	WXG	订单优惠标记，使用代金券或立减优惠功能时需要的参
通知地址	            notify_url	      是	String(256)	http://www.weixin.qq.com/wxpay/pay.php	异步接收
交易类型	            trade_type	      是	String(16)	JSAPI	小程序取值如下：JSAPI，详细说明见参数规定
商品ID	              product_id	      否	String(32)	12235413214070356458058	trade_type=NATIVE时，此参
指定支付方式	        limit_pay	        否	String(32)	no_credit	上传此参数no_credit--可限制用户不能使用信
用户标识	            openid	          否	String(128)	oUpF8uMuAJO_M2pxb1Q9zNjWeS6o	trade_type=JSAPI，电子发票入口开放标识	 receipt           否	String(8)	  Y	Y，传入Y时，支付成功消息和支付详情页将出现开票入
*/