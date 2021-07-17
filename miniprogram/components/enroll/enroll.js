
/*!
 * enroll.js
 * xiaojinming - v1.0.0 (2020-03-21)
 * Released under MIT license
 */
var cache = require("../../lib/utils/cache.js");
const helperServ = require("../../lib/utils/helper.js");
var upimg = require("../../lib/utils/upimg.js");
const V = require("../../lib/utils/validate.js");
const restore = require("../../lib/utils/restore.js");
const constants = require("../../lib/comm/constants.js");
const pageServ = require("../../lib/utils/pagehelper.js");
const loginServ = require("../../lib/services/login.js");
const commServ = require("../../lib/services/common.js");

var app = getApp();
/*
const maxWidth = 680;
const maxHeight = 180;
const maxCount = 3;
const imgType = "jpg";
*/
Component({
  options: {
    //styleIsolation:'apply-shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    actionid: {
      type: String,
      value: null
    },
    classname: {
      type: String,
      value: ''
    },
    initcache: {
      type: Boolean,
      value: true
    },
    mystyle: {
      type: String,
      value: ''
    },
    enrolldata: {
      type: Object,
      value: null,
    },
    moveable: {
      type: Boolean,
      value: false
    },
    screenwidth: {
      type: Number,
      value: 0
    },
    screenheight: {
      type: Number,
      value: 0
    },
    /** showMenu 中使用，如果在组件父元素中使用了 transform:translateY(0px),那么display:fixed会失效，那么需要计算
     * 父元素相对于body的偏移，
    */
    offset:{
      type: Number,
      value: 0
    }
  },
  cloudPath: "enroll/",
  //scrollTop:0,
  enrollmap: null,
  /**
   * 组件的初始数据
   */
  data: {
    specail_fieldtype: {
      "5": true,
      "9": true,
      "a": true,
      'b': true,
      'm': true,
      'b1': true
    },
    enrollinfo: null,
    movableViewInfo: {
      y: 0,
      showClass: 'none',
      data: {}
    },
    showCanvas: false,
    canvasHeight: 500,
    canvasWidth: 800,
    pageInfo: {
      rowHeight: 46,
      scrollHeight: '100%',
      startY: 0,
      startIndex: null,
      scrollY: true,
      targetIndex: null,
      srcIndex: null,
    }
  },
  lifetimes: {
    created: function() {
      console.debug(`**********enroll create***********`, this.properties);
      if (!this.properties.screenheight && !this.properties.screenwidth) {
        this.properties.screenheight = app.systemInfo.windowHeight;
        this.properties.screenwidth = app.systemInfo.windowWidth;
        //console.debug(`**********enroll create(getSystemInfo)***********`, app.systemInfo);
      }
      this.setData({
        canvasHeight: this.properties.screenheight,
        canvasWidth: this.properties.screenwidth
      })
    },
    attached: function() {
      console.debug('***********enroll attached***********', this.properties);
    },
    ready: function() {
      console.debug('***********enroll ready***********', e_cache);
      if (this.properties.initcache) {
        var e_cache = restore.getEnrollInfo(this.properties.actionid);
        if (e_cache && !this.data.enrollinfo) {
          this.setData({
            enrollinfo: e_cache
          })
        }
      }
    },
    detached: function() {
      console.debug('***********enroll detached***********');
      restore.setEnrollInfo(this.properties.actionid, this.data.enrollinfo);
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    openUrl:function(e){
      var d = e.currentTarget.dataset;
      helperServ.goToPage("/components/enroll/xwebview/xwebview?url=" + encodeURIComponent(d.url+(d.params?("?"+d.params):"")));
    },
    /**
     * target ：需要被控制是否显示隐藏的字段
     * src:控制者字段
     */
    getExpression: function(target, src) {
      var condition = target.condition,
        i = condition ? condition.indexOf('==') : -2;
      if (i == -1) {
        i = condition.indexOf('!=');
      }
      if (i == -1) {
        i = condition.indexOf('->');
      }
      if (i < 0) {
        return null;
      }
      var left = condition.substr(0, i),
        symb = condition.substr(i, 2);
      if (symb != '==' && symb != '!=' && symb != '->') {
        return {
          errMsg: `${target.name}：${target.condition}只支持==，!==运算符`
        }
      }
      if (src && left != src.id) {
        return;
      }
      var right = condition.substr(i + 2);
      left = left ? left.trim() : null;
      right = right ? right.trim() : null;
      if (!left || !right) {
        return {
          errMsg: `${target.name}：${target.condition}条件表达式定义错误，左/右值为空`
        }
      }
      if (symb == '->') {
        right = right.split(',');
        if (!Array.isArray(right)) {
          return {
            errMsg: `${target.name}：${target.condition}条件表达式【->】右值格式错误`
          }
        }
      }
      return {
        expression: [left, symb, right]
      };
    },
    conditionShow: function(field, target, fieldseq, data) {
      var exp = field.expressionshow ? field.expressionshow[target.id] : null;
      if (!exp) {
        exp = this.getExpression(target, field);
        if (!exp) {
          return;
        }
        if (exp.errMsg) {
          return {
            errMsg: exp.errMsg
          }
        }
        exp = exp.expression;
      }
      if (exp[1] == '==') {
        data[`enrollinfo[${fieldseq}].hidden`] = !(field.value == exp[2]);
        data[`enrollinfo[${fieldseq}].required`] = !(field.value == exp[2]) ? 'O' : 'R';
      } else if (exp[1] == '!=') {
        data[`enrollinfo[${fieldseq}].hidden`] = !(field.value != exp[2]);
        data[`enrollinfo[${fieldseq}].required`] = !(field.value != exp[2]) ? 'O' : 'R';
      } else if (exp[1] == '->') {
        data[`enrollinfo[${fieldseq}].hidden`] = !(exp[2].find(v => v = field.value));
        data[`enrollinfo[${fieldseq}].required`] = !(exp[2].find(v => v = field.value)) ? 'O' : 'R';
      }
      //console.debug(`${field.value}==${condition_v}`, !(field.value == condition_v));
    },
    previewPromptImg:function(e){
      
    },
    previewImg: function(e) {
      var index = e.currentTarget.dataset.index,
        imgidx = e.currentTarget.dataset.imgindex;
      helperServ.previewImg(this.data.enrollinfo[index].value, imgidx);
    },
    checkBoxTogger: function(e) {
      var index = e.currentTarget.dataset.index,
        cindex = e.currentTarget.dataset.cindex,
        field = this.data.enrollinfo[index],
        data = {};
      field.checkbox[cindex].active = !field.checkbox[cindex].active;
      if (field.checktype == '0') {
        //单选
        if (field.preactive >= 0 && cindex != field.preactive) {
          field.checkbox[field.preactive].active = false;
          data[`enrollinfo[${index}].checkbox[${field.preactive}].active`] = false;
        }
        field.preactive = cindex;
      }
      data[`enrollinfo[${index}].checkbox[${cindex}].active`] = field.checkbox[cindex].active;
      field.value = field.checkbox.filter(v => v.active).map(v => v.code);
      this.setData(data);
      this.triggerEvent("togger", {
        field: {
          id: field.groupid ? field.groupid : field.id,
          group: field.group||'',
          value: field.checktype === '0' && field.out === '1' ? field.value[0] : field.value
        }
      });
      if (field.conditionshow && field.conditionshow.length > 0) {
        var self = this;
        setTimeout(() => {
          data = {};
          field.conditionshow.forEach((seq, i) => {
            this.conditionShow(field, this.data.enrollinfo[seq], seq, data);
          });
          if (Object.keys(data).length > 0) {
            this.setData(data);
          }
        }, 0);
      }
      field.event && this.fieldTapTogger(e);
    },
    showMenu: function(e) {
      var x = 0,
        y = 0,
        index = e.currentTarget.dataset.index,
        field = this.data.enrollinfo[index];
      if (!field.suffix || field.suffix.length ==0 ){
        return;
      }
      pageServ.getEleRect('#' + e.currentTarget.id,this, (pos) => {
        if (!pos) { return; }
        console.log("****viewPort****", pos);
        var myMenu = this.selectComponent('#myMenu');
        myMenu.setMenu(field.suffix.map((v, i) => {
          const t = typeof v;
          return {
            "id": t == "object" ? v.code : v,
            "text": t == "object" ? v.name : v,
            "togger": (e, menu) => {
              this.menuItemTogger(index, i);
            }
          }
        }));
        x = pos.left - myMenu.getWidth(), y = pos.bottom + pos.scrollTop - 35-this.properties.offset;//我也不知道为啥要-35
        const menuH = myMenu.getHeight();
        if (app.systemInfo.windowHeight - pos.bottom < menuH) {
          //如果当前坐标+弹出菜单高度大于剩余可视，那么往上弹
          y -= menuH;
          if (pos.bottom < menuH) {
            y += menuH - pos.bottom;
          }
        }
     
        myMenu.show({
          mask: 'none',
          posi: {
            left: x,
            top: y
          },
          className: 'menu-dialog', //menu-dialog
          inputlist: null
        });
      }); //end getRect callback
    },
    menuItemTogger: function (fieldidx, suffixidx){
      var data = {},field = this.data.enrollinfo[fieldidx],v=field.suffix[suffixidx];
      const suffixvalue = typeof v == 'object' ? v.code : v;
      if (field.suffixvalue == suffixvalue){
        return;
      }
      data[`enrollinfo[${fieldidx}].suffixvalue`] = suffixvalue;
      this.setData(data);
      this.triggerEvent("togger", {
        field: {
          id: field.groupid ? field.groupid : field.id,
          group: field.group || '',
          value: field.value + (field.value?suffixvalue||'':'')
        }
      });
    },
    fieldTapTogger: function(e) {
      var index = e.currentTarget.dataset.index;
      var field = this.data.enrollinfo[index];
      //console.debug(field);
      e.currentTarget.dataset.field = field;
      e.inputlist = this.data.enrollinfo;
      return field.event.togger(e, (err, res) => {
        var data = {};
        if (!err) {
          data[`enrollinfo[${index}].prompt`] = res;        
          if(res.retogger){
            field = e.currentTarget.dataset.field;
            data[`enrollinfo[${index}].value`] = field.value;
            this.triggerEvent("togger", {
              field: {
                id: field.groupid ? field.groupid : field.id,
                group: field.group || '',
                value: field.value && typeof field.value === 'string' && field.suffixvalue? field.value+field.suffixvalue:field.value
              }
            });
          }
          this.setData(data);
        } else {
          data[`enrollinfo[${index}].prompt`] = null;
          this.setData(data);
          helperServ.showModal({
            content: err
          });
        }
      });
    },
    selPromptTogger:function(e){
      var index = e.currentTarget.dataset.index,field = this.data.enrollinfo[index],data={};
      data[`enrollinfo[${index}].value`] = field.prompt.value[e.currentTarget.dataset.imgindex].fileID;
      this.setData(data);
      this.triggerEvent("togger", {
        field: {
          id: field.groupid ? field.groupid : field.id,
          group: field.group || '',
          value: data[`enrollinfo[${index}].value`] + (data[`enrollinfo[${index}].value`] ?field.suffixvalue || '':'')
        }
      });
    },
    checkPhone:function(e){
      helperServ.showToast({
        title:"不支持",
        icon:"none"
      })
    },
    getPhoneNumber:function(e){
      var id = e.currentTarget.dataset.index;
      if (e && e.detail && e.detail.encryptedData) {
        helperServ.showLoading();
        loginServ.checkSession().then(res => {
          helperServ.hideLoading();
          if (res.is_login == '1') {
            this.decryptData(e.detail,id);
          } else {
            loginServ.login().then(res => {
              if (res.is_login == '1') {
                this.decryptData(e.detail,id);
                return;
              }
            })
          }
        });
      }
    },
    decryptData: function(params,id) {
           
      commServ.decryptWXData(params).then(res => {
        if (res.result && res.result.data) {
          var data={}; 
          data[`enrollinfo[${id}].value`] = res.result.data.phoneNumber;
          this.setData(data)
        } else if (res.result.is_login == '0') {
          helperServ.showModal({
            title: res.result.errMsg,
            content: '需要请您的确认是否进行微信服务器认证！',
            success: (res) => {
              if (res.confirm) {
                helperServ.showLoading();
                loginServ.login().then(res => {
                  helperServ.hideLoading();
                  if (res.is_login == '1') {
                    helperServ.showModal({
                      content: '登陆成功，请再次尝试'
                    });
                  }
                });
              }
            }
          });
        } else {
          helperServ.showModal({
            content: res.result.errMsg
          });
        }
      }).catch(err => {
        helperServ.showModal({
          content: err.errMsg
        });
      });
    },
    clearValue:function(e){
      var id = e.currentTarget.dataset.index,data={};
      data[`enrollinfo[${id}].value`] = '';
      this.setData(data);
    },
    inputTextTogger: function(e) {
      var id = e.currentTarget.id,
        field = this.data.enrollinfo[id],
        v = e.detail.value,
        pack = e.currentTarget.dataset.pack ? e.currentTarget.dataset.pack : '',
        data = [];
      data[`${pack}[${id}].text`] = v;
      data[`${pack}[${id}].value[0].text`] = v;
      this.setData(data);
      this.triggerEvent("togger", {
        field: {
          type: 'text',
          id: field.groupid ? field.groupid : field.id,
          group: field.group || '',
          value: v
        }
      });
    },
    inputTogger: function(e) {
      var id = e.currentTarget.id,
        v = e.detail.value,
        pack = e.currentTarget.dataset.pack ? e.currentTarget.dataset.pack : '',
        data = [],
        field = this.data.enrollinfo[id],
        dict = field.dictlist, //e.currentTarget.dataset.dict
        validx = e.currentTarget.dataset.validx;
      if (field.type==='3') {
        //dict = JSON.parse(dict);        
        var dictObj = null;
        if (typeof dict == "object") {
          dictObj = dict;
        } else {
          if (field.dict == 'dict') {
            dictObj = this.data.dict[dict];
          } else {
            dictObj = this.data.storage[dict];
          }
        }
        if (dictObj) {
          v = dictObj[parseInt(v)].code;
          data[`${pack}[${id}].value`] = v;
        } else {
          helperServ.showToast({
            title: `错误提示：在字典${dict}中找不到索引${v}对应的代码`
          });
          return;
        }
      } else if (validx) {
        data[`${pack}[${id}].value${validx}`] = v ;
      } else {
        data[`${pack}[${id}].value`] = v;
      }
      this.setData(data);
      var tmp = pageServ.getData(`${pack}[${id}].value`, this);
      this.triggerEvent("togger", {
        field: {
          id: field.groupid ? field.groupid:field.id,
          group: field.group || '',
          value: tmp && typeof tmp === 'string' && field.suffixvalue ? tmp + field.suffixvalue :tmp
        }
      });
      if (field.conditionshow && field.conditionshow.length > 0) {
        var self = this;
        setTimeout(() => {
          data = {};
          field.conditionshow.forEach((seq, i) => {
            this.conditionShow(field, this.data.enrollinfo[seq], seq, data);
            //console.debug(data);
          });
          if (Object.keys(data).length > 0) {
            this.setData(data);
          }
        }, 0);
      }
      //console.debug(`pack=${pack},id=${id}.value,v=${v},dict=${dict}`, data);
    },
    upLoadFile: function(cb) {
      var img = [],
        imgField = [];
      this.data.enrollinfo.forEach((v, i) => {
        if (v.type == '5' || v.type == 'b' || v.type == 'a' || v.type == 'b1') {
          if (v.value && Array.isArray(v.value)) {
            v.value.forEach(t => {
              if (t.status != '2' && t.path) {
                //console.debug('****will upload*****', t);
                img.push(t);
              }
            })
            //img = img.concat());
          } else if (v.value && v.value.status != '2' && v.value.path) {
            img.push(v.value);
          }
          imgField.push(v);
        }
      })
      if (img.length == 0) {
        cb(null, {
          success: true
        });
        return;
      }
      upimg.batchUpLoadFile(img, this.cloudPath).then(res => {
        //console.debug('batchUpLoadFile enrollinfo', enrollinfo, img);
        this.setData({
          enrollinfo: this.data.enrollinfo
        })
        imgField.forEach(v => {
          this.triggerEvent("togger", {
            field: {
              id: v.groupid ? v.groupid : v.id,
              group: v.group || '',
              value: v.out === '1' ? (v.value&&v.value.fileID):v.value
            }
          });
        });
        if (res.success) {
          cb(null, res);
        } else {
          cb(res.errMsg, res);
        }
      }).catch(err => {
        cb(err.errMsg || err.message, null);
      });
    },
    getArrayValue: function() {
      return this.data.enrollinfo;
    },
    getValue: function(unV) {
      if (!this.properties.moveable && !unV) {
        var field = V.V2(this.data.enrollinfo),
          prefocus = null;
        if (field) {
          var data = {};
          prefocus = this.prefocus;
          if (prefocus !== undefined && prefocus !== null) {
            data[`enrollinfo[${prefocus}].focus`] = false;
            //console.debug('*********enrollinfo prefocus*********', prefocus)
          }
          data[`enrollinfo[${field.fieldid}].focus`] = true;
          this.prefocus = field.fieldid;
          this.setData(data);
          //console.debug('*********enrollinfo V*********', this.data.enrollinfo[field.fieldid])
          /*helperServ.showToast({
            title: field.errMsg,
            icon:'none'
          });*/
          return {
            errMsg: field.errMsg,
            data: null
          };
        }
      }
      var enrollinfo = {};
      if (!this.data.enrollinfo) {
        //return null;
        return {
          errMsg: "空字段列表",
          data: null
        };
      }
      this.data.enrollinfo.forEach((v, i) => {
        v.seq = i;
        enrollinfo[v.id] = v;
        enrollinfo[v.id].focus = false;
      });

      //return enrollinfo;  
      return {
        data: enrollinfo
      };
    },
    goDownStep: function(e) {
      var startIndex = e.target.dataset.index,
        enrollinfo = this.data.enrollinfo;
      if (startIndex + 1 < enrollinfo.length) {
        var src = enrollinfo[startIndex];
        src.seq++;
        var target = enrollinfo[startIndex + 1];
        target.seq--;
        enrollinfo.splice(startIndex, 1); //删除
        enrollinfo.splice(startIndex + 1, 0, src); //加入
        this.setData({
          enrollinfo: enrollinfo
        });
        this.triggerEvent("sort", {
          sortfield: {
            src: {
              id: src.groupid ? src.groupid : src.id,
              group: src.group || '',
              seq: src.seq
            },
            target: {
              id: target.groupid ? target.groupid : target.id,
              group: target.group || '',
              seq: target.seq
            }
          },
          sort: enrollinfo
        });
      }
    },
    /** moveable */
    dragStart: function(event) {
      var startIndex = event.target.dataset.index;
      // 初始化页面数据
      //console.debug(`****touches****`, event.touches[0]);   
      if (event.touches[0].pageY > event.touches[0].clientY) {
        this.data.pageInfo.scrollHeight = `${event.touches[0].pageY + 80}px`;
      } else {
        this.data.pageInfo.scrollHeight = '100%';
      }
      this.setData({
        "movableViewInfo.y": event.touches[0].pageY - (this.data.pageInfo.rowHeight / 2),
        "movableViewInfo.data": this.data.enrollinfo[startIndex].name,
        "movableViewInfo.showClass": "inline",
        "pageInfo.scrollHeight": this.data.pageInfo.scrollHeight,
        "pageInfo.startY": event.touches[0].pageY,
        "pageInfo.startIndex": startIndex,
        "pageInfo.scrollY": false,
        "pageInfo.targetIndex": startIndex,
        "pageInfo.srcIndex": startIndex
      })
    },

    dragMove: function(event) {
      var enrollinfo = this.data.enrollinfo
      var pageInfo = this.data.pageInfo
      // 计算拖拽距离
      var movableViewInfo = this.data.movableViewInfo
      var movedDistance = event.touches[0].pageY - pageInfo.startY
      //movableViewInfo.y = pageInfo.startY - (pageInfo.rowHeight / 2) + movedDistance
      movableViewInfo.y = event.touches[0].pageY - (pageInfo.rowHeight / 2);

      //原位置到目标位置偏移offset
      var offsetIndex = parseInt(movedDistance / pageInfo.rowHeight)

      //目标位置
      var targetIndex = pageInfo.startIndex + offsetIndex
      var len = enrollinfo.length;
      /*console.debug(`moveableY:${movableViewInfo.y},startY:${pageInfo.startY},移动的距离:${movedDistance},srcIndex:${pageInfo.srcIndex},开始位置${pageInfo.startIndex},预计位置移动的${offsetIndex},将要放置的索引${targetIndex},scrollHeight:${pageInfo.scrollHeight}`,len);*/

      if (targetIndex < 0) {
        targetIndex = 0
      } else if (targetIndex >= len) {
        targetIndex = len - 1
      }

      if (targetIndex != pageInfo.srcIndex) {
        console.log(`change posi:${pageInfo.srcIndex} <-> ${targetIndex}`);
        var src = enrollinfo[pageInfo.srcIndex],target = enrollinfo[targetIndex];
        this.triggerEvent("sort", {
          sortfield: {
            src: {
              id: src.groupid ? src.groupid : src.id,
              group: src.group || '',
              seq: targetIndex
            },
            target: {
              id: target.groupid ? target.groupid : target.id,
              group: target.group || '',
              seq: pageInfo.srcIndex
            }
          },
          sort: enrollinfo
        });
        enrollinfo.splice(pageInfo.srcIndex, 1);
        enrollinfo.splice(targetIndex, 0, src);
        pageInfo.srcIndex = targetIndex;
      }
      // 移动movableView
      pageInfo.targetIndex = targetIndex;
      // console.debug('移动到了索引', targetIndex, '选项为', enrollinfo[targetIndex])
      if (movableViewInfo.y > event.touches[0].clientY) {
        pageInfo.scrollHeight = `${movableViewInfo.y + 80}px`;
      } else {
        pageInfo.scrollHeight = '100%';
      }
      this.setData({
        movableViewInfo: movableViewInfo,
        enrollinfo: enrollinfo,
        pageInfo: pageInfo
      })
      // console.debug('************end of dragMove************')
    },

    dragEnd: function(event) {
      //console.debug(`----------------1 dragEnd pageInfo---------------------`, this.data.pageInfo);
      // 重置页面数据
      var pageInfo = this.data.pageInfo
      pageInfo.targetIndex = null
      pageInfo.startY = null
      pageInfo.srcIndex = null
      pageInfo.startIndex = null
      pageInfo.scrollY = true
      //console.debug(`----------------2 dragEnd pageInfo---------------------`, pageInfo);
      //console.debug(`----------------3 dragEnd movableViewInfo---------------------`, this.data.movableViewInfo);
      this.setData({
        pageInfo: pageInfo,
        "movableViewInfo.showClass": 'none'
      })
    },
    delImg: function(e, cb) {
      var id = e.currentTarget.id,
        enroll = this.data.enrollinfo[id],
        initflag = enroll.initflag,
        pack = e.currentTarget.dataset.pack,
        pack = pack ? pack : '',
        imgindex = e.currentTarget.dataset.imgindex;
      pack = `${pack}[${id}]`;
      if (!initflag) {
        //在初始化upimg 对象的时候，不传pack参数，即第三个参数传NULL,需要回调处理页面显示（setData）逻辑
        var img = pageServ.getData(`${pack}.value`, this),
          inValIdx = false;
        if (img && img.length > imgindex && imgindex !== undefined && imgindex !== null && imgindex !== '') {
          img = img[imgindex];
          inValIdx = true;
        }
        if (!img) {
          cb ? cb(null) : null;
          return;
        }
        var upImg = new upimg({}, this, null);
        upImg.delImg(img.fileID, cb ? cb : () => {
          var data = {};
          inValIdx ? data[`${pack}.value[${imgindex}]`] = null : data[`${pack}.value`] = null;
          this.setData(data);
          var all = pageServ.getData(`${pack}.value`, this);
          this.triggerEvent("togger", {
            field: {
              id: enroll.groupid ? enroll.groupid : enroll.id,
              group:enroll.group||'',
              value: enroll.out==='1'?(all&all.map(v=>(v.fileID||v.path))):all
            }
          });
        });
      } else {
        //不需要callback处理回调逻辑，交给upimg处理即可
        if (imgindex === undefined || imgindex === null) {
          helperServ.showModal({
            content: '图片索引为空'
          });
          return;
        }
        var upImg = new upimg({}, this, `${pack}.value`);
        upImg.delImg(imgindex, () => {
          var all = pageServ.getData(`${pack}.value`, this);
          this.triggerEvent("togger", {
            field: {
              id: enroll.groupid ? enroll.groupid : enroll.id,
              group: enroll.group || '',
              value: enroll.out === '1' ? (all & all.map(v => (v.fileID || v.path))) : all
            }
          });
        });
      }
      //cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/goods/tmp/IMGTMP20190727150940695924825d826ce.png
    },

    chooseImg: function(e) {
      var id = e.currentTarget.id,
        imgindex = e.currentTarget.dataset.imgindex,
        imgindex = imgindex || imgindex === 0 ? imgindex : null,
        enroll = this.data.enrollinfo[id],
        imgobj = imgindex !== null && enroll.value ? enroll.value[imgindex] : null,
        upCfg = constants.UPIMG_CFG,
        //initflag = e.currentTarget.dataset.initflag, //initflag:false,在初始化upimg 对象的时候，不传pack参数，即第三个参数传NULL
        initflag = enroll.initflag,
        maxwidth = enroll.maxwidth || (imgobj !== null ? imgobj.width : null),
        maxheight = enroll.maxheight || (imgobj !== null ? imgobj.height : null),
        maxcount = enroll.maxcount,
        pack = e.currentTarget.dataset.pack,
        cutimg = maxwidth || maxheight ? true : upCfg.cutimg,
        scale = enroll.scale,
        maxwidth = maxwidth ? parseInt(maxwidth) : upCfg.maxwidth,
        maxheight = maxheight ? parseInt(maxheight) : upCfg.maxheight,
        maxcount = maxcount ? parseInt(maxcount) : upCfg.maxcount,
        pack = pack ? pack : '',
        self = this;
      if (cutimg && !this.data.showCanvas) {
        this.setData({
          showCanvas: true
        })
      }
      var upImg = new upimg({
        selcount: maxcount,
        compressrate: 1 > upCfg.compressrate > 10 ? 10 : (upCfg.compressrate || 10),
        maxWidth: maxwidth,
        maxHeight: maxheight,
        scale: scale,
        cutImg: cutimg,
        outType: upCfg.imgtype
      }, this, initflag ? `${pack}[${id}].value` : null);

      if (!upImg.init()) {
        //delete upImg;
        return;
      }
      if (initflag) {
        upImg.chooseImg(e, (err, imginfo, all) => {
          this.triggerEvent("togger", {
            field: {
              id: enroll.groupid ? enroll.groupid:enroll.id,
              group: enroll.group || '',
              value: enroll.out === '1' ? (all&&all.map(v=>v.path)):all
            }
          });
        });
      } else {
        //initflag:false,在初始化upimg 对象的时候，不传pack参数，即第三个参数传NULL,需要回调处理页面显示（setData）逻辑
        this.delImg(e, (err, del, delIdx) => {
          upImg.chooseImg(e, (err, curImginfo, srcImgArr) => {
            if (err) {
              return;
            }
            var data = {},
              cur = curImginfo.pop();
            if (!cur) {
              return;
            }
            imgobj != null ? cur.name = imgobj.name || '' : null;
            imgindex !== null ? data[`${pack}[${id}].value[${imgindex}]`] = cur : data[`${pack}[${id}].value`] = cur;
            self.setData(data);
            var all = pageServ.getData(`${pack}[${id}].value`, this);
            this.triggerEvent("togger", {
              field: {
                id: enroll.groupid ? enroll.groupid : enroll.id,
                group: enroll.group || '',
                value: enroll.out === '1' ? (all && all.map(v => v.path)) : all
              }
            });
          })
        });
      }
    },
    /*
    chooseImg2: function (e) {
      this.cloudPath = `action/${this.properties.actionid}/`;
      if (this.upimg) {
        delete this.upimg;
      }
      var id = e.currentTarget.id,
        v = e.detail.value,
        pack = e.currentTarget.dataset.pack ? e.currentTarget.dataset.pack : '',
        imgindex = e.currentTarget.dataset.imgindex ? e.currentTarget.dataset.imgindex : '',
      enrollinfo = this.data.enrollinfo[id];
      this.upimg = new upimg({
        selcount: enrollinfo.maxcount || maxCount,
        compressrate: 10,
        maxWidth: enrollinfo.maxwidth || maxWidth,
        maxHeight: enrollinfo.maxheight || maxHeight,
        outType: enrollinfo.imgtype || "jpg"
      }, this, `${pack}[${id}].value`);
      if (!this.upimg.init()) {
        delete this.upimg;
        return;
      }
      var self = this;
      this.upimg.setCloudPath(this.cloudPath);
      if (imgindex === '0' || imgindex ==='1'){
        this.delImg(e,(err,delImg,delIdx)=>{
          this.upimg.chooseImg(e, (err,imginfo,all) => {
            if(err){
              return;
            }
            var adjust =  imginfo.pop();
            if(!adjust){
              return;
            }
            all.pop();
            all.splice(imgindex,0,adjust);  
            var data={}; 
            data[`${pack}[${id}].value`] = all;
            self.setData(data);
          })
        });
      } else {
        this.upimg.chooseImg(e, (err,imginfo) => {
          //console.debug('upImg.chooseImg',imginfo);
        })
      }
    },
    */
    getCloudPath: function() {
      return this.cloudPath;
    },
    setCloudPath: function(cloudPath) {
      return this.cloudPath = cloudPath;
    },
    addData: function(dictid, storage) {
      if (!dictid || dictid.length ===0){
        this.setData({
          showCanvas: this.data.showCanvas,
          storage: storage||{}
        });
        return;
      }
      cache.getDict(dictid, (err, res) => {
        if (err) {
          return;
        }
        if (storage) {
          this.setData({
            showCanvas: this.data.showCanvas,
            storage: storage,
            dict: res
          })
        } else {
          this.setData({
            showCanvas: this.data.showCanvas,
            dict: res
          })
        }
      })
    },
    suffixHandle: function (field, dictid){
      if (field.suffix&&!Array.isArray(field.suffix)) {     
        const dictlist = cache.getDict([field.suffix], (err, res) => {
          if (err) {
            return;
          }        
          field.suffix = res[field.suffix];
          if (!field.value) {
            field.value='';
            return;
          }
          const tmparr = field.suffix.map(v=>v);
          tmparr.sort((a,b)=>{return b.code.length-a.code.length;})      
          tmparr.forEach(v=>{
            const idx = field.value.lastIndexOf(v.code);
            if(idx > 0){
              field.suffixvalue = field.value.substr(idx);
              field.value = field.value.substr(0, idx);
            }
          });
        });
      } else {
        if (!field.value) {
          field.value = '';
          return;
        }
        const tmparr = field.suffix.map(v => v);
        tmparr.sort((a, b) => { return typeof v == 'object' ? (b.code.length - a.code.length):(b.length-a.length);})
        tmparr.forEach(v => {
          const idx = field.value.lastIndexOf(typeof v =='object' ? v.code:v);
          if (idx > 0) {
            field.suffixvalue = field.value.substr(idx);
            field.value = field.value.substr(0,idx);
          }   
        });
      }
    },
    /** enrolldata is Array */
    initEnroll: function(enrolldata, conditionshow, enrollmap) {
      var dictid = [],
        storage = {},
        storagelen = 0,
        dictidx = null;
      this.data.showCanvas = false;
      /*
        e_cache = null,
        arrC = restore.getEnrollInfo(this.properties.actionid);
      if (arrC) {
        e_cache = arrC.reduce((result, cur, arr) => {
          result[cur.id] = cur;
          return result;
        }, {});
      }*/
      for (var k in enrolldata) {
        var enroll = enrolldata[k];
        enroll.seq = k;
        if(enroll.suffix){
          this.suffixHandle(enroll, dictid);
        }
        //e_cache && e_cache[k] && e_cache[k].value ? enroll.value = e_cache[k].value : null;
        if (enroll.type === '5' || enroll.type === 'a' || enroll.type === 'b'|| enroll.type === 'b1') {
          !this.data.showCanvas ? this.data.showCanvas = true : null;
          enroll.type === '5' ? enroll.initflag = false : (enroll.initflag === undefined ? enroll.initflag = true : null);
          //需要不压缩的图片 20200301 xjm
          /*if (!enroll.maxwidth) {
            enroll.maxwidth = this.data.canvasWidth;
            enroll.scale = true;
          }
          if (!enroll.maxheight) {
            enroll.maxheight = this.data.canvasHeight;
            enroll.scale = true;
          }*/
          console.debug("*****image enroll*****", enroll);
        } else if (enroll.type == '3') {
          dictidx = enroll.dictlist;
          if (Array.isArray(dictidx)) {
            enroll.dict = '';
          } else if (enroll.dict == 'dict') {
            dictid.push(dictidx);
          } else if (enroll.dict == 'storage') {
            storagelen++;
            storage[dictidx] = helperServ.getStorageSync(dictidx);
          }
        } else if (enroll.type == 'm') {
          if (enroll.dict == 'dict') {
            if(typeof enroll.dictlist === "object"){
              enroll.checkbox = enroll.dictlist;
            } else {
              enroll.checkbox = cache.getDict([enroll.dictlist], (err, res) => {
                enroll.checkbox = res ? res[enroll.dictlist] : null;
              });
              enroll.checkbox = enroll.checkbox ? enroll.checkbox[enroll.dictlist] : null;
            }
          } else if (enroll.dict == 'storage') {
            enroll.checkbox = helperServ.getStorageSync(enroll.dictlist);
          }
          //多选，单选
          if (enroll.value && enroll.value.length > 0) {
            if (enroll.checktype !== '0') {
              //多选处理
              if (!enroll.mapcheckbox) {
                enroll.mapcheckbox = {};
                enroll.checkbox.forEach(v => {
                  enroll.mapcheckbox[v.code] = v;
                })
              }
              //设置为选择态
              enroll.value.forEach((v, i) => {
                enroll.mapcheckbox[v].active = true;
              });
            } else {
              //单选处理，注意 enroll.out === '1' 单选输出字符串，非数组
              var f, idx;
              f = enroll.checkbox.find((v, i) => {
                idx = i;
                return v.code == (enroll.out === '1' ? enroll.value:enroll.value[0]);
              });
              if (f) {
                enroll.checkbox[idx].active = true;
                enroll.preactive = idx;
              }
            }
          }
        }
        /*if (enroll.conditionshow && enroll.conditionshow.length > 0) {
          //存储条件显示控制字段
          conditionshow.push(enroll.seq);
        }*/
        if (enroll.condition) {
          var exp = this.getExpression(enroll);
          if (!exp) {
            continue;
          } else if (exp.errMsg) {
            helperServ.showModal({
              content: exp.errMsg
            });
            return;
          }

          exp = exp.expression;
          var src_seq = -1;
          //或者控制者字段
          var src = enrollmap ? enrollmap[exp[0]] : enrolldata.find((v, seq) => {
            src_seq = seq;
            return v.id == exp[0];
          });

          if (!src) {
            helperServ.showModal({
              content: `${exp[0]}录入条件字段不存在`
            });
            return;
          }
          if (src_seq == -1) {
            src_seq = src.seq;
            if (enrolldata[src_seq] && enrolldata[src_seq].seq != src_seq) {
              helperServ.showToast({
                icon: 'none',
                title: `${src.id}条件字段序号[${src.seq}]!=[${enrolldata[src_seq].seq}]编写错误`
              });
              console.warn(`${src.id}条件字段序号[${src.seq}]!=[${enrolldata[src_seq].seq}]编写错误`);
              //修正src_seq
              enrolldata.find((v, seq) => {
                src_seq = seq;
                return v.id == src.id;
              });
              console.warn(`${src.id}条件字段序号[${src.seq}]!=[${enrolldata[src_seq].seq}],实际序号为${src_seq}`);
            }
          }
          if (!src.expressionshow) {
            src.expressionshow = {};
            src.expressionshow[enroll.id] = exp;
          } else {
            src.expressionshow[enroll.id] = exp;
          }

          if (!src.conditionshow || src.conditionshow.length == 0) {
            src.conditionshow = [];
            src.conditionshow.push(k); //初始化需要控制的字段序号
            conditionshow.push(src_seq); //初始化控制者的字段序号          
          } else {
            src.conditionshow.push(k); //enroll.seq
          }
          console.debug('****conditionshow*******', conditionshow, src)
        }
      }
      if (storagelen > 0) {
        this.addData(dictid, storage);
      } else {
        this.addData(dictid);
      }
    }
  },

  observers: {
    'enrolldata': function(enrolldata) {
      console.debug(`*********observers enrolldata**********`);
      if (!enrolldata) {
        return;
      }
      var conditionshow = [];
      if (!Array.isArray(enrolldata)) {
        var tmp = Object.values(enrolldata);
        tmp.sort((a, b) => {
          return a.seq - b.seq;
        });
        this.initEnroll(tmp, conditionshow, enrolldata);
        this.setData({
          enrollinfo: tmp
        })
        //console.debug("^^^^^^^^^^^^^^^^", tmp);
      } else {
        this.initEnroll(enrolldata, conditionshow);
        this.setData({
          enrollinfo: enrolldata
        })
      }
      if (conditionshow.length > 0) {
        //console.debug("@@@@@@@@@@@@", conditionshow);
        setTimeout(() => {
          var data = {},
            enrollinfo = this.data.enrollinfo,
            field = null;
          conditionshow.forEach((seq, i) => {
            field = enrollinfo[seq];
            field.conditionshow ? field.conditionshow.forEach((cseq, i) => {
              this.conditionShow(field, enrollinfo[cseq], cseq, data);
              //console.debug(data);
            }) : null;
          });
          if (Object.keys(data).length > 0) {
            this.setData(data);
          }
        }, 0);
      }
    },
  }
})