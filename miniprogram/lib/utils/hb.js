/*import {
  HTTP
} from 'http.js';
const http = new HTTP
*/
const helperServ = require("./helper.js");
const rpc = require("./rpc.js");
const app = getApp();

class HB {
  //cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/bg/bg_sea.png
  //cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/bg/bg_love.png
  //'https://7869-xiaovt-818we-1259627454.tcb.qcloud.la/assets/imgs/bg/bg.png?sign=8f1e31d624e227cbbde8a19803748e2c&t=1578569596', 
//
  layoutInfo = {
    hbheight:0,
    company: '',
    bgimg: "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/bg/bg_love.png",
    //背景图
    qrimg: '', //固定二维码
    hbimg: '',
    bgtemp: '',
    qrtemp: '',
    hbtemp: '',
    subname: '',
    price: '',
    origin_price: '',
    mycanvas: '',
    summary: '',
    id: ''
  };

  constructor(options) {
    this.pageContext = options.pageContext;
  
    this.layoutInfo.mycanvas = options.mycanvas||'myCanvas';
    //this.layoutInfo = Object({}, , options || {})
  }

  create(obj) {
    //obj.imgs = obj.imgs.replace('http://', 'https://');
    this.layoutInfo.hbheight = obj.hbheight;
    this.layoutInfo.company = obj.company;//||'-- 伊秀商城 --';
    this.layoutInfo.url = obj.url;
    this.layoutInfo.subname = obj.subname
    this.layoutInfo.price = obj.price
    this.layoutInfo.origin_price = obj.origin_price
    this.layoutInfo.hbimg = obj.hbimg
    this.layoutInfo.id = obj.id
    this.layoutInfo.type = obj.type;
    this.layoutInfo.content = obj.content;
    this.layoutInfo.summary = obj.summary || '';
   
    this.getQr();
  }
  getQr() {
    helperServ.showLoading();
    rpc.doAction({
      width: 0,
      scene: this.layoutInfo.id,      
      type:this.layoutInfo.type,
      url:this.layoutInfo.url,
      content: "pages/shareEntry/shareEntry"
    }, 'qr.getQr', "trader").then(res => {
      if (!res.result.success) {
        helperServ.hideLoading();
        helperServ.showModal({
          content: res.result.errMsg,
        })
        this.saveQrToLocal(null);
        return;
      }
      this.saveQrToLocal(res.result);

    }).catch(err => {
      this.saveQrToLocal(null);
      helperServ.hideLoading();
      helperServ.showModal({
        content: err.errMsg || err.message
      })
    })
  }
  saveQrToLocal(qrinfo) {
    if(!qrinfo){
      this.layoutInfo.qrtemp = "/images/ic_user.png";
      this.getBg();
      return;
    }
    const qrPath = `${wx.env.USER_DATA_PATH}/${this.layoutInfo.id}.jpg`;
    wx.getFileSystemManager().writeFile({
      filePath: qrPath,
      data: qrinfo.buffer,
      encoding: 'binary',
      success: (res) => {
        console.log(qrPath, res);
        this.layoutInfo.qrtemp = qrPath;
        this.getBg();
      },
      fail: (err) => {
        console.log('writeFile', err);
        helperServ.hideLoading();
        helperServ.showModal({
          title: '提示',
          content: err.errMsg,
        })
      },
    });
  }

  //下载背景图
  getBg() {
    console.log('bgimg:', this.layoutInfo.bgimg)
    if(this.layoutInfo.bgimg.startsWith("cloud")){
      wx.getImageInfo({
        src: this.layoutInfo.bgimg, //图片路径
        success: (res)=> {
          if(res.path){
            this.layoutInfo.bgtemp = res.path;
            this.getBHImg();
          } else {
            helperServ.hideLoading();
            helperServ.showModal({
              title: '提示',
              content: res.path + "空异常"
            })
          }
        },
        fail:(err)=>{
          console.log('getBg', err);
          helperServ.hideLoading();
          helperServ.showModal({
            title: '提示',
            content: err.errMsg,
          })
        }
      });
      return;
    }
    wx.downloadFile({
      url: this.layoutInfo.bgimg,
      success: (res) =>{
        console.log('bgcode:', res.tempFilePath)
        if (res.statusCode === 200) {
          this.layoutInfo.bgtemp = res.tempFilePath;
          this.getBHImg();
        } else {
          wx.showToast({
            title: '商品图片下载失败！',
            icon: 'none',
            duration: 2000,
            success: function () {

            }
          })
        }
      },
      fail: (err) => {
        console.log('writeFile', err);
        helperServ.hideLoading();
        helperServ.showModal({
          title: '提示',
          content: err.errMsg,
        })
      },
    })
  }

  //下载商品图片
  getBHImg() {
    if(this.layoutInfo.hbimg.src.startsWith("cloud")){
      wx.getImageInfo({
        src: this.layoutInfo.hbimg.src, //图片路径
        success: (res)=> {
          if(res.path){
            this.layoutInfo.hbtemp = res.path; //下载成功返回结果
            this.sharePosteCanvas(); //生成海报
          } else {
            helperServ.hideLoading();
            helperServ.showModal({
              title: '提示',
              content: res.path + "空异常"
            })
          }
        },
        fail:(err)=>{
          console.log('getImageInfo', err);
          helperServ.hideLoading();
          helperServ.showModal({
            title: '提示',
            content: err.errMsg,
          })
        }
      });
      return;
    }
    wx.downloadFile({
      url: this.layoutInfo.hbimg.src, //图片路径
      success:  (res)=> {
        console.log('hbimg:', res.tempFilePath);      
        if (res.statusCode === 200) {
          this.layoutInfo.hbtemp = res.tempFilePath; //下载成功返回结果
          this.sharePosteCanvas(); //生成海报
        } else {
          wx.showToast({
            title: '商品图片下载失败！',
            icon: 'none',
            duration: 2000,
            success: function () {

            }
          })
        }
      },
      fail: (err) => {
        console.log('downloadFile', err);
        helperServ.hideLoading();
        helperServ.showModal({
          title: '提示',
          content: err.errMsg,
        })
      },
    })
  }

  //绘制海报bj, codeSrc, avaterSrc
  sharePosteCanvas() {
    /*
    var windowWidth = app.getWinWidth();
    windowWidth = windowWidth * 0.72 //css中设置的是72%宽
    console.log('w:', windowWidth)
    */

    var layoutInfo = this.layoutInfo,
    myCanvas = this.layoutInfo.mycanvas || 'myCanvas'; //需要绘制的数据集合

    const ctx = wx.createCanvasContext(myCanvas,this.pageContext); //创建画布
    var width = 0;
    wx.createSelectorQuery().in(this.pageContext).select(`#${myCanvas}-container`).boundingClientRect( (rect)=> {
      //var height = rect.height;
      //var right = rect.right;
      width = rect.width * 0.8;
      var left = 15,offsetTop = 0;
      ctx.setFillStyle('#fff');
      ctx.fillRect(0, 0, rect.width, rect.height);

      //背景图片
      if (layoutInfo.bgtemp) {
        ctx.drawImage(layoutInfo.bgtemp, 0, 0, rect.width, rect.height,0,0,rect.width,rect.height);
        ctx.setFontSize(14);
        ctx.setFillStyle('#fff');
        ctx.setTextAlign('left');
      }
      //公司名称 
      if (layoutInfo.company) {
        offsetTop += 25;
        ctx.setFontSize(14);
        ctx.setFillStyle('#333');
        ctx.setTextAlign('center');
        let fw = ctx.measureText(layoutInfo.company) //计算文字总宽度，ctx.setTextAlign('leftr')时有用
        ctx.fillText(layoutInfo.company, rect.width / 2, offsetTop); /*参数为：图片，左，上*/
        offsetTop += 10;
      }

      //海报（商品）图片
      if (layoutInfo.hbtemp) {
        //offsetTop += 10;
        var imgheight = 0;
        if(layoutInfo.hbheight > 0 && layoutInfo.hbimg.height>(layoutInfo.hbheight-180)){
          imgheight = (layoutInfo.hbheight - 180);
        } else {
          imgheight = layoutInfo.hbimg.height;
        }
        ctx.drawImage(layoutInfo.hbtemp,  (rect.width-(width + 25))/2 , offsetTop, width + 25, imgheight||180); //参数为：图片，左，上，宽，高
        ctx.setFontSize(14);
        ctx.setFillStyle('#fff');
        ctx.setTextAlign('left');
        offsetTop += (imgheight||180);
      }

      //商品名称
      //var subNameOffset = 0;
      if (layoutInfo.subname) {
        offsetTop += 10;
        const CONTENT_ROW_LENGTH = 32; // 正文 单行显示字符长度
        let [contentLeng, contentArray, contentRows] = this.textByteLength(layoutInfo.subname, CONTENT_ROW_LENGTH);

        ctx.setFontSize(14);
        ctx.setFillStyle('#000');
        if (contentLeng < 33) {
          offsetTop += 22;
          ctx.setTextAlign('center');
          ctx.fillText(layoutInfo.subname, rect.width / 2, offsetTop);
        } else {
          ctx.setTextAlign('center');
          for (let m = 0; m < contentArray.length; m++) {
            offsetTop += 22;
            ctx.fillText(contentArray[m], rect.width / 2,offsetTop);
          }
        }
      }

      //商品价格
      var price_width = null,priceLeft = 0;
      if (layoutInfo.price) {
        offsetTop += 28;
        ctx.setFontSize(16);
        ctx.setTextAlign('center');
        ctx.setFillStyle("#FF4444")
        price_width = ctx.measureText(layoutInfo.price)
        /**
         * 180 是主题（商品海报）图片的高
         * 35是海报偏移top的Y值
         * 30是商品名称偏移他的上一个对象即【商品名称】的偏移的海报值
         * 42是商品价格偏移商品名称值
         */
        priceLeft = layoutInfo.origin_price?((rect.width - price_width.width) / 2):(rect.width/2);
        ctx.fillText(layoutInfo.price, priceLeft, offsetTop);

      }

      //商品原价
      if (layoutInfo.origin_price) {
        ctx.setFontSize(12);
        ctx.setTextAlign('center');
        ctx.setFillStyle("#666")
        var oriLeft = price_width?(priceLeft+price_width.width+10):(rect.width/2);
        ctx.fillText(layoutInfo.origin_price, oriLeft,offsetTop);
        offsetTop += 10;
      }

      var offsetBottom = 80;
      ctx.setFontSize(14);
      ctx.setFillStyle('#000');
      ctx.setTextAlign('left');
      ctx.fillText('长按识别小程序二维码', left + 90,  rect.height - offsetBottom);

      if(layoutInfo.content){
        offsetBottom -=25;
        ctx.setFontSize(12);
        ctx.setFillStyle('#666');
        ctx.setTextAlign('left');
        ctx.fillText(layoutInfo.content, left + 90,  rect.height - offsetBottom);
      }
      if(layoutInfo.summary){
        offsetBottom -=25;
        ctx.setFontSize(12);
        ctx.setFillStyle('#666');
        ctx.setTextAlign('left');
        ctx.fillText(layoutInfo.summary, left + 90,  rect.height - offsetBottom);
      }
      //  绘制二维码
      if (layoutInfo.qrtemp) {
        ctx.drawImage(layoutInfo.qrtemp, left, rect.height - 100, 80, 80)
      }
      setTimeout(function () {
        ctx.draw(false,(res)=> {
          helperServ.hideLoading();
          console.log("*******draw*****",res);
        });
      }, 1000)
    }).exec()
  }

  //多行文字换行
  textByteLength(text, num) {
    let strLength = 0; // text byte length
    let rows = 1;
    let str = 0;
    let arr = [];
    for (let j = 0; j < text.length; j++) {
      if (text.charCodeAt(j) > 255) {
        strLength += 2;
        if (strLength > rows * num) {
          strLength++;
          arr.push(text.slice(str, j));
          str = j;
          rows++;
        }
      } else {
        strLength++;
        if (strLength > rows * num) {
          arr.push(text.slice(str, j));
          str = j;
          rows++;
        }
      }
    }
    arr.push(text.slice(str, text.length));
    return [strLength, arr, rows] //  [处理文字的总字节长度，每行显示内容的数组，行数]
  }

  //点击保存到相册
  save(callback) {
    helperServ.showLoading({
      title: '正在保存'
    })
    wx.canvasToTempFilePath({
      canvasId: this.layoutInfo.mycanvas,
      success: (res) => {
        wx.hideLoading();
        var tempFilePath = res.tempFilePath;
        wx.getSetting({
          success:(res) =>{
            if (!res.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success:() =>{
                  this.savePhones(tempFilePath, callback)
                }
              })
            } else {
              this.savePhones(tempFilePath, callback)
            }
          }
        })
      }
    },this.pageContext);
  }

  savePhones(tempFilePath, callback) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: (res) => {
        helperServ.showModal({
          content: '图片已保存到相册，赶紧晒一下吧',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function (res) {
            callback(1)
          },
          fail: function (res) {
            callback(0)
          }
        })
      },
      fail: (res) => {
        helperServ.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000
        })
        callback(0)
      }
    })
  }
}
/*
var show = (pgContent) => {
    pgContent.setData({
      haib: true,
      share_t: false,
      btn_save: false,
    })
    
    const obj = {
      id: 2,
      imgs: "https://www.phps.shop/1.jpg",
      name: 'aaa',
      price: 1,
      market_price: 2,
    }
    HB.create(goods);
  },

  //保存海报
  var save = (pgContent) => {
    HB.save(res => {
      if (res == 1) {
        pgContent.setData({
          haib: false,
          share_t: false,
          btn_save: true,
        })
      } else {
        wx.showToast({
          title: '保存失败'
        })
      }
    })
  }
*/
/**
   * //解决禁止滚动问题
<!-- catchtouchmove="preventTouchMove" -->
<!--  disable-scroll="true" bindtouchstart="touchStart" -->
 <!--  disable-scroll="true" bindtouchstart="touchStart" bindtouchmove="touchMove" bindtouchend="touchEnd" -->

<view class='haibao' wx-if="{{haib}}" catchtouchmove="preventTouchMove">
  <view class='hb'>
    <view class='hb_01' bindtap='close_hb' hidden="{{btn_save}}">
      <image src='/imgs/xc.png'></image>
    </view>
    <view class='hb_02 poste_box' id='canvas-container'>
      <canvas canvas-id="myCanvas" style="width:100%;height:420px;" disable-scroll="true" bindtouchstart="touchStart"  />
      <!-- bindtouchmove="touchMove" bindtouchend="touchEnd" -->
    </view>
    <view class='hb_03' hidden="{{btn_save}}">
      <van-button round type="danger" bindtap="save"> 保存到本地</van-button>
    </view>
  </view>
  <v-black></v-black>
</view>
   * 
   */
module.exports = {
  HB: HB
}