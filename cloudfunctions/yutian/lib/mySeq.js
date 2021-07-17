var prefixZero =(num, length) =>{
  return ("000" + num).substr(-length);
}
var times = () => {
  var now = new Date();
  var y = now.getFullYear()+'';
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
//XXX20191017090105434FE23F2DD8888 3+17+16=36
var mySeq = (prefix) => {
  return `${prefix}${times()}${S4()}${S4()}${S4()}${S4()}`;
}
//XXX4073590865434
var mySeq32 = (prefix) => {
  return `${prefix}${new Date().getTime()}${S4()}${S4()}${S4()}${S4()}`;
}
module.exports = {
  prefixZero: prefixZero,
  nowStr:times,
  S4: S4,
  mySeq: mySeq,
  mySeq32: mySeq32
};