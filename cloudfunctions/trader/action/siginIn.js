// 云函数入口文件
const cloud = require('wx-server-sdk')
const utils = require('../comm/utils.js')
cloud.init({env: require("../env.js")})
const db = cloud.database({
  throwOnNotFound: false
});

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
var getActionInfo = async (actionid) => {
  var actioninfo = await db.collection("xlh_enrollaction")
    .aggregate()
    .match({
      _id: actionid
    })
    .project({
      actionname: 1,
      enrollbegintime_dt: 1,
      enrollendtime_dt: 1,
      actbegintime_dt: 1,
      actendtime_dt: 1,
      apprflag: 1,
      actiontype: 1,
      num: 1,
      status: 1,/**actionstatus 0:"启动",1:"暂停",9:"删除" */
      feetype: 1
    })
    .end();

  actioninfo = actioninfo.list && actioninfo.list.length > 0 ? actioninfo.list[0] : null;

  return actioninfo;
}
// 云函数入口函数
module.exports = async (event, context) => {
  const wxContext = cloud.getWXContext();
  /*
  if (!event.enrollid || !event.enrollid.trim()) {
    
    return {
      errMsg: "参数错误"
    }
  }*/
  if (!event.actionid || !event.actionid.trim()) {
    return {
      errMsg: "参数错误"
    }
  }
  var enrollinfo = await db.collection('xlh_enrollinfo').where({actionid:event.actionid}).field({
  //var enrollinfo = await db.collection('xlh_enrollinfo').doc(event.enrollid).field({
    _id:1,
    actionid:1,
    paystatus: 1,
    siginstatus: 1,
    apprflag: 1,
    x_username: 1,
    username: 1,
    openid:1,
    nickname: 1,
    actbegintime:1,  
    actendtime:1,
    enrollstatus: 1,
  }).get();


  //enrollinfo = enrollinfo && enrollinfo.data ? enrollinfo.data : null;
  enrollinfo = enrollinfo && enrollinfo.data && enrollinfo.data.length==1 ? enrollinfo.data[0] : null;
  if (!enrollinfo) {
    return {
      status: '0', //未报名
      errMsg: "谢谢您，同学，您咋还不报名呢"
    }
  }

  if (wxContext.OPENID != enrollinfo.openid) {
    return {
      errMsg: "非法用户"+`${wxContext.OPENID}~${enrollinfo.openid}`
    }
  }

  var username = enrollinfo.x_username || enrollinfo.username || enrollinfo.nickname;

  const actioninfo = await getActionInfo(enrollinfo.actionid);

  if (!actioninfo) {
    return {
      errMsg: "活动信息不存在"
    }
  }

  var now = new Date().getTime();

  if(now < actioninfo.actbegintime_dt){
    return {
      errMsg: `谢谢您，${username}同学，暂时还不能签到,要等到${utils.dateFormat(actioninfo.actbegintime_dt)}呀`,//.toLocaleString()
      actbegintime:enrollinfo.actbegintime,
      actendtime:enrollinfo.actbegintime,
      actbtime:actioninfo.actbegintime_dt,
      actetime:actioninfo.actendtime_dt,
      actionname:actioninfo.actionname,
      actionname1:enrollinfo.actionname,
      actionid:actioninfo.actionid,
      actionid1:enrollinfo.actionid
    }
  }
  /*
  var signtime = await db.collection('sys_config').field({
    SIGN_TIME: true
  }).limit(1).get();

  signtime = signtime && signtime.data && signtime.data.length > 0 ? signtime.data[0].SIGN_TIME : defaulttime;
  if (!signtime) {
    signtime = defaulttime;
  }
  signtime = new Date(signtime).getTime();
  if (now < signtime) {
    return {
      errMsg: `谢谢您，${username}同学，暂时还不能签到,要等到${new Date(signtime).toLocaleString()}呀`
    }
  }
  */


  /**审批状态100038 0待审核，1pass 2dispass不通过*/
  if (actioninfo.apprflag == '1') {
    if (enrollinfo.apprflag == '0') {
      return {
        errMsg: `谢谢您，${username}同学，您的申请还在审核`
      }
    } else if (enrollinfo.apprflag == '2') {
      return {
        errMsg: `谢谢您，${username}同学，您的申请还在审核未通过`
      }
    }
  }
  /**100036 0:待签到 1:已签到 2:未到场 3:已取消报名*/
  if (enrollinfo.siginstatus == '1') {
    return {
      errMsg: `谢谢您，${username}同学，您有来签订了呀,多签也没有礼物的哦`
    }
  }
  /**收费标志 100035 0待支付 1已经支付 2支付失败 3未知 */
  if (actioninfo.feetype == '1') {
    if (enrollinfo.paystatus == '0') {
      return {
        errMsg: `谢谢您，${username}同学，您还需要支付活动费用哦`
      }
    } else if (enrollinfo.paystatus == '2') {
      return {
        errMsg: `谢谢您，${username}同学，您上次费用支付失败了，需要重新支付哦！`
      }
    } else if (enrollinfo.paystatus == '3') {
      return {
        errMsg: `谢谢您，${username}同学，您上次费用支付未成功，需要重新确认哦！`
      }
    }
  }

  var res = await db.collection('xlh_enrollinfo').doc(event.enrollid).update({
    data: {
      siginstatus: '1',
      sigincode:event.sigincode,
      sigintime: new Date(),
      updatetime: new Date()
    }
  });

  if (res.stats.updated == 1) {
    return {
      success: 1,
      errMsg: `${username}同学,签到成功！`
    }
  }
  return {
    errMsg: `${username}同学，系统出问题了，麻烦您在签一次哦`
  }
}