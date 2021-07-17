const goodsServ = require("../../lib/services/goods.js");
const helperServ = require("../../lib/utils/helper.js");
const cache = require("../../lib/utils/cache.js");
const pageServ = require('../../lib/utils/pagehelper.js');
const shopServ = require("../../lib/services/shop.js");
const pagecfg = require("../shoptheme/cfg/pagecfg.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shopid: {
      type: "String",
      value: null
    },
    shopinfo: {
      type: "Object",
      value: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //loadFinish:false,
    unexception_id: { "openingdate": 1, "seatnum": 1, "storearea": 1,"businesshours":1},
    //shopinfo:null,
    dict: { "100024": null, "100025": null, "100026": null}
  },
  lifetimes: {
    ready: function () {
      pageServ.loadDict(this);
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    dragStart: function (e) {
      this.startY = e.touches[0].pageY;
    },
    dragMove: function (e) {
      this.movedDistance = e.touches[0].pageY - this.startY;//e.touches[0].pageY - this.startY;
    },
    dragEnd: function (e) {    
      var data = {}, type = e.currentTarget.dataset.type;
      if (this.movedDistance > 200) {
        this.movedDistance = 0;
        data[type] = false;
        pageServ.hideDlg(data, this);
      }
    },
    previewImg:function(e){
      var imgidx = e.currentTarget.dataset.index,fieldidx=e.currentTarget.dataset.id,imgs=null;
      if(this.data.dlgtype=='1'){
        imgs = this.data.shopinfo.parameter[fieldidx].value;
      }else {
        imgs = this.data.shopinfo.credentials[fieldidx].value;
      }
      helperServ.previewImg(imgs, imgidx);
    },
    showEDlg: function (e) {
      var showtype = e.currentTarget.dataset.dlgtype;
      this.selectComponent("#enrollDetail").show({
        title:showtype=='1'?'商户信息':'资质与服务保障',
        type:"1", //复杂类型，可以显示图片
        style:{
          subStyle:"font-size:16px;font-weight:700;",
          textStyle:"padding-left:0px"
        },
        basicfacts:showtype=='1'?this.data.shopinfo.basicfacts:null,
        enrollinfo:showtype=='1'?this.data.shopinfo.parameter:this.data.shopinfo.credentials
      });
      /*
      if (this.data.showEDlg) {
        pageServ.hideDlg({         
          'showEDlg': false
        }, this);
        return;
      }
      this.setData({
        dlgtype: e.currentTarget.dataset.dlgtype,
        showEDlg: true
      });
      pageServ.showDlg(this);*/
    },
    openLocation: function () {
      pageServ.openLocation(this.properties.shopinfo.latitude, this.properties.shopinfo.longitude);
    },
    callPhone: function (e) {
      helperServ.callPhone(e.currentTarget.dataset.phone);
    },
    goToPage: function (e) {
      pageServ.goToPage(e, this);
    },
    shopImgShow:function(e){
      helperServ.goToPage(`/pages/shopImg/shopImg?shopid=${this.data.shopid}`)
    },
    showShare:function(e){
      var fileID= null,shopinfo =this.data.shopinfo,height=0;
      if(shopinfo.picpath && shopinfo.picpath.length===3){
        fileID = shopinfo.picpath[2].fileID;
        height = shopinfo.picpath[2].height;
      } else if(shopinfo.imginfo && shopinfo.imginfo.length>0){
        fileID = shopinfo.imginfo[0].fileID;
        height = shopinfo.imginfo[0].height;
      } else {
        helperServ.showModal({content:"店铺海报未上传"})
        return;
      }
      var myShare = this.selectComponent("#myShare");
      //"https://7869-xiaovt-818we-1259627454.tcb.qcloud.la/assets/imgs/bg/bg_sea.png?sign=99f83b505db3e6fd2ad865be8e8ccd75&t=1578569956",//
      myShare.show({
        hbheight:410,
        url:'/pages/shopDetail/shopDetail?shopid=',
        company:shopinfo.shortname,
        subname:shopinfo.shopname,
        desc:"",
        price:"",
        origin_price:'',
        hbimg: {height:height,src:fileID},
        id :this.data.shopinfo.shopid,
        type:"2",//分享类型：1商品，2店铺，3报名
        content:shopinfo.address?shopinfo.address:'',
        summary:"联系电话："+shopinfo.phone,
      })
    },
    getGoodsList(shopid){
      goodsServ.getGoodsList({shopid:shopid,hotsell:1,batch_time:0}).then(res=>{
        this.setData({
          goodsList:res.result.data||null
        })
      }).catch(err=>{

      })
    },
    goToGoods(e) {
      helperServ.goToPage(pagecfg.goodsdetail_page + "?goodsno=" + e.currentTarget.dataset.goodsno);
    },
    goToMore(e){
      helperServ.goToPage("/pages/goodsMore/goodsMore?shopid="+this.data.shopinfo.shopid);
    },
    getShop: function (shopid) {
      shopServ.getShopDetail({
        shopid: shopid
      }).then(res => {
        var shop = res.result.data && Array.isArray(res.result.data) ? res.result.data[0] : res.result.data;
      
        if (shop.credentials&&!Array.isArray(shop.credentials)){
          shop.credentials = pageServ.toValues(shop.credentials).sort((a,b)=>a.seq-b.seq);
        }
        if (shop.parameter&&!Array.isArray(shop.parameter)){
          shop.services = shop.parameter.services;
          shop.parameter = pageServ.toValues(shop.parameter).sort((a, b) =>a.seq - b.seq);
        } else {
          shop.services = shop.parameter?shop.parameter.find(v => v.id === "services"):null;
        }
        shop.basicfacts = shop.parameter?shop.parameter.filter(v=>v.basic=='1'):null;

        this.setData({
          shopinfo: shop
        })
      }).catch(err => {
        helperServ.showToast({
          title: err.errMsg || err.message
        });
      });
    },
  },
  observers: {
    'shopid': function (shopid) {
      if (!shopid) {
        return;
      }
      this.getShop(shopid);
      this.getGoodsList(shopid);
    }
  },
})
