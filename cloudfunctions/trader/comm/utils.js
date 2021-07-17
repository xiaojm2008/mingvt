var dateFormat = (dt, fmt) => {
  fmt = fmt||"yyyy-MM-dd hh:mm:ss";
  var y = dt.getFullYear();
  var m = dt.getMonth() + 1;
  var day = dt.getDate();
  var h = dt.getHours();
  var min = dt.getMinutes();
  var sec = dt.getSeconds();
  var SS = dt.getMilliseconds();
  var o = {
    "y+": y,
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
var getYear=(dt)=>{
  return dt.getFullYear();
}
const dateArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

var strToDate = (str,offset) => {
  if (!!str) {
    let day = null;
    let tmp = str.split("-");
    if (tmp.length == 1) {
      let y = str.substr(0, 4);
      let m = str.substr(4, 2);
      let d = str.substr(6, 2);
      tmp = [y, m, d];
    } else {
      day = tmp[2].split(" ");
    }
    let other = null;
    let hmsArr = [0, 0, 0];

    if (day && day.length > 1) {
      other = day[1];
      let hms = other.split(":");
      for (let i = 0; i < hms.length; i++) {
        hmsArr[i] = parseInt(hms[i]);
      }
    }
    return new Date(parseInt(tmp[0]), parseInt(tmp[1]) - 1, day ? parseInt(day[0]) : parseInt(tmp[2]), offset?hmsArr[0]+offset:hmsArr[0], hmsArr[1], hmsArr[2]);
  }
  return null;
}
var calcDate = (str, day) => {
  let tmp = strToDate(str);
  return new Date(tmp.getTime() + day * 24 * 60 * 60 * 1000);
}
var calcDate2 = (dt, day) => {
  return new Date(dt.getTime() + day * 24 * 60 * 60 * 1000);
}
var isLeapYear = (Year) => {
  if (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0)) {
    return (true);
  } else {
    return (false);
  }
}
/**
 * 
 * @param {*} beg 
 * @param {*} end 
 * @param {*} code  '1','按日' '2','按周' '3','按月','4':'季','5':'年'
 * @param {*} flag 
 */
var getDate = (beg, end, code, flag) => {
  let begindate = null;
  let enddate = null;
  //指定时间段
  if ('6' == code) {
    if (flag == '0') { //往前
      begindate = calcDate(beg, -1);
      enddate = calcDate(end, -1);
    } else {
      begindate = calcDate(beg, 1);
      enddate = calcDate(end, 1);
    }
  } else if ("0" == code) {    
    begindate = calcDate(beg, 0);  
    enddate = begindate;
  } else if ("1" == code) {
    if (flag == '0') { //往前
      begindate = calcDate(beg, -1);
    } else {
      begindate = calcDate(beg, 1);
    }
    enddate = begindate;
  } else if ("2" == code) {
    //周
    if (flag == '0') {
      enddate = calcDate(beg, -1);
      let week = enddate.getDay();
      let bef = (week > 0 ? week - 1 : 6);
      begindate = calcDate2(enddate, 0 - bef);
    } else {
      begindate = calcDate(end, 7);
      let week = begindate.getDay();
      let bef = (week > 0 ? week - 1 : 6);
      begindate = calcDate2(begindate, 0 - bef);
      enddate = calcDate2(begindate, 6);
    }
  } else if ("3" == code) {
    //月
    if (flag == '0') {
      let tmp = strToDate(beg);
      let m = tmp.getMonth();
      let y = tmp.getFullYear();
      let d = "01";
      if (m == 0) {
        y -= 1;
        m = 12;
      }
      if (m == 2) {
        d = isLeapYear(y) ? "29" : "28";
      } else {
        d = dateArr[m - 1] + '';
      }
      let ms = m <= 9 ? '0' + m : m + '';
      begindate = y + ms + "01";
      enddate = y + ms + d;
    } else {
      let tmp = strToDate(beg);
      let m = tmp.getMonth() + 2;
      let y = tmp.getFullYear();
      let d = "01";
      if (m == 13) {
        y += 1;
        m = 1;
      }
      if (m == 2) {
        d = isLeapYear(y) ? "29" : "28";
      } else {
        d = dateArr[m - 1] + '';
      }
      let ms = m <= 9 ? '0' + m : m + '';
      begindate = y + ms + "01";
      enddate = y + ms + d;
    }
    begindate = strToDate(begindate);
    enddate = strToDate(enddate);
  } else if ("4" == code) {
    //季
    /**
     * beg = strToDate(end);
      let r = Math.round((beg.getMonth()+1) / 3);
      return `${beg.getFullYear()}年${r}季度`;
     */
    beg = strToDate(beg);
    end = strToDate(end);
    if (flag == '0') {

      begindate = new Date(new Date(beg.getTime()).setMonth(beg.getMonth() - 3));
      enddate = new Date(new Date(end.getTime()).setMonth(end.getMonth() - 3));
    } else {
      begindate = new Date(new Date(beg.getTime()).setMonth(beg.getMonth() + 3));
      enddate = new Date(new Date(end.getTime()).setMonth(end.getMonth() + 3));
    }
  } else if ("5" == code) {
    /*
     end = CommUtils.strToDate(end);
     return `${end.getFullYear()}年`;
    */
    beg = strToDate(beg);
    end = strToDate(end);
    if (flag == '0') {
      begindate = new Date(new Date(beg.getTime()).setFullYear(beg.getFullYear() - 1));
      enddate = new Date(new Date(end.getTime()).setFullYear(end.getFullYear() - 1));
    } else {
      begindate = new Date(new Date(beg.getTime()).setFullYear(beg.getFullYear() + 1));
      enddate = new Date(new Date(end.getTime()).setFullYear(end.getFullYear() + 1));
    }
  }
  return {
    begdate: begindate,
    enddate: enddate,
    code: code
  };
}
/**
 * 
 * @param {*} begdate 20200101
 * @param {*} enddate 20200108
 * @param {*} code  '1','按日' '2','按周' '3','按月','4':'季','5':'年'
 */
var goPreDate = (begdate, enddate, code) => {
  let dt = getDate(begdate, enddate, code, '0');
  return {
    begdate: dateFormat(dt.begdate, "yyyy-MM-dd"),
    enddate: dateFormat(dt.enddate, "yyyy-MM-dd"),
    code: dt.code
  }
}
var goNextDate = (begdate, enddate, code) => {
  let dt = getDate(begdate, enddate, code, '1');
  return {
    begdate: dateFormat(dt.begdate, "yyyy-MM-dd"),
    enddate: dateFormat(dt.enddate, "yyyy-MM-dd"),
    code: dt.code
  }
}
var getDateObj = (dt) => {
  var beg = strToDate(dt);
  return {
    year: beg.getFullYear(),
    season: Math.round((beg.getMonth() + 1) / 3),
    month: beg.getMonth() + 1,
    day:beg.getDate(),
    dt: beg  
  }
}
/*
db.createCollection("stats_incomeyear")
db.createCollection("stats_incomeseason")
db.createCollection("stats_incomemonth")
db.createCollection("stats_incomeweek")
db.createCollection("stats_incomeday")
*/
module.exports = {
  getYear:getYear,
  strToDate:strToDate,
  calcDate:calcDate,
  calcDate2:calcDate2,
  getDateObj:getDateObj,
  goPreDate: goPreDate,
  goNextDate: goNextDate,
  dateFormat: dateFormat
}