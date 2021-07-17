var helperServ = require("../../lib/utils/helper.js");
var upimg = require("../../lib/utils/upimg.js");
var mySeq = require("../../lib/utils/mySeq.js");
var restore = require("../../lib/utils/restore.js");
var constants = require("../../lib/comm/constants.js");
var app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    actionid: {
      type: String,
      value: null
    },
    placeholder: {
      type: String,
      value: '开始输入...'
    },
    cloudDir:{
      type: String,
      value:null
    },
    readOnly: {
      type: Boolean,
      value: false
    },
    windowHeight: {
      type: Number,
      value: 0
    },
    windowWidth: {
      type: Number,
      value: 0
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    formats: {},
    readOnly: false
  },
  editorCtx: null,
  lifetimes: {
    created: function() {
      //console.log(`editor create properties`, this.properties);
    },
    attached: function() {
      //console.log(`editor attached`);
      this.upimg = new upimg({
        cloudDir: `${this.properties.cloudDir}editor/`,
        scale: true,
        fixwidth: true,
        selcount: 4,
        compressrate: 10,
        maxWidth: this.properties.windowWidth,
        maxHeight: this.properties.windowHeight,
        outType: "jpg",
        cutImg: true
      });
      if (!this.upimg.init()) {
        delete this.upimg;
        //console.log(`editor attached fail`);
        return;
      }
      //下一步/上一步按钮隐藏处理
      wx.onKeyboardHeightChange(res => {
        //console.log('editor onKeyboardHeightChange', res);
        if (res.height > 0) {
          this.triggerEvent("togger", { show: false });
        } else {
          this.triggerEvent("togger", { show: true });
        }
      })
    },
    ready: function() {
      //console.log('editor ready');
    },
    detached: function() {
      //下一步/上一步按钮显示处理
      this.triggerEvent("togger", {
        show: true
      });
      var self = this;
      this.getContents({
        success(res) {
          //console.log('*********editor detached getContents1********');
          if (res.delta) {
            //console.log('*********editor detached getContents2********');
            restore.setEditorDelta(self.properties.actionid, res.delta)
            restore.setEditorHtml(self.properties.actionid, res.html) 
          }
        }
      });
      //console.log('editor detached,取消软键盘处理');
      wx.onKeyboardHeightChange(null);
    }
  },
  pageLifetimes: {
    show: function() {
      //console.log('editor 页面被展示');
    },
    hide: function() {
      //console.log('editor 页面被隐藏');
    },
    resize: function(size) {
      //console.log('editor 页面尺寸变化');
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

    readOnlyChange() {
      this.setData({
        readOnly: !this.data.readOnly
      })
    },
    /**
success	function		否	接口调用成功的回调函数
fail	function		否	接口调用失败的回调函数
complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
     */
    getContents(options) {
      return this.editorCtx.getContents(options);
    },
    /**
     * 
html	string		否	带标签的HTML内容
delta	Object		否	表示内容的delta对象
success	function		否	接口调用成功的回调函数
fail	function		否	接口调用失败的回调函数
complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
     */
    setContents(options) {
      this.editorCtx.setContents(options);
    },
    onEditorReady() {
      const self = this;
      const query = wx.createSelectorQuery().in(this)
      query.select('#editor').context(function(res) {
        self.editorCtx = res.context;
        var delta = restore.getEditorDelta(self.properties.actionid);
        if (delta) {
          self.setContents({
            delta: delta,
            success(res) {
              //console.log('setContents success', delta);
            },
            fail(err) {
              //console.log('setContents fail', err)
            }
          });
        }
      }).exec();
    },
    getImgInfo(v) {
      const {
        attributes,
        insert
      } = v;
      if (typeof insert != "object") {
        return null;
      }
      var img = insert.image ? insert.image : null,
        datacustom = attributes && attributes['data-custom'] ? decodeURIComponent(attributes['data-custom']) : null;
      if (img && datacustom) {
        var farr = datacustom.split("&");
        var params = {};
        farr.forEach((item, idx, arr2) => {
          var i = item.indexOf("=");
          var key = item.substr(0, i);
          var val = item.substr(i + 1);
          params[key] = val;
        });
        return params;
      }
      return null;
    },
    removeImgBuffer(html) {
      var ops = html.detail && html.detail.delta ? html.detail.delta.ops : [],
        imgMap = {};

      ops.forEach((v, i, a) => {
        var img = this.getImgInfo(v);
        //console.log('onBindInput parse data-custom', img);
        if (img) {
          imgMap[img.digest] = img;
        }
      });
      this.upimg.delNotExistsImg(imgMap);
      //console.log(".upimg.enrollinfo.imginfo", this.upimg.enrollinfo.imginfo);
    },
    onBindInput(e) {
      //console.log('onBindInput');
      restore.setEditorDelta(this.properties.actionid, e.detail.delta);
      restore.setEditorHtml(this.properties.actionid, e.detail.html) ;
    },
    onBindBlur(html) {
      //console.log('editor onBindBlur');
      /*this.triggerEvent("togger", {
        show: true
      });*/
    },
    onBindFocus(html) {
      //console.log('editor onBindFocus');     
       /*this.triggerEvent("togger", {
        show: false
      });     
      wx.onKeyboardHeightChange(res => {
        console.log('onKeyboardHeightChange', res);
        if(res.height > 0){
        
        } else {
          this.triggerEvent("togger", { show: true }); 
        }
      })*/
    },
    undo() {
      this.editorCtx.undo()
    },
    redo() {
      this.editorCtx.redo()
    },
    format(e) {
      let {
        name,
        value
      } = e.target.dataset
      if (!name) return
      //console.log('format', name, value)
      this.editorCtx.format(name, value)

    },
    onStatusChange(e) {
      const formats = e.detail
      this.setData({
        formats
      })
      //console.log('onStatusChange', formats)
    },
    insertDivider() {
      this.editorCtx.insertDivider({
        success: function() {
          //console.log('insert divider success')
        }
      })
    },
    clear() {
      this.editorCtx.clear({
        success: function(res) {
          //console.log("clear success")
        }
      })
    },
    removeFormat() {
      this.editorCtx.removeFormat()
    },
    insertDate() {
      const date = new Date()
      const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
      this.editorCtx.insertText({
        text: formatDate
      })
    },
    doImportHtml(url) {
      if (!url) {
        helperServ.showModal({
          content: "请输入需要导入地址"
        })
        return;
      }
      var self = this;
      wx.request({
        url: url,
        method: 'GET',
        success(res) {
          //console.log(res.data);
          try {
            self.setContents({
              html: res.data,
              success(res) {
                //console.log('setContents success', html);
                helperServ.showModal({
                  content: "导入成功"
                });
                self.myDlg.hideDlg();
              },
              fail(err) {
                //console.log('setContents fail', err)
                helperServ.showModal({
                  content: err.errMsg
                })
              },
              complete(cp) {
                self.myDlg.hideLoading();
              }
            });
          } catch (err) {
            self.myDlg.hideLoading();
            helperServ.showModal({
              content: err.message || err.errMsg
            })
          }
        }
      })
    },
    showModalDlg() {
      var self = this;
      this.myDlg = this.selectComponent('#modalDlg2');
      this.myDlg.showDlg({
        title: '导入对话框',
        inputlist: {
          "importurl": {
            "id": "importurl",
            "name": "",
            "type": "0",
            "required": "R",
            "length": 500,
            "placeholder": '请输入您需要导入的链接',
          }
        },
        btntext: '导入',
        submit: (e) => {
          try {
            self.myDlg.showLoading();
            self.doImportHtml(e.inputlist.importurl.value);
          } catch (err) {
            self.myDlg.hideLoading();
            helperServ.showModal({
              content: err.message || err.errMsg
            })
          }
        }
      });
    },

    insertEditorCtx(fileList) {
      //'data:image/png;base64,' +
      var orig = null,
        self = this;
      wx.cloud.getTempFileURL({
        fileList: fileList.map((v, i) => v.fileID),
        success(res) {
          //console.log('getTempFileURL', res);
          /*
        fileID	云文件 ID	String
tempFileURL	临时文件路径	String
status	状态码，0 为成功	Number
errMsg	成功为 getTempFileURL:ok，失败为失败原因
        */
          var s = res.fileList && res.fileList.length > 0 ? res.fileList : null;
          if (s) {
            s.forEach((v, i) => {
              orig = fileList[i];
              //console.log('getTempFileURL2', s, fileList, orig);
              self.editorCtx.insertImage({
                src: v.tempFileURL,
                data: {
                  couldPath: orig.cloudPath,
                  digest: orig.digest,
                  fileID: orig.fileID,
                  fileID2: v.fileID,
                  tempPath: orig.tempPath,
                  widht: orig.width,
                  height: orig.height,
                  size: orig.size
                },
                success: function(res) {
                  //console.log('insert image success');
                },
                fail: function(err) {
                  //console.log('insert image fail', res);
                  helperServ.showToast({
                    title: err.errMsg
                  });
                }
              });
            })
          } else {
            //console.log('insertEditorCtx', res);
            helperServ.showToast({
              title: err.errMsg
            });
          }
        },
        fail(err) {
          //console.log('insertEditorCtx', err);
          helperServ.showToast({
            title: err.errMsg
          });
        }
      })
    },
    insertImage() {
      var self = this;
      this.upimg.chooseImg(null, (err,imginfo) => {
        if(err){
          return;
        }
        //console.log('upImg.chooseImg', imginfo);
        var tasks = [];
        imginfo.forEach((v, idx, arr) => {
          //tasks.push(self.addToEditorCtx(v));
          tasks.push(self.upimg.uploadFile(v, -1));
        });
        if (tasks.length > 0) {
          helperServ.showLoading({
            title: "正在上传..."
          });
          Promise.all(tasks).then(res => {
            self.insertEditorCtx(res);
            setTimeout(() => {
              helperServ.hideLoading();
            }, 1000)
          });
        }
      })
    }
  }
})

/*
 addToEditorCtx(img) {
     console.log('addToEditorCtx', img);
     return new Promise((resovle, reject) => {
       wx.getFileSystemManager().readFile({
         filePath: img.path,
         encoding: 'base64',
         success(fres) {
           if (!fres.data) {
             reject({
               errMsg: `第${img.idx}张图片转换后数据为空`
             });
             return;
           }
           resovle({
             idx: img.idx,
             index: img.index,
             digest: img.digest,
             data: fres.data,
             width: img.sizeinfo.width,
             height: img.sizeinfo.height,
             size: img.sizeinfo.size,
             path: img.path
           });
         },
         fail(err) {
           helperServ.showModal({
             content: err.errMsg
           });
           reject({
             errMsg: err.errMsg
           });
         }
       });
     });
   },
   insertImage() {
     const that = this;
     wx.chooseImage({
       count: 1,
       sizeType: ['compressed'],
       sourceType: ['album', 'camera'],
       success: res => {
         if (!res.tempFilePaths || res.tempFilePaths.length == 0) {
           return;
         }
         console.log('chooseImage', res);
         var tmpPath = res.tempFilePaths[0];
         wx.getFileInfo({
           filePath: tmpPath,
           success(f) {
             console.log('getFileInfo()', f);
             if (f && f.size > 512000 * 1.2) {
               helperServ.showModal({
                 content: `您上传的图片尺寸太大,请选择小于600K的图片！`
               })
               return;
             }
             wx.getImageInfo({
               src: tmpPath,
               success(s) {
                 console.log('getImageInfo()', s);
                 if (s && (480 > s.width > 1242 || s.height > 1920)) {
                   helperServ.showModal({
                     content: `您上传图片尺寸[${s.width}~${s.height}]应该宽度在480~1242间,高度在1920一下！`
                   });
                   return;
                 }
                 wx.getFileSystemManager().readFile({
                   filePath: tmpPath,
                   encoding: 'base64',
                   success(fres) {
                     if (!fres.data) {
                       return;
                     }
                     that.editorCtx.insertImage({
                       src: 'data:image/png;base64,' + fres.data,
                       data: {
                         file: tmpPath,
                         widht: s.width,
                         height: s.height,
                         size: f.size
                       },
                       success: function() {
                         console.log('insert image success', res);
                       }
                     });
                   },
                   fail(err) {
                     helperServ.showModal({
                       content: err.errMsg
                     });
                   }
                 });
               }
             });
           }
         });
         return;
         
         wx.getFileSystemManager().saveFile({
           tempFilePath: tmpPath, filePath: filePath, success(fres) {
             if (!fres.savedFilePath) {
               return;
             }            
             that.editorCtx.insertImage({
               src: fres.savedFilePath,
               data: {
                 id: 'abcd',
                 role: 'god'
               },
               success: function () {
                 console.log('insert image success', fres);
               }
             });
           }, fail(err) {
             helperServ.showModal({ content: err.errMsg });
           }
         });
         return;
         that.editorCtx.insertImage({
           src: tmpPath,
           data: {
             id: 'abcd',
             role: 'god'
           },
           success: function () {
             console.log('insert image success', res);
           }
         });
         return;
         wx.cloud.uploadFile({
           cloudPath: `goods/tmp/${tmpFile}.png`,
           filePath: tmpPath
         }).then(res=>{
           if(!res.fileID){
             helperServ.showModal({content:res.errMsg||'上传图片异常'});
             return;
           }
           that.editorCtx.insertImage({
             src: res.fileID,
             data: {
               id: 'abcd',
               role: 'god'
             },
             success: function () {
               console.log('insert image success', res.fileID);
             }
           });
         });    
       }
     });
   }*/