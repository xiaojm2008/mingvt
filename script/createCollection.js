db.createCollection("seq_orderid")
db.createCollection("seq_shopid")
db.createCollection("seq_shopdetailchg") //资金变动序列号
/**
 * DEBUG:是否调试模式
 * LOCATE:是否定位
 * SERVER:服务器
 * UPIMGFMT:图片格式默认jpg
 * UPIMGSERVER:图片服务器
 * UPIMGSIZE:图片最大尺寸(KB)
 */
db.createCollection("sys_clientcfg")
/**
 * 系统配置
 * max_invitation:最大邀请人
 */
db.createCollection("sys_config")
db.createCollection("sys_dict")//字典
db.createCollection("sys_expcode_kdn") //快递公司信息（快递鸟）
/**
 * openid相关
 * temptype:promotion_*(1,2,3...9) 促销活动配置
 * temptype:shop_parameter 店铺[商户信息](新增店铺)，
 * temptype:shop_credentials 店铺[资质与服务保障证信息](新增店铺）
 * temptype:goods 商品参数(新增商品）
 * temptype:goods_ensure 服务保障(新增商品）
 * temptype:goods_subid(未使用了，参考店内分类)
 * temptype:layout_***(text,image,scroll-view) 布局相关)
 */
db.createCollection("sys_fieldtemplate") //自定义字段相关配置
/*
客户中心配置
我的订单
收货地址
会员卡
优惠券
我要开店
控制台
seq:0,
id:100,
name:"",
children:[]
url:""
icon:"",
level:1,
status:"1",
summary:""
*/
db.createCollection("sys_memmenu") //member【我】页面配置
db.createCollection("sys_menu")
db.createCollection("sys_role")
db.createCollection("sys_rolemenu")
db.createCollection("sys_roleright")
db.createCollection("sys_state")
db.createCollection("sys_user")
db.createCollection("sys_usermenu")
db.createCollection("sys_userright")
db.createCollection("sys_userrole")

db.createCollection("xlh_advert"); //首页广告
db.createCollection("xlh_address")
db.createCollection("xlh_bargainlog") //？？
db.createCollection("xlh_booingnote") //托运单
db.createCollection("xlh_logisticslog") //预约揽件日志
db.createCollection("xlh_logistics") //预约揽件信息
db.createCollection("xlh_carousel") //滚动播放栏，暂时未用
db.createCollection("xlh_favor") //我的收藏
db.createCollection("xlh_cart")//购物车
/**
 * catetype:1
 * summary:商品分类
 * catetype:2
 * summary:商家分类
 */
db.createCollection("xlh_category")//分类信息

db.createCollection("xlh_comment") //评论信息
db.createCollection("xlh_coupon") //优惠券
db.createCollection("xlh_coupontaken") //领取的优惠券
db.createCollection("xlh_goods")
db.createCollection("xlh_goodsstock") //库存
db.createCollection("xlh_goodsprom") //商品活动信息
db.createCollection("xlh_promotion") //促销活动信息

db.createCollection("xlh_invitationlog") //团队成员邀请信息
db.createCollection("xlh_known")
db.createCollection("xlh_myteam") //我的团队成员
db.createCollection("xlh_orderdetail")
db.createCollection("xlh_orderpending")

db.createCollection("xlh_shopcategory") //店内商品分类信息
db.createCollection("xlh_shopinfo") //店铺信息
db.createCollection("xlh_shopprom") //店铺活动信息
db.createCollection("xlh_shopthema") //店铺首页配置
db.createCollection("xlh_thema") //主体信息
db.createCollection("xlh_toprank") //未定
db.createCollection("xlh_userbenefit") //用户权益信息
db.createCollection("xlh_userinfo") //用户信息
db.createCollection("xlh_userlocation") //用户定位
db.createCollection("xlh_userright")

/**
 * 报名活动相关表
 */
db.createCollection("xlh_enrollinfo") //报名信息
db.createCollection("xlh_enrollform") //报名表单
db.createCollection("xlh_enrollaction") //报名活动

db.createCollection("app_refund") //退款申请
db.createCollection("xlh_paymentlog")//按订单的支付日志
db.createCollection("xlh_paymentdetail")//按商户的支付明细

db.createCollection("xlh_wxprepaylog") //微信预支付日志
db.createCollection("xlh_wxprepayresult") //微信预支付结果
db.createCollection("xlh_wxsandboxkey") 
db.createCollection("xlh_shopimg") //店铺图片信息
/**
 * _id(shopid):主键
 * APPR_ADDGOODS:新增商品是否审批0否,1是
 * APPR_MODGOODS:修改商品是否审批
 * APPR_DELGOODS:
 */
db.createCollection("xlh_shopcfg") //店铺控制
/**
 * shareid:1,
  sharename:1,
  shareuserid:1,
  shareusername:1
 */
db.createCollection("xlh_shareinfo") //分享信息
db.createCollection("xlh_shareentryinfo") //分享打开信息

db.createCollection("sys_shopsettlectrl") //结算控制
db.createCollection("sys_shopsettlelog") //结算日志表

db.createCollection("bal_cashoutlog") //提现申请日志流水
db.createCollection("bal_cashoutapp") //提现申请
db.createCollection("bal_shopdetail") //店铺资金明细
db.createCollection("bal_shopdetailchg") //店铺资金变动明细
db.createCollection("bal_shop") //店铺资金汇总
/**
 * 月支付流水统计
 */
db.createCollection("stats_paymentmonth") 
/*
日周月季年成交收入统计
*/
db.createCollection("stats_incomeyear")
db.createCollection("stats_incomeseason")
db.createCollection("stats_incomemonth")
db.createCollection("stats_incomeweek")
db.createCollection("stats_incomeday")
