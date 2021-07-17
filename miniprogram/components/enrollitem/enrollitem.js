var cache = require("../../lib/utils/cache.js");
var helperServ = require("../../lib/utils/helper.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    fielditem:{
      type:Object,
      value:null
    },
    index:{
      type:String,
      value:null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showDlg:false,
    field:null,
    dict:null
  },
  lifetimes: {
    attached: function () {
      cache.getDict(["200002","200003"],(err,res)=>{
        this.setData({
          dict:res||null
        })
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getValue:function(){
      return this.data.field;
    },
    delField:function(e){

    },
    fieldInit:function(id,v){
      var field = this.data.field;
      if (field.type === 'b' || field.type === 'a') {
        field.initflag = true;
        if (id === 'field.maxcount' && v > 12) {
          helperServ.showToast({
            title: `错误提示：最多可允许12张图片`
          });
          return false;
        }
      } else if (field.type === '5') {
        field.initflag = true;
      } else if(field.type==='m' || field.type==='3'){
        field.dict = "dict";
      }
      return true;
    },
    inputTogger: function (e) {
      var  v = e.detail.value,       
        id = e.currentTarget.dataset.id,    
        data = [],
        dict = e.currentTarget.dataset.dict;
      if (!this.fieldInit(id,v)){
        return;
      }
      if (dict) {
        //dict = JSON.parse(dict);
        var dictObj = null;
        if (typeof dict == "object") {
          dictObj = dict;
        } else {
          dictObj = this.data.dict[dict];
        }
        if (dictObj) {
          data[`${id}`] = dictObj[parseInt(v)].code;
        } else {
          helperServ.showToast({
            title: `错误提示：在字典${dict}中找不到索引${v}对应的代码`
          });
          return;
        }
      } else {
        data[`${id}`] = v;
      }
      this.setData(data);
      console.debug(`id=${id},v=${v},dict=${dict}`, data); 
    },
    showOptionsView: function (e) {
      this.setData({
        showDlg: !this.data.showDlg
      });
      if(this.data.field.dictlist.length == 0){
        this.addOptions(null);
      }
    },
    inputOptionsTogger: function (e) {
      var id = e.currentTarget.id,
        v = e.detail.value,
        index = e.currentTarget.dataset.index ? e.currentTarget.dataset.index : 0,
        code = e.currentTarget.dataset.code ? e.currentTarget.dataset.code : '',       
        data = [];
      console.debug(`id=${id},v=${v}`, data);
      data[`${id}`] = v;
      data[`${code}`] = index;
      this.setData(data);
      console.debug(`inputOptionsTogger name=${id},code=${code}`, this.data);
    },
    delOptions: function (e) {
      var index = e.currentTarget.dataset.index ? e.currentTarget.dataset.index : 0,
        data = [];
      this.data['field'].dictlist.splice(index, 1);
      for (var i in this.data['field'].dictlist) {
        this.data['field'].dictlist[i].code = i++;
      }
      data[`field.dictlist`] = this.data['field'].dictlist;
      this.setData(data);
    },
    addOptions: function (e) {
      var data = {};
      if (!this.data.field["dictlist"]) {
        console.debug(`dictlist is null`, this.data.field);
        this.data.field["dictlist"] = [];
      }
      this.data.field["dictlist"].push({
        desc: this.data.field.name || ''
      });

      data[`field.dictlist`] = this.data.field["dictlist"];
      this.setData(data);
      console.debug(`addOptions ${this.data.field}`, data);
    },
  },
  observers: {
    'fielditem': function (fielditem) {
      if (!fielditem) {
        return;
      }
      //console.debug('action observers field');
      this.setData({
        field: fielditem
      })
    },
  }
})
