var app = getApp();
const rpc = require('./rpc.js');
const helperServ = require('./helper.js');
const upimg = require("./upimg.js");
const cache = require("./cache.js");
const loginServ = require('../services/login.js');
const commServ = require('../services/common.js');
const mcommServ = require('../manager/comm.js');
const constants = require("../comm/constants.js");
const validate = require("./validate.js");
var getPx = (rpx) => {
  return rpx / 750 * app.systemInfo.windowWidth;
}
var getRpx = (px) => {
  return px * (750 / app.systemInfo.windowWidth);
}
var inputTogger = (e, pgContext) => {
  var id = e.currentTarget.id,
    v = e.detail.value,
    pack = e.currentTarget.dataset.pack ? e.currentTarget.dataset.pack : '',
    data = [],
    validx = e.currentTarget.dataset.validx,
    dict = e.currentTarget.dataset.dict;
  if (dict) {
    //dict = JSON.parse(dict);
    var dictObj = null;
    if (typeof dict == "object") {
      dictObj = dict;
    } else if (isNaN(dict)) {
      dictObj = helperServ.getStorageSync(dict);
    } else {
      dictObj = pgContext.data.dict[dict];
    }
    if (dictObj) {
      data[`${pack}${id}`] = dictObj[parseInt(v)].code;
    } else {
      helperServ.showToast({
        title: `错误提示：在字典${dict}中找不到索引${v}对应的代码`
      });
      return;
    }
  } else if (validx) {
    data[`${pack}${id}${validx}`] = v ;
  }  else {
    data[`${pack}${id}`] = v;
  }

  pgContext.setData(data);
  console.log(`${pgContext.route}**pack=${pack},id=${id},v=${v},dict=${dict}**`, data);
};
var setData=(pack,wrapObj,value)=>{
  validate.setData(pack,wrapObj,value);
}
var getData = (pack, pgContext) => {
  var d = pgContext ? pgContext.data : null;
  if (!pack) {
    pack = pgContext.pack;
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
          //console.log("pack error", v);
          helperServ.showModal({
            content: 'pack error:' + pack
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
  return d[pack];
}
var getPhoneNumber = (e, pgContext, pack) => {
  console.debug(e.detail.errMsg)
  console.debug(e.detail.iv)
  console.debug(e.detail.encryptedData)
  if (e && e.detail && e.detail.encryptedData) {
    helperServ.showLoading();
    loginServ.checkSession().then(res => {
      helperServ.hideLoading();
      if (res.is_login == '1') {
        decryptData(e.detail, pgContext, pack);
      } else {
        loginServ.login().then(res => {
          if (res.is_login == '1') {
            decryptData(e.detail, pgContext, pack);
            return;
          }
        })
      }
    });
  }
};
//res.result.data.phoneNumber, res.result.data.purePhoneNumber
var decryptData = (params, pgContext, pack) => {
  commServ.decryptWXData(params).then(res => {
    if (res.result && res.result.data) {
      var data = {};
      data[pack] = res.result.data; //phoneNumber,purePhoneNumber
      pgContext.setData(data);
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
      content: err.errMsg || err.message
    });
  });
};
var upLoadFile = function(imgarr, cloudPath, cb, storage) {
  var img = [];
  imgarr.forEach((v, i) => {
    if (v.status != '2') {
      //console.log('****will upload*****', v);
      img.push(v);
    }
  });
  console.log('****will upload*****', img);
  if (img.length == 0) {
    cb(null, {
      success: true
    });
    return;
  }
  upimg.batchUpLoadFile(img, cloudPath, storage).then(res => {
    //console.log('batchUpLoadFile enrollinfo', enrollinfo, img);
    if (res.success) {
      cb(null, res);
    } else {
      cb(res.errMsg, res);
    }
  }).catch(err => {
    cb(err.errMsg || err.message, null);
  });
}
var delImg2 = (img, cb) => {
  var upImg = new upimg({}, null, null);
  upImg.delImg(img.fileID, cb ? cb : (err, del, idx) => {

  });
}
var delImg = (e, pgContext, cb) => {
  var id = e.currentTarget.id,
    initflag = e.currentTarget.dataset.initflag,
    pack = e.currentTarget.dataset.pack,
    pack = pack ? pack : '',
    imgindex = e.currentTarget.dataset.imgindex;
  if (!initflag) {
    var img = getData(`${pack}${id}`, pgContext);
    if (img && img.length > imgindex && imgindex !== undefined && imgindex !== null && imgindex !== '') {
      img = img[imgindex];
    }
    if (!img) {
      cb ? cb(null) : null;
      return;
    }
    var upImg = new upimg({}, pgContext, null);
    upImg.delImg(img.fileID, cb ? cb : () => {
      var data = {};
      data[`${pack}${id}`] = null;
      pgContext.setData(data);
    });
  } else {
    if (imgindex === undefined || imgindex === null) {
      helperServ.showModal({
        content: '图片索引为空'
      });
      return;
    }
    var upImg = new upimg({}, pgContext, `${pack}${id}`);
    upImg.delImg(imgindex);
  }
  //cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/goods/tmp/IMGTMP20190727150940695924825d826ce.png
};

var chooseImg = (e, pgContext, upCfg, cb) => {
  var id = e.currentTarget.id,
    initflag = e.currentTarget.dataset.initflag,
    upCfg = upCfg ? upCfg : constants.UPIMG_CFG,
    maxwidth = e.currentTarget.dataset.maxwidth,
    //cloudid = e.currentTarget.dataset.cloudid,
    maxheight = e.currentTarget.dataset.maxheight,
    maxcount = e.currentTarget.dataset.maxcount,
    pack = e.currentTarget.dataset.pack,
    imgindex = e.currentTarget.dataset.imgindex,
    //cloudid = cloudid || upCfg.cloudid,
    cutimg = maxwidth || maxheight ? true : upCfg.cutimg,
    maxwidth = maxwidth ? parseInt(maxwidth) : upCfg.maxwidth,
    maxheight = maxheight ? parseInt(maxheight) : upCfg.maxheight,
    maxcount = maxcount ? parseInt(maxcount) : upCfg.maxcount,
    pack = pack ? pack : '',
    imgindex = imgindex || imgindex === 0 ? imgindex : null;
  var upImg = new upimg({
    selcount: maxcount,
    compressrate: 1 > upCfg.compressrate > 10 ? 10 : (upCfg.compressrate || 10),
    maxWidth: maxwidth,
    maxHeight: maxheight,
    cutImg: cutimg,
    outType: upCfg.imgtype
  }, pgContext, initflag ? `${pack}${id}` : null);

  if (!upImg.init()) {
    //delete upImg;
    return;
  }
  if (initflag) {
    upImg.chooseImg(e, (err, imginfo, all) => {
      cb && cb(err, imginfo, all);
    });
  } else {
    delImg(e, pgContext, (err, del, delIdx) => {
      upImg.chooseImg(e, (err, curImginfo, srcImgArr) => {
        cb && cb(err, curImginfo, srcImgArr);
        if (err) {
          return;
        }
        var data = {},
          cur = curImginfo.pop();
        if (!cur) {
          return;
        }
        imgindex!=null ? data[`${pack}${id}[${imgindex}]`] = cur : data[`${pack}${id}`] = cur;
        pgContext.setData(data);
      })
    });
  }
};
var showMultiCheckDlg = function(e, pgContext, dict) {
  var dict = dict ? dict : pgContext.data.dict[e.currentTarget.dataset.dict],
    id = e.currentTarget.id;
  var myDlg = pgContext.selectComponent('#modalDlg2');
  myDlg.showDlg({
    title: '多选输入框',
    poptype: "multicheck",
    inputlist: dict,
    btntext: ['取消', '确认'],
    submit: (e, cb) => {
      if (e.btnindex === 0) {
        cb();
        return;
      }
      try {
        var data = {};
        data[id] = e.inputlist.filter(v => v.active);
        pgContext.setData(data);
        cb();
      } catch (err) {
        cb(err);
        helperServ.showModal({
          content: err.message || err.errMsg
        })
      }
    }
  });
};
const PAGE_SIZE = 10;
var loadMore = function(actionFunc, params, isPull, self, pack, transfer) {
  if (!self.data.loadFinish) {
    self.batch_time ? self.batch_time++ : self.batch_time = 1;
    console.log("loadMore", self.batch_time);
  }
  pack = pack || 'inList';
  params.page_size = params.page_size ? params.page_size : PAGE_SIZE;
  actionFunc.call(self, params).then(res => {
    if (!res.result.data) {
      self.setData({
        loadFinish: true
      });
      helperServ.showModal({
        content: res.result.errMsg,
      })
      return;
    }
    var arr = res.result.data,
      tmpArr = getData(pack, self);
    if (transfer && arr) {
      arr = arr.map(v => {
        return transfer.reduce((pre, cur, arr) => {
          try {
            pre[cur[0]] = cur[1][0] === '$' ? validate.getData(cur[1].substr(1), v) : cur[1];
          } catch (e1) {
            console.log(`*******${cur[0]}:${cur[1]}*********`, pre);
            pre[cur[0]] = null;
          }
          return pre;
        }, {});
      });
    }
    isPull ? wx.stopPullDownRefresh() : null;
    console.log(`1.loadMore Data length: ${arr.length} loadFinish:`, self.data.loadFinish);
    if (!self.data.loadFinish) {
      //concat 性能可能好点,千万级的时候，哈哈
      //Array.prototype.push.apply(this.tmpArr, arr);
      var data = {};
      if (isPull) {
        data[pack] = arr;
      } else {
        data[pack] = tmpArr ? tmpArr.concat(arr) : arr;
      }
      data["totalNum"] = res.result.totalNum || 0;
      //self.tmpArr = self.tmpArr ? self.tmpArr.concat(arr) : arr;
      self.setData(data);
    }
    if (arr.length < params.page_size) {
      self.setData({
        loadFinish: true
      });
      if (!tmpArr || tmpArr.length == 0) {
        //this.refleshQR();
      }
      console.log(`2.loadMore Data length: ${arr.length}<${params.page_size} loadFinish[${tmpArr.length}]:`, self.data.loadFinish);
    } else {
      self.setData({
        loadFinish: false
      });
    }
  }).catch(err => {
    helperServ.showToast({
      title: JSON.stringify(err),
      icon:'none'
    })
  });
};
var loadMore2 = (manager, action, params, isPull, pg, cb) => {
  let data = {};
  if (!pg.data.loadFinish) {
    pg.data.batch_time ? pg.data.batch_time++ : pg.data.batch_time = 1;
    console.log("loadMore", pg.data.batch_time);
  }
  data[`batch_time`] = pg.data.batch_time;
  data[`requesting`] = true;
  pg.setData(data);
  wx.hideNavigationBarLoading()
  params.page_size = params.page_size || PAGE_SIZE;
  params.batch_time = pg.data.batch_time;
  rpc.doAction(params, action, manager).then(res => {
    if (!res.result.data) {
      helperServ.showModal({
        content: res.result.errMsg,
      })
      data[`requesting`] = false;
      data[`loadFinish`] = true;
      pg.setData(data);
      cb && cb(res.result.errMsg, null);
      return;
    }
    var arr = res.result.data;
    if (!pg.data.loadFinish) {
      if (isPull) {
        pg.data.listData = arr;
      } else {
        pg.data.listData = pg.data.listData.concat(arr)
      }
    }
    if (arr.length < params.page_size) {
      pg.data.loadFinish = true;
    } else {
      pg.data.loadFinish = false;
    }
    data[`requesting`] = false;
    data[`loadFinish`] = pg.data.loadFinish;
    data[`listData`] = pg.data.listData;
    pg.setData(data);
    cb && cb(null, res);
  }).catch(err => {
    data[`requesting`] = false;
    pg.setData(data);
    cb && cb(err.errMsg || err.message, null);
    helperServ.showToast({
      title: err.errMsg || err.message,
      icon: 'none'
    })
  });
};
var loadStateInfo = function(pgContext) {
  var states = helperServ.getStorageSync(constants.STKEY_STATEINFO);
  if (!states) {
    helperServ.showLoading({
      title: "数据加载中..."
    });
    mcommServ.getState({}).then(res => {
      helperServ.hideLoading();
      if (res.result && res.result.data && res.result.data.length > 0) {
        helperServ.setStorage(constants.STKEY_STATEINFO, res.result.data).then(res => {});
        pgContext.setData({
          states: res.result.data
        });
      }
    });
  } else {
    pgContext.setData({
      states: states
    });
  }
};
var loadDict = function(pgContext, dict) {
  cache.getDict(Object.keys(dict || pgContext.data.dict), (err, res) => {
    if (err) {
      return;
    }
    pgContext.setData({
      dict: res
    })
  });
};
var toKeys = function(obj, l) {
  var a = [];
  for (var k in obj) {
    if (l-- < 0) {
      break;
    }
    a.push(k);
  }
  return a;
}
/**
 * 
 * @param {*} obj 
 * @param {*} l -1 全部转换
 */
var toValues = function(obj, l) {
  if(!obj){
    return [];
  }
  var a = [];
  for (var k in obj) {
    if (l === 0) {
      break;
    }
    a.push(obj[k]);
    l&&l!=-1?--l:0;
  }
  return a;
}
var toObject = function(arr, key) {
  var obj = {};
  if (!arr) return null;
  arr.forEach(v => {
    obj[v[key]] = v;
  })
  return obj;
}
//动画集0 In,300 Out
var fadeInOut = function(pgContext, animation, trY) {
  animation.translateY(trY).step();
  pgContext.setData({
    animationData: animation.export()
  }); //动画实例的export方法导出动画数据传递给组件的animation属性
}
var hideDlg = function(data, pgContext, trY) {
  var animation = wx.createAnimation({
    duration: 300, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
    timingFunction: 'linear', //动画的效果 默认值是linear
  });
  fadeInOut(pgContext, animation, trY || 680); //调用隐藏动画  
  setTimeout(function() {
    pgContext.setData(data)
  }, 300) //先执行下滑动画，再隐藏模块
}
var showDlg = function(pgContext) {
  var animation = wx.createAnimation({
    duration: 300, //动画的持续时间 默认400ms   数值越大，动画越慢   数值越小，动画越快
    timingFunction: 'linear', //动画的效果 默认值是 linear ease
  });
  fadeInOut(pgContext, animation, 0); //调用显示动画
}
var getCloudPath = function(prefix) {
  var userinfo = app.getUserInfo();
  if (!userinfo && !helperServ.getUserInfo()) {
    helperServ.showModal({
      content: "您还未登陆",
      success: (res) => {
        if (res.confirm) {
          helperServ.goToPage("/pages/login/login");
        }
      }
    });
    return;
  } else {
    userinfo = helperServ.getUserInfo();
    app.setUserInfo(userinfo);
  }
  return `${prefix}/${userinfo.region || constants.REGION_CODE}/${userinfo.openid}`;
}
var goToPage = function(e, pgContext, userinfo) {
  var page = e.currentTarget.dataset.page,
    params = e.currentTarget.dataset.params,
    info = '';
  if (userinfo) {
    info = `avatarurl=${encodeURIComponent(userinfo.avatarurl)}&username=${encodeURIComponent(userinfo.username || userinfo.nickname)}&phone=${userinfo.phone}&shopid=${userinfo.shopinfo.shopid}`
  }
  params = !!params ? "?" + params + "&" + info : "?" + info;
  helperServ.goToPage((page[0]==='/'?`${page}${params}`:`../${page}/${page}${params}`)); 
}
var openLocation = function(latitude, longitude) {
  wx.openLocation({
    latitude,
    longitude,
    scale: 18
  });
}
/**
 * 
 * {
      id: rect.id, // 节点的ID
      dataset: rect.dataset, // 节点的dataset
      left: rect.left, // 节点的左边界坐标
      right: rect.right, // 节点的右边界坐标
      top: rect.top, // 节点的上边界坐标
      bottom: rect.bottom, // 节点的下边界坐标
      width: rect.width, // 节点的宽度
      height: rect.height // 节点的高度
    }
 */
var getEleRect = function(id, pageContext, cb, self) {
  var query = null;
  if (self) {
    query = self.createSelectorQuery().in(pageContext);
  } else {
    query = wx.createSelectorQuery().in(pageContext);
  }
  //获取可视区域大小scrollHeight/scrollWidth。否则是滚动区域大小(包含可滚动看不见的)
  //query.selectViewport();
  query.select(id).boundingClientRect((rect) => {
    if (!rect) {
      console.log("*******pageServ.getRect******", id + "未定义或未成功加载");
      helperServ.showToast({
        title: id + "未定义或未成功加载"
      });
      cb({});
      return;
    }
    //console.log("*******getRect******", rect);
    cb({
      scrollHeight: 0,
      scrollWidth: 0,
      scrollTop: 0,
      scrollLeft: 0,
      id: rect.id, // 节点的ID
      dataset: rect.dataset, // 节点的dataset
      left: rect.left, // 节点的左边界坐标
      right: rect.right, // 节点的右边界坐标
      top: rect.top, // 节点的上边界坐标
      bottom: rect.bottom, // 节点的下边界坐标
      width: rect.width, // 节点的宽度
      height: rect.height // 节点的高度
    });
  }).exec();
  return;
  /*
  if (viewport){
    query.selectViewport().scrollOffset();
  }
  query.exec();*/
}
var getEleRect2 = function(id, pageContext, cb, self, viewport) {
  var query = null;
  if (self) {
    query = self.createSelectorQuery().in(pageContext);
  } else {
    query = wx.createSelectorQuery().in(pageContext);
  }
  //获取可视区域大小scrollHeight/scrollWidth。否则是滚动区域大小(包含可滚动看不见的)
  //query.selectViewport();
  query.select(id).boundingClientRect();
  if (viewport) {
    query.selectViewport().scrollOffset();
  }
  query.exec((rect) => {
    if (!rect || !rect[0]) {
      console.log("*******pageServ.getRect******", id + "未定义或未成功加载");
      helperServ.showToast({
        title: id + "未定义或未成功加载"
      });
      return;
    }
    //console.log("*******getRect******", rect);
    cb({
      scrollHeight: rect.length > 1 ? rect[1].scrollHeight : 0,
      scrollWidth: rect.length > 1 ? rect[1].scrollWidth : 0,
      scrollTop: rect.length > 1 ? rect[1].scrollTop : 0,
      scrollLeft: rect.length > 1 ? rect[1].scrollLeft : 0,
      id: rect[0].id, // 节点的ID
      dataset: rect[0].dataset, // 节点的dataset
      left: rect[0].left, // 节点的左边界坐标
      right: rect[0].right, // 节点的右边界坐标
      top: rect[0].top, // 节点的上边界坐标
      bottom: rect[0].bottom, // 节点的下边界坐标
      width: rect[0].width, // 节点的宽度
      height: rect[0].height // 节点的高度
    });
  });
}
/**
 * options:{
 * menuid,
 * menulist,
 * pos,
 * yoffset,
 * xoffset,
 * ctype
 * }
 */
var showMenu = function(pgContext, options) {
  var myMenu = pgContext.selectComponent(options.menuid),
    pos = options.pos;
  myMenu.setMenu(options.menulist, options.title, options.maxWidth);
  var x = pos.left - myMenu.getWidth() + options.xoffset,
    y = pos.bottom + pos.scrollTop + (!isNaN(options.yoffset) && options.yoffset);
  //pos.width 按钮宽度
  const menuH = myMenu.getHeight(); // + pos.width;
  // viewPort = pos.scrollHeight - pos.scrollTop;
  if (app.getWinHeight() - pos.bottom < menuH) {
    //如果当前坐标+弹出菜单高度大于剩余可视，那么往上弹
    y -= menuH;
    if (pos.bottom < menuH) {
      //上面高度也不够，调整（menuH - pos.bottom）
      y += menuH - pos.bottom;
    }
  }
  if (pos.left < myMenu.getWidth()) {
    x += (myMenu.getWidth() - pos.left);
  }
  /*
  if (x<pos.width){
    x += (pos.width-x);
  }*/
  // console.log("viewPort", viewPort, pos.bottom, viewPort - pos.bottom, app.systemInfo.windowHeight);
  myMenu.show({
    mask: 'none',
    ctype: options.ctype,
    posi: {
      left: x,
      top: y
    },
    className: 'menu-dialog',
    poptype: "menu"
  });
}
var getSystemInfo = function(options){
  wx.getSystemInfo(options);
}
var setWinHgh = function(pg,offsetY) {
  getSystemInfo({
    success: (res) => {
      pg.setData({
        windowHeight: res.windowHeight - (offsetY||0)
      })
    }
  });
}
module.exports = {
  setWinHgh: setWinHgh,
  getPx: getPx,
  getRpx: getRpx,
  showMenu: showMenu,
  getEleRect: getEleRect,
  getEleRect2: getEleRect2,
  openLocation: openLocation,
  inputTogger: inputTogger,
  getPhoneNumber: getPhoneNumber,
  decryptData: decryptData,
  getData: getData,
  setData:setData,
  upLoadFile: upLoadFile,
  chooseImg: chooseImg,
  delImg: delImg,
  delImg2: delImg2,
  showMultiCheckDlg: showMultiCheckDlg,
  loadMore: loadMore,
  loadMore2: loadMore2,
  loadStateInfo: loadStateInfo,
  loadDict: loadDict,
  toValues: toValues,
  toObject: toObject,
  toKeys: toKeys,
  hideDlg: hideDlg,
  showDlg: showDlg,
  getCloudPath: getCloudPath,
  getSystemInfo:getSystemInfo,
  goToPage: goToPage
}