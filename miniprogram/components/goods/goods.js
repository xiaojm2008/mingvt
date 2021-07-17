const goodsServ = require("../../lib/services/goods.js");
const helperServ = require("../../lib/utils/helper.js");
const cache = require("../../lib/utils/cache.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const cartServ = require("../../lib/services/cart.js");
const orderServ = require("../../lib/services/order.js");
const favorServ = require("../../lib/services/favor.js");

const DEFAULT_MID = "defaultMID";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsno: {
      type: "String",
      value: null
    },
    goodsinfo: {
      type: "Object",
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    projectid: null,
    goods: null,
    selSubs: '',//选择的型号KEY字符串组合（逗号分隔）
    //states: null, //产地 storagekey: STKEY_STATEINFO 参考 comm.getState
    showPDlg: false,
    cartGoodsNum: 0,
    additional:{
      isfavor:false,//是否收藏
    },   
    dict: {
      "100000": null,
      "100001": null,
      "100002": null,
      "100003": null,
      "100004": null,
      "100010": null,
      "100011": null,
      "100014": null,
    }
  },
  lifetimes: {
    ready: function() {
      this.submodels = {};     
      pageServ.loadDict(this);
      pageServ.loadStateInfo(this);
    }
  },
  pageLifetimes: {
    show: function() {
      cartServ.getCartNum().then(res => {
        this.setData({
          cartGoodsNum: res.result.total||0
        })
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    addFavor(e){
      helperServ.showLoading();
      favorServ.addFavor({favor_tp:'1',favor_id:this.data.goods.goodsno}).then(res=>{
        helperServ.hideLoading();
        helperServ.showToast({title:res.result.errMsg,icon:'none'});
        if(res.result.success){
          this.setData({
            "additional.isfavor":1            
          })
        }
      }).catch(err=>{
        helperServ.hideLoading();
        helperServ.showToast({title:err.errMsg||err.message,icon:'none'});
      })
    },
    initSelModel: function(data) {
      var goods = this.data.goods,
        subm, keys, m, data = data ? data : {},
        modelitem,goodsModels = this.data.goodsModels;
      this.models_mainkey_idx = goods.models_mainkey_idx;

      for (var k in goodsModels) {
        m = goodsModels[k].id;        
        if (goods.models_mainkey && goods.models_mainkey===m){
          //获取型号对应的图片位置索引
          if(this.models_mainkey_idx != k){
            helperServ.showToast({icon:'none',title:`${goods.models_mainkey}对应的modelkey${this.models_mainkey_idx}:${k}索引不匹配：`})
          }
        }
        subm = goods.models[m].submodels;
        keys = pageServ.toKeys(subm, 1);
        //this.submodels[m] = keys[0];
        this.submodels[k] = keys[0];
        goods.models[m].selective = true;
        subm[keys[0]].selective = true;
        goods.models[m].preSubIdx = keys[0];
        goods.models[m].preIdx = m;
        /*data[`goods.models.${m}.selective`] = true;
        data[`goods.models.${m}.submodels.${keys[0]}.selective`] = true;
        */
        data[`goodsModels[${k}].selective`] = true;
        data[`goodsModels[${k}].submodels.${keys[0]}.selective`] = true;
      }
      var _submodels = Object.values(this.submodels);
      data['selSubs'] = _submodels.toString();
      modelitem = goods.modelitems[data.selSubs];
      if (!modelitem.stock || modelitem.stock <= 0) {
        data[`goods.modelitems.${data.selSubs}.buynum`] = 0;
      } else {
        data[`goods.modelitems.${data.selSubs}.buynum`] = 1;
      }
      if (!modelitem.picpath || !modelitem.picpath.fileID || !modelitem.picpath.path){
        if (goods.models_mainkey){
          /*
          submodels 是 Object,非Array
          submodels:{
            models_key0:submodel_key00,01,02...等等
            models_key1:submodel_key10,11,12...等等
            models_key2:submodel_key20,21,22...等等
          }
          其中:
          models_key 是 goods.models 的KEY
          submodel_key 是 goods.models[models_key].submodels 的KEY
           Object.values(submodels)就是：
           "submodel_key00,submodel_key10,submodel_key20"
          即：goods.modelitems 的 KEY
          goods.models_mainkey 商品主型号索引（对可对主型号上传图片，即主型号的图片索引）
          */
          //var img_key = this.submodels[goods.models_mainkey],
          var img_key = this.submodels[goods.models_mainkey_idx],
          pic = goods.models[goods.models_mainkey].submodels[img_key].picpath;
          data[`goods.modelitems.${data.selSubs}.picpath.fileID`] =pic?(pic.fileID||pic.path):goods.picpath[1].fileID;
        }
      }
      return data;
    },

    hideMDlg: function() {
      pageServ.hideDlg({
        'showMDlg': false
      }, this);
    },

    showMDlg: function(e) {    
      var opertype = typeof e == 'object' ? e.currentTarget.dataset.opertype || '0' : this.data.opertype || '0';
      if (!this.data.modelitems || this.data.modelitems.length < 2) {

      }
      if (this.data.showMDlg) {
        this.hideMDlg();
        return;
      }
      var data = {};
      data['showMDlg'] = !this.data.showMDlg;
      data['opertype'] = opertype;//两种操作：添加购物车和直接下单购买
      if (!this.data.selSubs) {
        data = this.initSelModel(data);
      }
      this.setData(data);
      pageServ.showDlg(this);
    },
    /**
     * goods.ensure
     */
    showEDlg: function() {

      this.selectComponent("#enrollDetail").show({
        title:"基础保障",
        type:"1", //复杂类型，可以显示图片
        enrollinfo:this.data.goods.ensure
      });
      /*
      if (this.data.showEDlg) {
        pageServ.hideDlg({
          'showEDlg': false
        }, this);
        return;
      }
      this.setData({
        showEDlg: true
      });
      pageServ.showDlg(this);*/
    },
    /**
     * goods.parameter
     */
    showPDlg: function() {
      this.selectComponent("#enrollDetail").show({
        title:"产品参数",
        type:"0", //简单类型显示，只可以显示文本，不可以显示图片
        enrollinfo:this.data.goods.parameter
      });
      /*
      if (this.data.showPDlg) {
        pageServ.hideDlg({
          'showPDlg': false
        }, this);
        return;
      }
      this.setData({
        showPDlg: true
      });
      pageServ.showDlg(this);*/
    },
    selectSubModel: function(e) {
      var idx = e.currentTarget.dataset.idx,//models Object key
        subidx = e.currentTarget.dataset.subidx,
        goods = this.data.goods;//models.submodels Object key
      var model = goods.models[idx],
         seq = model.seq,
         //submodel =model.submodels[subidx],
        data = {};
      if (model.preSubIdx !== undefined && model.preSubIdx !== null) {
        //data[`goods.models.${model.preIdx}.submodels.${model.preSubIdx}.selective`] = false;
        //this.submodels[model.preIdx] = null;
        var _seq = goods.models[model.preIdx].seq;
        data[`goodsModels[${_seq}].submodels.${model.preSubIdx}.selective`] = false;
        this.submodels[_seq] = null;
      }
      /*
      data[`goods.models.${idx}.selective`] = true;
      data[`goods.models.${idx}.submodels.${subidx}.selective`] = true;
      */
     data[`goodsModels[${seq}].selective`] = true;
     data[`goodsModels[${seq}].submodels.${subidx}.selective`] = true;

      model.preSubIdx = subidx;
      model.preIdx = idx;
      if (!this.submodels) {
        this.submodels = {};
      }
      this.submodels[seq] = subidx;
      //Object.values 是 submodels key 数组集合[k00,k01,k02]
      //Object.keys 是 models key 数组集合
      var vals = pageServ.toValues(this.submodels),
        stock = 0;
      if (vals.length == Object.keys(goods.models).length) {
        data[`selSubs`] = vals.toString();//集合[k00,k01,k02]转字符串
        var modelitem = goods.modelitems[data.selSubs];
        stock = modelitem.stock;
        if (!stock || stock <= 0) {
          data[`goods.modelitems.${data.selSubs}.buynum`] = 0;
        } else {
          data[`goods.modelitems.${data.selSubs}.buynum`] = modelitem.buynum || 1;
        }       
        if (!modelitem.picpath || !modelitem.picpath.fileID || !modelitem.picpath.path) {
          if (goods.models_mainkey) {
            //var img_key = this.submodels[goods.models_mainkey],   
            var img_key = this.submodels[goods.models_mainkey_idx],     
            pic = goods.models[goods.models_mainkey].submodels[img_key].picpath;
            data[`goods.modelitems.${data.selSubs}.picpath.fileID`] = pic ? (pic.fileID || pic.path) : goods.picpath[1].fileID;
          }
        }
      }
      //console.debug("*********", data, vals, vals.toString());
      this.setData(data);
    },
    clickMinus: function(e) {
      var count = this.data.goods.modelitems[this.data.selSubs].buynum,
        data = {};
      if (count <= 1) {
        return;
      }
      data[`goods.modelitems.${this.data.selSubs}.buynum`] = --count;
      this.setData(data);
    },
    clickPlus: function(e) {
      var count = this.data.goods.modelitems[this.data.selSubs].buynum || 1,
        stock = this.data.goods.modelitems[this.data.selSubs].stock || 0,
        data = {};
      if (count >= stock) {
        return;
      }
      data[`goods.modelitems.${this.data.selSubs}.buynum`] = ++count;
      this.setData(data);
    },
    addToCart: function() {
      if (!helperServ.getUserInfo()) {
        helperServ.goToPage("/pages/login/login");
        return;
      }
      var buynum = this.data.goods.modelitems[this.data.selSubs].buynum;
      if (!buynum || buynum == 0) {
        helperServ.showToast({
          icon: 'none',
          title: '该商品的型号没有货，请选择其他型号'
        });
        return;
      }
      var param = {
          cover: this.data.goods.modelitems[this.data.selSubs].picpath.fileID,
          goodsno: this.data.goods.goodsno,
          model_id: DEFAULT_MID === this.data.selSubs ? '' :this.data.selSubs,
          model_value: DEFAULT_MID === this.data.selSubs ? '' :this.data.goods.modelitems[this.data.selSubs].subname,//蓝色|M160-165|尼纶纤维
          models_mainkey: this.data.goods.models_mainkey||'',
          models_mainkey_idx: this.models_mainkey_idx,
          support_drawback: this.data.goods.support_drawback,
          num: buynum
        };
      helperServ.showLoading({ title: '请求中...'});
      cartServ.addCart(param).then((res) => {
        helperServ.hideLoading();
        if (res.result.success) {
          this.setData({
            "showMDlg": false,
            cartGoodsNum: this.data.cartGoodsNum + param.num
          });
        }
        helperServ.showModal({
          content: res.result.errMsg,
        });
      }).catch(err => {
        helperServ.hideLoading();
        helperServ.showModal({
          content: err.errMsg || res.message
        });
      });
    },
    toBuy: function(e) {
      if (!helperServ.getUserInfo()) {
        helperServ.goToPage("/pages/login/login");
        return;
      }
      var goodsInfo = [],
        modelitem = this.data.goods.modelitems[this.data.selSubs];
      if (!modelitem.buynum || modelitem.buynum == 0) {
        helperServ.showToast({
          icon: 'none',
          title: '该商品的型号没有货，请选择其他型号'
        });
        return;
      }
      var that = this,
        param = {
          cover: modelitem.picpath.fileID,
          shopid: this.data.goods.shopid,
          shopname: this.data.goods.shopname,
          goodsno: this.data.goods.goodsno,
          goodsname: this.data.goods.goodsname,
          model_id: DEFAULT_MID===this.data.selSubs?'':this.data.selSubs,//型号编号,逗号分隔
          model_value: DEFAULT_MID === this.data.selSubs ? '':modelitem.subname, //哪种型号（蓝色|M160-165|尼纶纤维）
          models_mainkey: this.data.goods.models_mainkey||'',
          models_mainkey_idx: this.models_mainkey_idx,
          num: modelitem.buynum,
          price: modelitem.price,
          support_drawback: this.data.goods.support_drawback
        };

      var data = encodeURIComponent(JSON.stringify(Object.assign({
        order_id: null,
        shopid: param.shopid,
        shopname: param.shopname,
        status: '0'
      }, {
        goods_info: [param]
      })));
      var pagePath = '/pages/orderDetail/orderDetail?orderpending=' + data;
      helperServ.goToPage(pagePath);

      goodsInfo.push(param);
      orderServ.addOrderPending({
        goodsInfo: goodsInfo
      }).then(res => {
        that.hiddeAddToShoppingCart();
        if (res.result.errMsg) {
          helperServ.showToast({
            icon: 'none',
            title: res.result.errMsg
          });
          return;
        }
      }).catch(err => {});
    },
    goToMyOrder:function(){
      helperServ.goToPage("/pages/myOrder/myOrder?status=0");
    },
    goToCart: function () {
      helperServ.goToPage("/pages/myCart/myCart");
    },
    _showShare0:function(e){
      var fileID= null,goods = this.data.goods,height=0;
      if(goods.picpath && goods.picpath.length===3){
        fileID = goods.picpath[2].fileID;
        height = goods.picpath[2].height;
      } else if(goods.imginfo && goods.imginfo.length>0){
        fileID =goods.imginfo[0].fileID;
        height = goods.imginfo[0].height;
      } else {
        helperServ.showModal({content:"商品未上传图片"})
        return;
      }
      var myShare = this.selectComponent("#myShare");
      //"https://7869-xiaovt-818we-1259627454.tcb.qcloud.la/assets/imgs/bg/bg_sea.png?sign=99f83b505db3e6fd2ad865be8e8ccd75&t=1578569956",//
      myShare.show({
        hbheight:500,
        url:'/pages/goodsDetail/goodsDetail?goodsno=',
        company:goods.shopname,
        subname:goods.goodsname,
        desc:"",
        price:'¥ ' +(goods.price.lowprice!=goods.price.highprice?`${goods.price.lowprice}~${goods.price.highprice}`:goods.price.lowprice),
        origin_price:goods.price.originalprice?('原价 ' + goods.price.originalprice):'',
        hbimg:{height:height,src:fileID},
        id :goods.goodsno,
        type:"1",//分享类型：1商品，2店铺，3报名
        content:"",
        summary:'好货要和朋友一起分享'
      })
    },
    _showShare1:function(e){
      var fileID= null,goods = this.data.goods,height=0;
      if(goods.picpath && goods.picpath.length===3){
        fileID = goods.picpath[2].fileID;
        height = goods.picpath[2].height;
      } else {
        helperServ.showModal({content:"商品未上传海报图片"})
        return;
      }
      var myShare = this.selectComponent("#myShare");
      myShare.show({
        hbheight:0,
        url:'/pages/goodsDetail/goodsDetail?goodsno=',
        company:"",
        subname:"",
        desc:"",
        price:"",
        origin_price:"",
        qrposi:{
          left:15,
          top:15,
          width:80,
          height:80,
        },
        hbimg:{
          height:height,
          src:fileID
        },
        id :goods.goodsno,
        type:"1",//分享类型：1商品，2店铺，3报名
        content:"",
        summary:''
      })
    },
    showShare:function(e){
      if(this.data.goods.shareway=='1'){
        this._showShare1(e);
      } else {
        this._showShare0(e);
      }
    },
    /*
    onShareAppMessage: function() {
      var url = '/pages/goodsDetail/goodsDetail?goodsno=' + this.data.projectid;
      // 统计用户分享
      //app.countUserShareApp();
      return {
        title: '应用',
        desc: '',
        path: url
      }
    },*/
    getGoods: function(goodsno) {
      goodsServ.getGoodsDetail({
        goodsno: goodsno
      }).then(res => {
        if(!res.result.data){
          helperServ.showModal({
            content:res.result.errMsg,
            success:(ok)=>{
              //if(ok.confirm){
                helperServ.goBack();
              //}
          }});
          return;
        }
        var goods = res.result.data;

        /** 如果存储的是object，那么需要转换 */
        if (goods.ensure&&!Array.isArray(goods.ensure)) {
          goods.ensure = pageServ.toValues(goods.ensure).sort((a, b) => a.seq - b.seq);
        }
        //goods.ensure&&goods.ensure.length>0 ?goods.ensure.sort((a, b) => a.seq - b.seq) : null;
        if (goods.parameter&&!Array.isArray(goods.parameter)) {
          goods.parameter = pageServ.toValues(goods.parameter).sort((a, b) => a.seq - b.seq);
        }
        //goods.parameter&&goods.parameter.length>0 ? goods.parameter.sort((a, b) => a.seq - b.seq) : null;

        if (!goods.modelitems) {
          //单一商品
          goods.modelitems = {
            "defaultMID": {
              picpath: {
                fileID: goods.picpath?goods.picpath[0].fileID:""
              },
              stock: goods.quantity&&goods.quantity.stockqty||9999999,
              price: goods.price.saleprice,
              subid: DEFAULT_MID,
              subname: goods.goodsname
            }
          };          
          goods.models = {
            "models": {
              seq:0,
              id: 'models',
              name: goods.goodsname,
              submodels: {
                'defaultMID': {
                  subid: DEFAULT_MID,
                  subname: goods.goodsname
                }
              }
            }
          };
        }

        this.setData({
          projectid: goodsno,
          goods: goods,
          specParameter: {}, //产地（国家信息） specParameter.productionstate.value
          goodsModels:pageServ.toValues(goods.models).sort((a,b)=>a.seq - b.seq)
        })

      }).catch(err => {
        helperServ.showToast({
          title: err.errMsg || err.message
        });
      });
    },
    dragStart: function(e) {
      this.startY = e.touches[0].pageY;
    },
    dragMove: function(e) {
      //console.debug("*dragMove*", e);
      this.movedDistance = e.touches[0].pageY - this.startY; //e.touches[0].pageY - this.startY;
    },
    dragEnd: function(e) {
      //console.debug("*dragEnd*", e);
      //this.movedDistance = e.changedTouches[0].pageY - this.startY;//e.touches[0].pageY - this.startY;
      var data = {},
        type = e.currentTarget.dataset.type;
      if (this.movedDistance > 200) {
        this.movedDistance = 0;
        data[type] = false;
        pageServ.hideDlg(data, this);
      }
    },
    getAdditional(goodsno){
      goodsServ.getAdditional({ goodsno:goodsno}).then(res=>{
        this.setData({
          additional:res.result
        })
      }).catch(err=>{

      })
    },
  },
  observers: {
    'goodsno': function(goodsno) {
      if (!goodsno) {
        return;
      }
      this.getAdditional(goodsno);
      this.getGoods(goodsno);
    },
    'goodsinfo': function(goodsinfo) {
      if (!goodsinfo) {
        return;
      }
      this.setData({
        goods: goodsinfo
      })
    }
  },
})