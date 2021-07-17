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

module.exports = dateFormat;