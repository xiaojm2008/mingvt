const utils = require("../comm/utils.js");
const manageRight = require('../comm/manageRight.js');
const getUserInfo = require('../comm/getUserInfo.js');
const func = require("./actionfunc.js");
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var toValues = function (obj, l) {
  if (!obj) {
    return [];
  }
  var a = [];
  for (var k in obj) {
    if (l === 0) {
      break;
    }
    a.push(obj[k]);
    l && l != -1 ? --l : 0;
  }
  return a;
}
/*
{"transtype":"action","actionname":"general"}
*/
module.exports = async (event, wxContext) => {

  const {
    funcid,
    actionid
  } = event;

  if (!funcid || !funcid.trim()) {
    return {
      errMsg: "参数错误"
    }
  }

  var userInfo = await getUserInfo(wxContext.OPENID);
  if (userInfo.errMsg) {
    return userInfo;
  }

  var check = await manageRight.checkUserRight(event.transtype, event.actionname, wxContext.OPENID, userInfo.shopinfo.shopid);
  if (!check.auth) {
    return {
      errMsg: check.errMsg
    }
  }

  var option = func.options[funcid];
  if (!option) {
    return {
      errMsg: "OPTION未定义"
    }
  }
  var form = func.forms[funcid];
  if (!form) {
    return {
      errMsg: "FORM未定义"
    }
  }

  var group = form.filter(v=>v.id=="groupby");

  if (!group || (Array.isArray(group) && group.length === 0)) {
    const $ = db.command.aggregate;
    /*var enrollform = await db.collection('xlh_enrollform').doc(actionid).field({enrollform:1}).get();

    if(!enrollform.data){
      return {
        errMsg:"ACTIONFORM未定义"
      }
    }
    enrollform = toValues(enrollform.data.enrollform).filter(v=>{
      return v.type=='3' || v.type=='m' ;
    });
    group = enrollform;
    */
    var enrollform = await db.collection('xlh_enrollform')
      .aggregate()
      .match({
        _id: actionid
      })
      .addFields({
        enrollform: $.objectToArray('$enrollform')
      })
      .project({
        'field': $.filter({
          input: '$enrollform',
          as: 'item',
          cond: $.or([$.eq(['$$item.v.type', '3']), $.eq(['$$item.v.type', 'm']),$.eq(['$$item.v.type', 's']),])/**s 开关按钮，3单选，m可能多选单选根据checktype */
        })
      }).project({
        'field.v.name': 1,
        'field.v.id': 1,
        'field.v.seq': 1,
        'field.v.type': 1,
        'field.v.checktype':1,
        'field.v.dictlist':1
      })
      .end();
    if (enrollform.list && enrollform.list.length > 0) {
      enrollform = enrollform.list[0].field.map(v => {
        return {
          name: v.v.name,
          code: v.v.id,
          checktype:(v.v.type=='3'||v.v.type=='s')?'0':'1',/**多选Or单选 */
          type:v.v.type,
          options:v.v.type=='s'?[{code:0,name:'否'},{code:1,name:'是'}]:v.v.dictlist,
          seq: v.v.seq
        }
      }).sort((a, b) => a.seq - b.seq > 0);

      group = [{
        id: "groupby",
        name: "统计内容",
        label:1,
        placeholder:"请选择您需要统计的内容",
        type: "m",
        dict: "dict",
        checktype:'0',/**暂时只支持一维分组 */
        style: "width:100%", //
        dictlist: enrollform,
        required:'R'
      }];
      form = form.concat(group);
    } else {
      
    }
  }
 
  //queryform.push(group);
  //Array.prototype.push.apply(queryform,group);
  return {
    success: 1,
    data: {
      option: option,
      form: form
    }
  }
}