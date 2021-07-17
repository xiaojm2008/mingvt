var helperServ = require("../../lib/utils/helper.js");
var cache = require("../../lib/utils/cache.js");
var mySeq = require("../../lib/utils/mySeq.js");
var upimg = require("../../lib/utils/upimg.js");
var constants = require("../../lib/comm/constants.js");
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type:{
      type: String,
      value: null
    },
    cate:{
      type: String,
      value: null
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    temptype:null,
    category:null,
    unexpected_temp_fieldid: { "_id": true, "tempid": true, "openid": true,"temptype":true,"category":true,"desc":true },
    templateField:null,
    enrollinfo:{},
    fieldItem: null,//正在编辑的字段
    templateid:0,
    templateSt: {
      show: false,
      edit: false,
      add: false,
      del: false,
      mod: false
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setPgData:function(data){
      if (!pgContext || !pack){
        return;
      }
      pgContext(data);
    },
    showDlg: function (options){
      helperServ.showLoading({content:"数据加载中..."})
      //如果Storage中存储了，那么就不要Cache
      cache.fieldTemplate({ temptype: this.data.temptype, category: this.properties.category },(err,arr) => {
        helperServ.hideLoading();
        if (!err){
          this.setData({
            templateField: arr,
            templateid: 0,
            windowHeight:app.systemInfo.windowHeight,
            'templateSt.show': true,
            'enrollinfo': options.enrollinfo,
            'btntext': options.btntext || ['提交'],
            'submit': options.submit || null
          })
          this.initTemplateFieldSelective(options.enrollinfo, this.data.templateField);
        } else {
          helperServ.showModal({ content: err});
        }
      });     
    },
    hideDlg: function () {
      this.setData({
        'templateSt.show': false
      });
    },
    //设置模板选择态
    initTemplateFieldSelective: function (enrollinfo, template) {
      if (!template || template.length == 0) {
        return;
      }
      template.forEach((v, i) => {
        for (var k in v) {
          if (this.data.unexpected_temp_fieldid[k]) {
            continue;
          }
          if (enrollinfo[k] && enrollinfo[k].tempid === i) {
            v[k].active = true;
          } /*else {
          v[k].active = false;
        }*/
        }
      })
      this.setData({
        templateField: template,
        enrollinfo: enrollinfo
      });
    },
    //表单模板切换
    hTabTogger: function (e) {
      //console.log('tabid', e.currentTarget.dataset);
      var tabid = parseInt(e.currentTarget.dataset.tabid);
      this.setData({
        templateid: tabid
      })
    },
    //showOperBtnTemplate 点击编辑
    showEditTemplate: function () {
      var data = {}, tid = this.data.templateid;
      data['templateSt.edit'] = true;
      if (true) {
        //编辑态
        for (var k in this.data.templateField[tid]) {
          if (this.data.unexpected_temp_fieldid[k]) {
            continue;
          }
          this.data.templateField[tid][k].active = false;
        }
        this.currentEditTemplate = null;
        data[`templateField[${tid}]`] = this.data.templateField[tid];
        this.setData(data);
      } /*else {
      this.initTemplateFieldSelective(this.data.enrollinfo, this.data.templateField);
    }*/
    },
    showSelectTempFieldDlg: function () {
      this.setData({
        'templateSt.edit': false,
        'templateSt.add': false, //编辑态输入态(即修改与新增)false showEnrollItemInput
        'templateSt.mod': false, //编辑态输入态(即修改与新增)false showEnrollItemInput
        'templateSt.del': false, //
      });
      this.initTemplateFieldSelective(this.data.enrollinfo, this.data.templateField);
    },
    //保存到我的模板
    saveToMyTemplate: function (e) {
      var field = this.selectComponent('#myEnrollItem').getValue();
      field.active = false;
      cache.fieldTemplateAdd({ temptype: this.data.temptype, category: this.data.category, field: field }, (err, res) => {
        if (!err) {
          var data = {};
          data[`templateField[${field.tempid}].${field.id}`] = field;
          data['templateSt.edit'] = false;//selectTemplate
          data['templateSt.add'] = false;
          data['templateSt.mod'] = false;
          data['templateSt.del'] = false;
          this.setData(data);
        }
        console.debug("saveToMyTemplate err:", err, res);
        field.active = true;
        this.addField(null, field);
        if (!this.data.templateField[field.tempid]) {
          this.data.templateField[field.tempid] = {};
        }
        this.data.templateField[field.tempid][field.id] = field;
      });
    },
    //新增我的字段
    addNewFieldToTemplate: function (e, modItem) {
      var field_key = null;
      var field_val = null;
      var data = {};

      if (modItem) {
        field_key = modItem.id;
        field_val = modItem;
        field_val.active = false;
        data['templateSt.mod'] = true;
      } else {
        field_key = mySeq.S4() + mySeq.S4() + mySeq.S4() + mySeq.S4();
        field_val = {
          "id": field_key,
          "active": false,
          "label":true,
          "tempid": this.data.templateid,
          "name": "",
          "type": "",
          "required": "O",
          "dict": "",
          "dictlist": [],
          "default": null,
          "placeholder": "",
          "desc": "",
          "seq": 0
        };
        data['templateSt.add'] = true;
      }
      //初始化enrollitem自定义组件内容，触发fielItem
      data['fieldItem'] = field_val;
      this.setData(data);
    },
    //修改我的模板字段
    modNewFieldToTemplate: function (e) {
      if (!this.currentEditTemplate) {
        helperServ.showToast({ title: "请选择需要修改的字段" });
        return;
      }
      this.addNewFieldToTemplate(null, this.currentEditTemplate);
    },
    delNewFieldToTemplate: function (e) {
      if (!this.currentEditTemplate) {
        helperServ.showToast({ title: "请选择需要删除的字段" });
        return;
      }
      var self = this, del = {
        _id: self.data.templateField[self.data.templateid]._id,
        tempid: self.currentEditTemplate.tempid,
        fieldid: self.currentEditTemplate.id
      };
      helperServ.showModal({
        content: `请确认是否删除【${this.currentEditTemplate.name}】字段`, success(res) {
          if (res.confirm) {
            cache.fieldTemplateDel({ temptype: self.data.temptype, category: self.data.category, field: del }, (err, res) => {
              if (!err) {
                var data = {};
                delete self.data.templateField[del.tempid][del.fieldid];
                data[`templateField[${del.tempid}]`] = self.data.templateField[del.tempid];
                data['templateSt.edit'] = false;//selectTemplate
                data['templateSt.add'] = false;
                data['templateSt.mod'] = false;
                data['templateSt.del'] = false;
                self.setData(data);
              }
            });
          }
        }
      })
    },
    cancelCurrentEdit: function () {
      this.setData({
        'templateSt.edit': true,
        'templateSt.add': false,
        'templateSt.mod': false,
        'templateSt.del': false
      })
    },
    showTemplateFieldDlg: function () {
      this.setData({
        'templateSt.show': !this.data.templateSt.show,
        'templateSt.edit': false //selectTemplate
      });
    },
    addFieldFromTemplate: function (e) {
      var index = e.currentTarget.dataset.index;
      var item = this.data.templateField[this.data.templateid][index];
      item.tempid = this.data.templateid;
      this.currentEditTemplate = null;
      if (this.data.templateSt.edit) {
        //编辑状态，不能选择
        this.currentEditTemplate = item;
        for (var k in this.data.templateField[this.data.templateid]) {
          if (this.data.unexpected_temp_fieldid[k]) {
            continue;
          }
          this.data.templateField[this.data.templateid][k].active = false;
        }
        item.active = !item.active;
        var data = {};
        data[`templateField[${this.data.templateid}]`] = this.data.templateField[this.data.templateid];
        this.setData(data);
      } else {
        if (!item.active) {
          this.addField(null, item);
          item.active = true;
        } else {
          item.active = false;
          this.delField({
            currentTarget: {
              dataset: {
                index: item.id
              }
            }
          });
        }
        //console.log(`addFieldFromTemplate ${index}:${item.active}`, item);
        var data = {};
        data[`templateField[${this.data.templateid}].${index}.active`] = item.active;
        this.setData(data);
      }
    },
    addField: function (e, item) {
      var enrollinfo = this.data.enrollinfo;
      var keys = Object.keys(enrollinfo);
      if (keys.length >= 150) {
        helperServ.showModal({
          title: '提示',
          content: '最多只能150'
        })
        return;
      }
      var field_key = null;
      var field_val = item;
      if (e) {
        field_key = mySeq.S4() + mySeq.S4() + mySeq.S4() + mySeq.S4();
        field_val = {
          "id": field_key,
          "label":true,
          "name": "",
          "type": "",
          "required": "O",
          "dict": "",
          "dictlist": [],
          "default": null,
          "desc": "",
          "seq": keys.length
        };
      } else {
        //from template
        field_key = field_val.id;
        field_val.seq = keys.length;
      }
      var data = {
        enrollinfo: enrollinfo
      };
      data.enrollinfo[field_key] = field_val;
      this.setData(data);
      //console.log(`addField:${field_key}`, e);
    },
    delField: function (e) {
      var enrollinfo = this.data.enrollinfo;
      var index = e.currentTarget.dataset.index; //=field.id
      var tempid = enrollinfo[index].tempid;
      //如果字段来自模版，获取模板ID
      if (typeof tempid !== "undefined" && tempid !== null && this.data.templateField[tempid][index]) {
        //console.log(`set ${tempid} templated field ${index} active false`, enrollinfo[index]);
        //this.data.templateField[enrollinfo[index].tempindex].active = false;
        var active = {};
        active[`templateField[${tempid}].${enrollinfo[index].id}.active`] = false;
        this.setData(active);
      }
      //console.log(`set temp field active ${index} false`, this.data.templateField);
      delete enrollinfo[index];
      //console.log(`delField later ${index}`, enrollinfo);
      /*
      var tmp = {};
      var keys = Object.keys(enrollinfo),i = this.fieldBaseIdx;
      for (var k in keys) {
        tmp[`FIELD_${++i}`] = enrollinfo[keys[k]];
        tmp[`FIELD_${i}`].id = `FIELD_${i}`;
      }
      console.log(`delField copy ${index}`, tmp);
      */
      this.setData({
        enrollinfo: enrollinfo
      });
    },
    submit: function (e) {
      if (this.data.templateSt.add || this.data.templateSt.mod){
        if (e.currentTarget.dataset.index === 1){
          this.saveToMyTemplate();
        } else {
          helperServ.showModal({
            title: '提示',
            content: '编辑态不能【取消】'
          })
        }
      } else if (typeof this.data.submit == 'function') {
        e.btnindex = e.currentTarget.dataset.index;
        e.enrollinfo = this.data.enrollinfo;
        this.data.submit(e, (err, res) => {
          if (!err) {
            this.hideDlg();
          }
        });
      }
    },
  },
  observers: {
    'type': function (type) {
      //console.log("***********", type);
      if (!type) {
        return;
      }
      this.setData({
        temptype: type,
        dict: cache.dict()
      });
      //从服务器中获取并且Cache到Storage
      cache.fieldTemplateCache({ temptype: type, category: this.properties.category }).then(res => {
      });
      /*
      cache.fieldTemplateCache({ temptype: type, category: this.properties.category }).then(res => {
        this.setData({
          temptype: type,
          dict: cache.dict(),
          templateField: res.data
        });
      });*/
    },
    
    'cate': function (cate) {
      //console.log("***********", cate);
      if (!cate || cate =='||') {
        return;
      }
      this.setData({
        category: cate
      });
      /*
      cache.fieldTemplateCache({ temptype: this.properties.type, category: cate }).then(res => {
        this.setData({
          category: cate,
          dict: cache.dict(),
          templateField: res.data
        });
      });  */
    },
  }
})
