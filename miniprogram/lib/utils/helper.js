
var subStrByPos=(s, pos)=> {
  var t = [],
    i = s.length - 1;
  for (; i >= 0; i--) {
    if (s[i] == '.') {
      pos--;
    }
    if (pos == 0) {
      i++;
      break;
    }
  }
  return s.substring(i);
}

var isNNull=(val)=>{
  return val===undefined || val===null || val==="";
}
var setStorage = (key, data) => {
  return new Promise((resolve, reject) => {
    wx.setStorage({
      key: key,
      data: data,
      success: function(res) {
        resolve(res);
      },
      fail: function(err) {
        console.log(`save ${key} fail`, err);
        reject(err);
      }
    })
  })
};
var callPhone = (phone) =>{
  wx.makePhoneCall({
    phoneNumber: phone
  })
}
var showActionSheet = (options)=>{
  wx.showActionSheet(options);
}
var getStorageSync = (key) => {
  return wx.getStorageSync(key);
};
var setStorageSync=(key,value)=>{
  try {
    wx.setStorageSync(key, value);
  } catch (e) { 
    wx.showModal({
      title: '提示',
      content: e.message,
    })
  }
}
var getStorage = (key) => {
  return new Promise((resolve, reject) => {
    wx.getStorage({
      key: key,
      success: function(res) {
        resolve(res.data);
      },
      fail: function(err) {
        console.log(`get ${key} fail`, err);
        reject(err);
      }
    })
  });
};

var getUserInfo = () => {
  return wx.getStorageSync('user_info');
};

var setUserInfo = (userInfo) => {
  /*
  var _userInfo = {};
  for (var key in userInfo) {
    _userInfo[key.toLocaleLowerCase()] = userInfo[key];
  }*/
  return setStorage(
    'user_info',
    userInfo
  );
};
var getSessionKey = () => {
  return wx.getStorageSync('session_key');
};
var setSessionKey = (session_key) => {
  wx.setStorage({
    key: 'session_key',
    data: session_key
  });
}
var showActionSheet=(options)=>{
  wx.showActionSheet(options);
}
var showModal = (options) => {
  wx.showModal(options);
}
var encodeURIPostParam = (obj) => {
  let query = '',
    name, value, fullSubName, subName, subValue, innerObj, i;

  for (name in obj) {
    value = obj[name];

    if (value instanceof Array) {
      for (i = 0; i < value.length; ++i) {
        subValue = value[i];
        fullSubName = name + '[' + i + ']';
        innerObj = {};
        innerObj[fullSubName] = subValue;
        query += this.encodeURIPostParam(innerObj) + '&';
      }
    } else if (value instanceof Object) {
      for (subName in value) {
        subValue = value[subName];
        fullSubName = name + '[' + subName + ']';
        innerObj = {};
        innerObj[fullSubName] = subValue;
        query += this.encodeURIPostParam(innerObj) + '&';
      }
    } else if (value !== undefined && value !== null)
      query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
  }

  return query.length ? query.substr(0, query.length - 1) : query;
};
const tabBarPagePathArr = '["/pages/index/index","/pages/category/category","/pages/myCart/myCart","/pages/index/index"]';

var switchToTab = (url) => {
  wx.switchTab({
    url: url
  });
};
var getTabPagePathArr = () => {
  return JSON.parse(tabBarPagePathArr);
};
var goToPage = (url, isRedirect) => {
  var tabBarPagePathArr = getTabPagePathArr();
  // tabBar中的页面改用switchTab跳转
  if (tabBarPagePathArr.indexOf(url) != -1) {
    switchToTab(url);
    return;
  }
  if (!isRedirect) {
    wx.navigateTo({
      url: url
    });
  } else {
    wx.redirectTo({
      url: url
    });
  }
};
var getCurrPage=function(){
  var p = getCurrentPages();  
  return p[p.length - 1]; //获取当前页面的对象
};
var getPrePage=function(){
  var p = getCurrentPages();  
  if(p.length===1){
    return null;
  }
  return p[p.length - 2];
};
var goBack = function() {
  wx.navigateBack();
};

var strToDate = (str) => {
  if (!!str) {
    str = str.replace('T', ' ').replace('Z', '');
    let tmp = str.split("-");
    let day = tmp[2].split(" ");
    let other = null,
      hour = 0,
      min = 0,
      sec = 0;
    let hmsArr = [0, 0, 0];

    if (day.length > 1) {
      other = day[1];
      let hms = other.split(":");
      for (let i = 0; i < hms.length; i++) {
        hmsArr[i] = hms[i];
      }
    }
    return new Date(tmp[0], parseInt(tmp[1]) - 1, day[0], hmsArr[0], hmsArr[1], hmsArr[2]);
  }
  return null;
}
var toISOString = (dt) => {
  let tmp = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours() + 8, dt.getMinutes(), dt.getSeconds());
  return tmp.toISOString();
}
var diff = (milli, offset, src, fmt, timer) =>{
  var time = 0;
  if (isNaN(milli)) {
    time = new Date(milli);
    if (offset && offset > 0) {
      time = time.getTime();
      time = new Date(time + offset);
    }
  } else {
    time = new Date(milli + (offset || 0));
  }
  time = time.getTime();
  time = time - (src||(new Date).getTime());
  if(time<=0){
    console.log("**********time end*******");
    if(timer){
      console.log("**********kill timer*******");
      clearInterval(timer);
      timer = null;
    }
    return "00:00:00";
  }
  var h = time/1000/60/60,
  h1 = parseInt(h),
  m = (h - h1)*60,
  m1 = parseInt(m),
  s = parseInt((m-m1)*60);
  if (!fmt) {
    return (h < 10 ? '0' + h : h) + ':' + (mm < 10 ? '0' + mm : mm);
  } else {
    return (h1 < 10 ? '0' + h1 : h1) + ':' + (m1 < 10 ? '0' + m1 : m1) + ':' + (s < 10 ? '0' + s : s);
  }
}
var dateFormat = (dt, fmt) => {
  var y = dt.getFullYear();
  var m = dt.getMonth() + 1;
  var day = dt.getDate();
  var h = dt.getHours();
  var min = dt.getMinutes();
  var sec = dt.getSeconds();
  var SS = dt.getMilliseconds();
  var o = {
    "M+": m,
    "d+": day,
    "h+": h,
    "m+": min,
    "s+": sec,
    "q+": Math.floor((m + 2) / 3),
    "S+": SS
  };
  if (/(y+)/.test(fmt)) {
    let p1 = RegExp.$1;
    let ys = y.toString();
    fmt = fmt.replace(p1, ys.substr(4 - p1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      let p1 = RegExp.$1;
      var v = o[k];
      var sv = "00" + v;
      var v2 = sv.substr(("" + v).length);
      //alert(p1 + ":"+"2ms12".substr(3));
      fmt = fmt.replace(p1, (p1.length == 1) ? v : v2);
    }
  }
  return fmt;
};
var dateFormat2 = (dtimes,fmt) => {
  if (!dtimes) {
    return "-";
  }
  return dateFormat(new Date(dtimes), fmt?fmt:'yyyy-MM-dd hh:mm:ss');
};
var curDate = ()=>{
  var n = new Date();
  var m = n.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = n.getDate();
  d = d < 10 ? ('0' + d) : d;
  return '' + n.getFullYear() + m + d;
};
var hideLoading = function() {
    wx.hideLoading();
};
var showLoading = function (options) {
  wx.showLoading(options ? options:{title:'请稍等...'})
};
var showToast = function(options){
  wx.showToast(options);
}
var scanCode = function(options){
  wx.scanCode(options);
}
var previewImg = function (imginfo,cur) {
  wx.previewImage({
    current: imginfo[cur].fileID || imginfo[cur].path, // 当前显示图片的http链接
    urls: imginfo.map(v => v.fileID || v.path) // 需要预览的图片http链接列表
  })
}
var dictTrs = function (dict, code, def, dictCache,showcode) {
  console.log('code=' + code);
  if (code === undefined || code === '') { return def }
  if(!Array.isArray(dict)){
    if(!isNaN(dict)){
      dict = dictCache[dict];
    }
    if(!dict || dict.length ===0){
      return "";
    }
  }
  //var id = parseInt(code);  
  //return dict[id].name || dict[id].cname.trim();
  for (var i = 0; i < dict.length; i++) {
    if (dict[i].code == code) {
      console.log('code=' + code + ":name=" + dict[i].name || dict[i].cname);
      return showcode?code + "-" + (dict[i].name || dict[i].cname.trim()):(dict[i].name || dict[i].cname.trim());
    }
  }
  if (i == dict.length) {
    console.log('code=' + code + ":name=[-]");
    return code + "--";
  }
}
var toFixed =(num, radio)=> {
  if (num) {
    return radio ? num.toFixed(radio) : num.toFixed(2);
  }
  return num;
}
var addUserShopInfo = function(remoteshop,userinfo,localshop){
  userinfo.shopinfo = remoteshop ? remoteshop :{
    shopid: localshop.shopid,
    shopname: localshop.shopname,
    basedir: localshop.basedir,
    local:'1',
    status: '1'
  }
  setUserInfo(userinfo);
}
module.exports = {
  toFixed:toFixed,
  dictTrs:dictTrs,
  isNNull: isNNull,
  subStrByPos: subStrByPos,
  toISOString: toISOString,
  strToDate: strToDate,
  curDate: curDate,
  diff:diff,
  dateFormat2: dateFormat2,
  dateFormat: dateFormat,
  setStorage: setStorage,
  getStorage: getStorage,
  getStorageSync: getStorageSync,
  setStorageSync: setStorageSync,
  showActionSheet: showActionSheet,
  showToast: showToast,
  showModal: showModal,
  showLoading:showLoading,
  hideLoading:hideLoading,
  encodeURIPostParam: encodeURIPostParam,
  getUserInfo: getUserInfo,
  setUserInfo: setUserInfo,
  addUserShopInfo: addUserShopInfo,
  getSessionKey: getSessionKey,
  setSessionKey: setSessionKey,
  getCurrPage: getCurrPage,
  getPrePage:getPrePage,
  goToPage: goToPage,
  goBack: goBack,
  switchToTab: switchToTab,
  previewImg: previewImg,
  scanCode:scanCode,
  callPhone:callPhone,
  showActionSheet:showActionSheet
}