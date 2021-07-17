const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var rStr = (len) => {
  var data = '';
  for (var i = 0; i < len; i++) {
    var idx = parseInt(Math.random() * (chars.length - 1));
    data += chars[idx];
  }
  return data;
}
var prefixZero =(num, n) =>{
  //return ("000" + num).substr(-n);
  return (Array(n).join(0) + num).slice(-n);
}
var times = () => {
  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();
  var h = now.getHours();
  var mm = now.getMinutes();
  var s = now.getSeconds();
  var mi = prefixZero(now.getMilliseconds(),3);
  return y + (m < 10 ? '0' + m : m) + (d < 10 ? '0' + d : d) + (h < 10 ? '0' + h : h) + (mm < 10 ? '0' + mm : mm) + (s < 10 ? '0' + s : s) + mi;
}

//aef3
var S4 = () => {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
var S16 = ()=>{
  return mySeq.S4() + mySeq.S4() + mySeq.S4() + mySeq.S4();
}
var S12 = () => {
  return mySeq.S4() + mySeq.S4() + mySeq.S4();
}
var S8 = () => {
  return mySeq.S4() + mySeq.S4();
}
//XXXX20190808182020666FE23F2DD8888EWEE 17+12=29
var mySeq = (prefix) => {
  return `${prefix}${times()}${S4()}${S4()}${S4()}`;
}

module.exports = {
  prefixZero: prefixZero,
  nowStr:times,
  mySeq: mySeq,
  rStr:rStr,
  S4: S4,
  S8: S8,
  S12: S12,
  S16: S16
};