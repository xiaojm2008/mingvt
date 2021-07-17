var helperServ = require("./helper.js");
var mySeq = require("./mySeq.js");
var cache = require("./cache.js");
var app = getApp();
class upimg {
  bInit = true;
  imginfo = null;
  imgmap = {};
  initCloudPath(cloudPath) {
    this.cloudDir = cloudPath;
  }
  setCloudPath(cloudPath) {
    this.cloudDir = cloudPath;
  }
  constructor(option, pageContext, pack) {
    console.debug('********upimg constructor(option)********', option);
    this.storage = option.storage||app.getEnv("storage");
    this.outType = option.outType || "jpg";
    this.cutImg = option.cutImg;
    this.fixwidth = option.fixwidth;
    this.selcount = option.selcount || 1;
    this.compressrate = option.compressrate || 8;
    this.maxWidth = option.maxWidth || 640;
    this.maxHeight = option.maxHeight || 320;
    this.scale = option.scale;
    //this.scale = true;
    this.pageContext = pageContext;
    this.pack = pack;
    this.imginfo = this.getData(this.pack) || [];
    this.initCloudPath(option.cloudDir);
  }
  init() {
    return this.bInit;
  }
  initImgInfoData(imgArr) {
    this.imginfo = imgArr;
  }
  setData(data) {
    if (this.pageContext) {
      this.pageContext.setData(data);
    }
  }
  getData(pack) {
    var d = this.pageContext ? this.pageContext.data : null;
    if (!pack) {
      pack = this.pack;
    }
    if (!d || !pack) {
      return null;
    }
    var s = pack.split('.'),
      f = null,
      f1 = 0,
      p = null;
    if (s && s.length > 0) {
      s.forEach((v, i) => {
        f = v.indexOf('[');
        if (f >= 0) {
          f1 = v.indexOf("]");
          if (f1 < 0) {
            console.debug("pack error", v);
            helperServ.showModal({
              content: 'pack error'
            })
            return null;
          }
          p = v.substr(0, f);
          d = d[p];
          p = parseInt(v.substring(f + 1, f1));
          d = d[p];
        } else {
          d = d[v];
        }
      })
      return d;
    }
    return d[key];
  }
  _delImg(idx) {
    if (this.imginfo.length <= idx) {
      return;
    }
    this.imginfo.splice(idx, 1);
    console.debug(`delImg local img at ${idx} later ,current pack${this.pack}`, this.imginfo);
    var pageData = this.getData();
    if (!pageData) {
      return;
    }
    var data = {};
    data[this.pack] = this.imginfo;
    if (this.imginfo.length > 0) {
      data['current'] = 0;
    }
    this.setData(data);
  }

  delImg(idx, cb) {
    var fileID = null;
    if (isNaN(idx)) {
      if (!idx) {
        cb ? cb(null) : null;
        return;
      }
      fileID = idx;
    } else {
      if (!this.imginfo || this.imginfo && this.imginfo.length <= idx) {
        if (typeof cb == "function") {
          cb ? cb(null, [], idx) : null;
        }
        return;
      }
      if (!this.imginfo[idx]) {
        cb ? cb(null, [], idx) : null;
        return;
      }
      fileID = this.imginfo[idx].fileID;
      if (!fileID) {
        this._delImg(idx);
        if (typeof cb == "function") {
          cb ? cb(null, this.imginfo[idx], idx) : null;
        }
        return;
      }
    }
    helperServ.showLoading();
    console.debug(`删除云 ${idx}:${fileID}`);
    wx.cloud.deleteFile({
      fileList: [fileID]
    }).then(res => {
      wx.hideLoading();
      console.debug("deleteFile success return", res)
      var file = res.fileList && res.fileList.length > 0 ? res.fileList[0] : null;
      if (file.status != '0' && file.errMsg != "STORAGE_FILE_NONEXIST") {
        helperServ.showToast({
          title: file.errMsg
        });
        if (typeof cb == "function") {
          cb ? cb(file, this.imginfo[idx], idx) : null;
        }
        return;
      } else {
        for (var i = 0; i < this.imginfo.length; i++) {
          if (this.imginfo[i].fileID == file.fileID) {
            this._delImg(i);
            break;
          }
        }
        if (typeof cb == "function") {
          cb ? cb(null, this.imginfo[idx], idx) : null;
        }
      }
    }).catch(err => {
      if (typeof cb == "function") {
        cb ? cb(err, this.imginfo[idx], idx) : null;
      }
    });
  }
  delNotExistsImg(imgMap) {
    console.debug(`delNotExistsImg`, imgMap);
    this.imginfo.forEach((v, i) => {
      if (!imgMap[v.digest]) {
        this.delImg(v.digest, v.index);
      }
    });
  }
  /* img handle */
  addImg(img) {
    var self = this;
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: img.origpath,
        success(s) {
          console.debug('getImageInfo()', s);
          if (s && (320 > s.width > 1242 || s.height > img.maxHeight)) {
            console.debug(`您上传图片尺寸为[${s.width}~${s.height}]应该宽度在${img.maxWidth},高度在${img.maxHeight}！`);
          }
          wx.getFileInfo({
            filePath: s.path,
            success(f) {
              console.debug('getFileInfo()', f);
              //console.debug('getImgInfo2', img); 
              var out = {
                idx: img.idx,
                digest: f.digest,
                size: f.size,
                path: s.path,
                width: s.width,
                height: s.height,     
                outType: img.outType,
                oriWidth: null,
                oriHeight: null
              };

              console.debug('Out ImgInfo', out);

              if (self.cutImg){
                self.transImg(out, img).then(res => {
                  resolve(res);
                }).catch(err => {
                  reject(err);
                });
              } else {
                if (f && f.size > 512000 * 2.0) {
                  helperServ.showToast({
                    title: `您上传的图片尺寸太大,请选择小于1M的图片！`,
                    icon:"none"
                  })
                  reject({
                    errMsg: `您上传的图片尺寸太大,请选择小于1M的图片！`
                  });
                  return;
                }
                resolve(out);
              }
            }
          }); // end of getFileInfo
        }
      });
    }).catch(err => {
      helperServ.showToast({
        title: err.message,
        icon:"none"
      });
    });
  }
  /** img 原来图片，setH,setH 裁剪尺寸 */
  getScaleSize(img, setW, setH) {
    var outSize = {};
    if (this.fixwidth) {
      outSize.outW = setW;
      outSize.outH = outSize.outW * img.height / img.width;
      return outSize;
    } else {
      if (img.width / img.height >= setW / setH) {
        if (img.width > setW) {
          outSize.outW = setW;
          outSize.outH = outSize.outW * img.height / img.width;
        } else {
          outSize.outW = img.width, outSize.outH = img.height;
        }
      } else {
        if (img.height > setH) {
          outSize.outH = setH;
          outSize.outW = img.width * outSize.outH / img.height;
        } else {
          outSize.outW = img.width, outSize.outH = img.height;
        }
      }
    }
    return outSize;
  }
  /**
   *     if (self.cutImg) {
            //裁剪图片,保存原图片信息，oriWidth，oriHeight,oriPath
            img.imginfo = s;
            self.transImg(s, img).then(res => {
              resolve(res);
            }).catch(err => {
              reject(err);
            });
          } else {

          }
   */
  //裁剪图片
  transImg(src, img) {
    var self = this;
    return new Promise((resove, reject) => {
      var tmpW = 0,
        tmpH = 0,
        outSize = {
          outW: img.maxWidth,
          outH: img.maxHeight
        },
        myCanvasId = `myCanvas${img.idx}`;
      if (self.scale) {
        outSize = self.getScaleSize(src, parseInt(img.maxWidth), parseInt(img.maxHeight))
        console.debug('getScaleSize', outSize);
      }
      /*
      this.pageContext.setData({
        canvasHeight: outSize.outW,
        canvasWidth: outSize.outH
      })*/
      const ctx = wx.createCanvasContext(myCanvasId, this.pageContext);  
      //console.debug(`wx.createCanvasContext:${myCanvasId}`, ctx, app.globalData.pageContext);
      ctx.drawImage(src.path, 0, 0, src.width, src.height, 0, 0, outSize.outW, outSize.outH);
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: outSize.outW,
          height: outSize.outH,
          destWidth: outSize.outW,
          destHeight: outSize.outH,
          canvasId: myCanvasId,
          fileType: img.outType,
          quality: parseInt(img.compressrate) / 10,
          success(res) {
            //console.debug(`success canvasToTempFilePath`, res);
            if (res.tempFilePath) {
              console.debug(`canvasToTempFilePath:${outSize.outW}~${outSize.outH}->${src.width}~${src.height}`, res.tempFilePath);
              self.getImgInfo(res.tempFilePath, src).then(res => {
                resove(res);
              }).catch(err => {
                reject(err);
              });
            } else {
              helperServ.showModal({
                content: `保存图片失败！`
              })
            }
          },
          fail(err) {
            console.debug(`fail canvasToTempFilePath`, err);
          }
        }, self.pageContext)
      });
    }).catch(err => {
      helperServ.showModal({
        content: err.message
      });
    });
  }
  getImgInfo(tempFilePath, img) {
    var self = this;
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: tempFilePath,
        success(s) {
          //console.debug(`getImageInfo ${tempFilePath}`, s);
          wx.getFileInfo({
            filePath: s.path,
            success(f) {
              console.debug('getFileInfo()', f);
              //console.debug('getImgInfo2', img);
              if (f && f.size > 512000 * 2) {
                helperServ.showModal({
                  content: `您上传的图片尺寸太大,请选择小于1M的图片！`
                })
                reject({
                  errMsg: `您上传的图片尺寸太大,请选择小于1M的图片！`
                });
                return;
              }
              var out = {
                idx: img.idx,
                path: img.size <= f.size ? img.path:s.path, //裁剪后的尺寸如果还大于原图那么就用原图把。              
                width: s.width,
                height: s.height,                
                size: f.size,
                //digest2: f.digest,
                outType: img.outType,
                digest: img.digest,
                //oriPath: img.path,
                //oriSize: img.size,
                //oriWidth: img.width,
                //oriHeight: img.height
              };
              console.debug('Out ImgInfo', out);
              resolve(out);
            }
          });
        }
      });
    }).catch(err => {
      helperServ.showModal({
        content: err.message
      });
    });
  }
  chooseImg(e, callback) {
    var data = {},
      self = this,
      c = 0,
      index = e && e.currentTarget.dataset.index ? e.currentTarget.dataset.index : 0;

    if (this.imginfo) {
      this.imginfo.forEach(v => {
        if (v) {
          c++;
        }
      })
      if (c >= this.selcount) {
        helperServ.showModal({
          content: `最多${this.selcount}张图片`
        });
        return;
      }
    }
    wx.chooseImage({
      count: this.cutImg? 1 : this.selcount,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        console.debug(`${index}`, res.tempFilePaths);
        if (res.tempFilePaths.length == 0) {
          return;
        }
        var tasks = [];
        res.tempFilePaths.forEach((tmpPath, idx, arr) => { 
          tasks.push(self.addImg({
            idx: idx,
            origpath: tmpPath,
            compressrate: parseInt(self.compressrate),
            maxWidth: parseInt(self.maxWidth),
            maxHeight: parseInt(self.maxHeight),
            outType: self.outType
          }));
        });
        Promise.all(tasks).then(res => {
          console.debug(`Promise.all return`, res);
          if (!self.pageContext || !self.pack) {
            if (callback) {
              callback(null, res, self.imginfo);
            }
            return;
          }
          var data = {};
          res.forEach((item, idx, arr) => {
            if (!item || !item.digest) {
              return;
            }
            item.index = self.imginfo.length;
            self.imginfo.push(item);
            self.imgmap[item.digest] = item;
            //console.debug(`return index =${idx}:`, item);
          });
          data[self.pack] = self.imginfo;
          self.setData(data);
          if (callback) {
            callback(null, res, self.imginfo);
          }
          //console.debug('chooseImg return', self.enrollinfo);
          /*
          setTimeout(() => {
            self.setData({
              current: self.imginfo.length - 1
            });
          }, 1000);*/
        });
      },
      fail: err => {
        if (callback) {
          callback(err, null, self.imginfo);
        }
        console.debug('chooseImg fail', err);
        /*helperServ.showModal({
          content: err.errMsg || err.message
        });*/
      }
    });
  }
  uploadFile(img, i, arr) {
    if (!this.storage || !this.storage.trim()) {
      helperServ.showToast({ title: "环境ID为空", icon: "none" })
      return;
    } else if(!this.cloudDir || !this.cloudDir.trim()){
      helperServ.showToast({ title: "路径空异常", icon: "none" })
      return;
    }
    //goods/tmp/
    //var cloudPath = `${this.cloudDir}${mySeq.S4()}${mySeq.S4()}_${mySeq.S4()}${mySeq.S4()}${mySeq.S4()}_${mySeq.S4()}${mySeq.S4()}_${mySeq.S4()}.${this.outType}`;
    var cloudPath = `${this.cloudDir}${img.digest}.${this.outType||'jpg'}`;
    console.debug(`需要上传图片到[${this.storage}:${cloudPath}]`, img);
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: img.path,
        config:{
          env: this.storage
        }
      }).
      then(res => {
        img = {
          fileID: res.fileID,
          //cloudPath: cloudPath,
          //tempPath: img.path,
          //oriPath: img.oriPath,
          //statusCode: res.statusCode,
          status: (res.statusCode+"")[0] == "2" ? "2" : "1", //2上传成功
          errMsg: res.errMsg,
          digest: img.digest,
          width: img.width,
          height: img.height,
          size: img.size,
          //oriWidth: img.oriWidth,
          //oriHeight: img.oriHeight
          //index: img.index
        };
        if (i >= 0) {
          this.imginfo[i] = img;
        }
        resolve(img);
        console.debug(`uploadFile ${i} SUCCESS`, img);
      }).catch(err => {
        console.debug('uploadFile err', err);
        img.errMsg = err.message || err.errMsg;
        img.status = "1";
        img.fileID = null;
        if (i > 0) {
          //this.imginfo[i] = img;
        }
        reject({
          status: "1", //未上传成功
          fileID: null,
          errMsg: img.errMsg
        })
      });
    });
  }

}
/**
 * config 配置
env	使用的环境 ID，填写后忽略 init 指定的环境	String

 */
upimg.batchUpLoadFile = function (imgarr, cloudDir, storage) {
  if(!cloudDir || !cloudDir.trim()){
    helperServ.showToast({title:"上传路径空异常",icon:"none"})
    return;
  }
  var storage = storage||app.getEnv("storage");
  if (!storage || !storage.trim()){
    helperServ.showToast({title:"环境ID为空",icon:"none"})
    return;
  }
  var tasks = [];
  console.debug(`需要上传图片到[${storage}:${cloudDir}]`, imgarr);
  return new Promise((resolve, reject) => {
    imgarr.forEach((v, i, arr) => {
      tasks.push(wx.cloud.uploadFile({
        cloudPath: `${cloudDir}${v.digest}.${v.outType||'jpg'}`,
        filePath: v.path,
        config:{
          env: storage
        }
      }));
    });
    if (tasks.length == 0) {
      resolve({
        success: true
      });
    }
    helperServ.showLoading({
      title: "正在上传图片..."
    });
    Promise.all(tasks).then(res => {
      var bErr = false;
      res.forEach((v, i) => {
        imgarr[i].fileID = v.fileID;
        imgarr[i].status = (v.statusCode+"")[0] != '2' ? '1' : '2';
        imgarr[i].errMsg = v.errMsg;
        if (imgarr[i].status != '2') {
          bErr = true;
        }
      });
      helperServ.hideLoading();
      if (bErr) {
        var errMsg = "存在未能成功上传的图片，请重试";
        helperServ.showModal({
          content: errMsg
        })

        resolve({
          success: false,
          errMsg: errMsg
        });
      } else {
        resolve({
          success: true,
          imgarr: imgarr
        });
      }
    }).catch(err => {
      helperServ.hideLoading();
      var errMsg = err ? err.errMsg || err.message : "上传图片失败";
      helperServ.showModal({
        content: errMsg + `(${cloudDir})`
      });
      reject({
        success: false,
        errMsg: errMsg
      });
    });
  })
}
module.exports = upimg;