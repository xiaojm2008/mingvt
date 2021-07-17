// 云函数入口文件
const utils = require("../comm/utils.js");
const mySeq = require("../comm/mySeq.js");
const isMatch = require("../comm/validate.js").isMatch;
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database({
  throwOnNotFound: false
});

var getuserInfo = async (openid) => {
  return await db.collection('xlh_userinfo').where({
    openid: openid
  }).field({
    phone: true,
    username: true,
    nickname: true,
    avatarurl: true
  }).get();
}
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();

  var enrollinfo = event.enrollinfo;
  

  var userInfo = await getuserInfo(wxContext.OPENID);
  userInfo = userInfo.data && userInfo.data.length > 0 ? userInfo.data[0] : null;
  if (!userInfo) {
    return {
      errMsg: '用户没有注册'
    }
  }

  /*
  获取活动相关控制标志
  aggregate()
  .project({
    first: $.arraElemAt(['$scores', 0]),
    last: $.arraElemAt(['$scores', -1]),
  })
  .end()
  */
  /*
  var actioninfo = await db.collection("xlh_enrollaction").doc(enrollinfo.actionid).field(
      {
      actionname:1,
      enrollbegintime_dt:1,
      enrollendtime_dt:1,
      actbegintime_dt:1,
      actendtime_dt:1,
      apprflag:1,
      num:1,
      status:1,
      feetype:1}).get();
      */
  const $ = db.command.aggregate;

  var actioninfo = await db.collection("xlh_enrollaction")
    .aggregate()
    .match({_id:enrollinfo.actionid})
    .project(
      {
      actionname:1,
      create_avatarurl:1,
      create_phone:1,
      create_username:1,
      create_userid:1,
      enrollbegintime_dt:1,
      enrollendtime_dt:1,
      actbegintime_dt:1,
      actendtime_dt:1,
      cover:$.let({
        vars:{
          picpath:{$arrayElemAt:["$picpath", 0]},
        },
        in:"$$picpath.fileID"
      }),
      imginfo:$.let({
        vars:{
          imginfo:{$arrayElemAt:["$imginfo", 0]},
        },
        in:"$$imginfo.fileID"
      }),
      /*
      错误的表达：不能（$.arrayElemAt）
      cover:$.let({
        vars:{
          picpath:$.arraElemAt(['$picpath', 0]),
        },
        in:"$$picpath.fieldID"
      }),
      imginfo:$.arraElemAt(['$imginfo', 0]),
      */
      /*
       正确的表达：$arrayElemAt
      imginfo:{$arrayElemAt:["$imginfo", 0]},
      cover:{$arrayElemAt:["$picpath", 0]},
      */
      num:1,
      apprflag:1,
      siginflag:1,
      status:1, //100039 0:"启动",1:"暂停",2:"结束",9:"删除"
      actiontype:1,
      feetype:1,      
      fee:1,
      total_pay:1,
      feechild:1
     })
      .end();

  actioninfo = actioninfo.list && actioninfo.list.length>0? actioninfo.list[0] :null;

  if(!actioninfo){
    return {
      errMsg:"活动信息不存在"
    }
  }

  actioninfo.total_pay = (actioninfo.total_pay||0);
  var res = null;

  //报名ID
  if(event.enrollid && event.enrollid.trim()){

    res = await db.collection('xlh_enrollinfo').doc(event.enrollid).field({
      openid:1,
      total_pay:1,
      apprstatus:1,
      siginstatus:1,
      paystatus:1,
      _id: true
    }).get();
    res = res.data;

  } else {
    res = await db.collection('xlh_enrollinfo').where({
      actionid: enrollinfo.actionid,
      openid: wxContext.OPENID
    }).field({
      openid:1,
      total_pay:1,
      apprstatus:1,
      siginstatus:1,
      paystatus:1,
      _id: true
    }).get();
    res = res.data && res.data.length != 0 ? res.data[0]:null;
  }

  if(!res || wxContext.OPENID == res.openid){   
    /**自己修改的可以重新修改用户的注册信息 */
    enrollinfo.openid = wxContext.OPENID;
    enrollinfo.x_username = userInfo.nickname|| userInfo.username||"";
    enrollinfo.x_phone = userInfo.phone||"";
    enrollinfo.avatarurl = userInfo.avatarurl||"";
  }

  enrollinfo.total_pay = 0;

  if(isMatch("feetype==1&&actiontype->0,1,2,3","活动费用计算",actioninfo)){
    enrollinfo.total_pay = (actioninfo.fee||0)*(enrollinfo.personnum||1)+(actioninfo.feechild||0)*(enrollinfo.childnum||0);
    if(enrollinfo.total_pay<=0){
      return {
        errMsg:"活动费用配置错误，请联系活动发起人！"
      }
    }
  } else if(isMatch("feetype==1&&actiontype->4,5","预约/社交费用计算",actioninfo)){
    enrollinfo.total_pay = actioninfo.fee||0;
    if(enrollinfo.total_pay<=0){
      return {
        errMsg:"预约/社交费用配置错误，请联系活动发起人！"
      }
    }
  }
  
 

  actioninfo.num = actioninfo.num ? actioninfo.num:0;
  enrollinfo.phone && (enrollinfo.phone=enrollinfo.phone+"");

  enrollinfo.actionname = actioninfo.actionname;
  
  enrollinfo.actionstatus = actioninfo.status||'0';  /** 0:"启动",1:"暂停",9:"删除" */
  enrollinfo.launch_avatarurl = actioninfo.create_avatarurl; // 发起人
  enrollinfo.launch_name = actioninfo.create_username; // 发起人  
  enrollinfo.launch_id = actioninfo.create_userid; // 发起人  
  enrollinfo.launch_phone = actioninfo.create_phone; // 发起人

  
  enrollinfo.feetype = actioninfo.feetype||'0';
  enrollinfo.apprflag = actioninfo.apprflag;
  enrollinfo.siginflag = actioninfo.siginflag;
  enrollinfo.actiontype = actioninfo.actiontype;
  enrollinfo.enrollbegintime = actioninfo.enrollbegintime_dt||null;
  enrollinfo.enrollendtime = actioninfo.enrollendtime_dt||null;
  enrollinfo.actbegintime = actioninfo.actbegintime_dt||null;
  enrollinfo.actendtime = actioninfo.actendtime_dt||null;
  enrollinfo.cover = typeof actioninfo.cover==='object' ? (actioninfo.cover.fileID||''):actioninfo.cover;
  enrollinfo.imginfo =  typeof actioninfo.imginfo==='object' ? (actioninfo.imginfo.fileID||''):actioninfo.imginfo;
  enrollinfo.num = actioninfo.num;//已经报名人数

  if (res) {
    /**
     * 这些时间不用更新，否则更新后就成了字符串类型了
     */
    enrollinfo.apprtime&&delete enrollinfo.apprtime;
    enrollinfo.paytime&&delete enrollinfo.paytime;
    enrollinfo.repaytime&&delete enrollinfo.repaytime;
    enrollinfo.sigintime&&delete enrollinfo.sigintime;
    enrollinfo.settime&&delete enrollinfo.settime;

    //活动需要收费，原来报名信息未标记收费状态，修改时候需要标记
    if(actioninfo.feetype==1 && !res.paystatus){
      enrollinfo.paystatus = '2'; /**待支付 */
    }
    //活动需要审核报名信息，原来报名信息未标记，修改时候需要标记
    if(actioninfo.apprflag) {
      if(!res.apprstatus){
        enrollinfo.apprstatus = '0';
      }
    }
    if(actioninfo.siginflag){
      if(!res.siginstatus){
        enrollinfo.siginstatus = '0';
      }
    }
    //处理费用是否有变化
    if(enrollinfo.total_pay-res.total_pay!=0){
      actioninfo.total_pay+=(enrollinfo.total_pay-res.total_pay);
    }

    enrollinfo.updatetime = new Date();

    const updcmd = db.command;
    const updtranscation = await db.startTransaction();

    res = await updtranscation.collection('xlh_enrollinfo').doc(res._id).update({
      data: enrollinfo
    });

    if(enrollinfo.total_pay-res.total_pay!=0){
      res = await updtranscation.collection("xlh_enrollaction").doc(actioninfo._id).update({
        data:{
          total_pay:actioninfo.total_pay
        }
      });
    }

    await updtranscation.commit();

    return {
      _id: res._id,
      success: 1,
      errMsg: "您的记录已经修改成功"
    };
  }
  /************************************************************ */
  //新增报名逻辑
  /************************************************************ */
  if(actioninfo.status =='1'){
    return {
      errMsg:"活动已经暂停"
    }
  } else if(actioninfo.status =='9'){
    return {
      errMsg:"活动已经取消或删除"
    }
  }

  var now = new Date();

  if(now<actioninfo.enrollbegintime_dt && now>actioninfo.enrollendtime_dt){
    return {
      errMsg:`活动已经过了报名时间${utils.dateFormat(actioninfo.enrollbegintime_dt,"yyyy-MM-dd hh:mm")}~${utils.dateFormat(actioninfo.enrollendtime_dt,"yyyy-MM-dd hh:mm")}`
    }
  }

  if(now>=actioninfo.actbegintime_dt){
    return {
      errMsg:`活动已于${utils.dateFormat(actioninfo.actbegintime_dt,"yyyy-MM-dd hh:mm")}开始`
    }
  } 

  if(now>=actioninfo.actendtime_dt){
    return {
      errMsg:`活动已于${utils.dateFormat(actioninfo.actendtime_dt,"yyyy-MM-dd hh:mm")}结束`
    }
  } 

  /**报名是否审批 */
  if(actioninfo.apprflag){
    /**审批状态100038 0待审核，1pass 2dispass不通过*/
    enrollinfo.apprstatus = '0';
  }
  if(actioninfo.feetype==1){
    /**收费标志 100035 03支付失败 1已经支付 2待支付 3支付失败 */
    enrollinfo.paystatus = '2';
  }  
  /**100036 0:待签到 1:已签到 2:未到场 3:已取消报名*/
  if(actioninfo.siginflag){
    enrollinfo.siginstatus="0";
  }
  /** 100040 记录状态 1:有效,9:删除 */
  enrollinfo.enrollstatus="1";
  /**refundstatus:100037 0:待退款 1:已退款 2:退款失败 3:取消退款 9:未知*/
  enrollinfo.refundstatus=null;
  //还是在这里把，不过这个是我报名时候的人数，后续报名人员不会更新这个值
  enrollinfo.num = ++actioninfo.num;
  /** "0" 待评论 1：已经评论 */
  enrollinfo.commentflag = "0";
  enrollinfo.commenttime=null;
  
  //enrollinfo.regdate = utils.dateFormat(now,"yyyyMMdd"),
  enrollinfo.settime = new Date();
  enrollinfo.updatetime = new Date();

  var enrollid = mySeq.mySeq32("ENR"); //32 char

  const transcation = await db.startTransaction();

  res = await transcation.collection('xlh_enrollinfo').doc(enrollid).set({
    data: enrollinfo
  });

  const cmd = db.command;
  var willupdaction = {num:cmd.inc(1)}
  if(enrollinfo.total_pay>0){
    willupdaction.total_pay=actioninfo.total_pay+enrollinfo.total_pay;
  } 
  res = await transcation.collection("xlh_enrollaction").doc(actioninfo._id).update({
    data:willupdaction
  });

  await transcation.commit();
  /*
  var updNum = await db.collection("xlh_enrollinfo").where({actionid:actioninfo._id}).update({
    data:{
      num:cmd.inc(1)
    }
  });*/

  return {
    success: 1,
    //updNum:updNum.stats.updated,
    _id: res._id,
    errMsg: "提交成功"
  };
}