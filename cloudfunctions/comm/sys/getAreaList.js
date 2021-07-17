// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: require('../env.js')
})
// 云函数入口函数
module.exports = async(event, context) => {
  /*
  0:prov level
  1:city level
  2:distince:level
  */
  const {
    areatype,
    areacode
  } = event;
  return new Promise((resolve, reject) => {
    const db = cloud.database();
    if (areatype == "0") {
      db.collection("sys_prov").get().then(res => {
        resolve({
          data: res.data
        });
      }).catch(err => {
        reject(err);
      });
    } else if (areatype == "1") {
      if (areacode == null || "" == areacode) {
        db.collection("sys_city").get().then(res => {
          resolve({
            data: res.data
          });
        }).catch(err => reject(err));
      } else {
        db.collection("sys_city").where({
          prov: areacode
        }).get().then(res => {
          resolve({
            data: res.data
          });
        }).catch(err => reject(err));
      }
    } else if (areatype == "2") {
      if (areacode == null || "" == areacode) {
        db.collection("sys_area").get().then(res => {
          resolve({
            data: res.data
          });
        }).catch(err => reject(err));
      } else {
        db.collection("sys_area").where({
          city: areacode
        }).get().then(res => {
          resolve({
            data: res.data
          });
        }).catch(err => reject(err));
      }
    } else if (areatype == "3") {
      db.collection("sys_prov").get().then(res1 => {
        db.collection("sys_city").get().then(res2 => {
          db.collection("sys_area").get().then(res3 => {
            resolve({
              data1: res1.data,
              data2: res2.data,
              data3: res3.data
            });
          }).catch(err3 => {
            reject(err3)
          });
        }).catch(err2 => {
          reject(err2)
        });
      });
    } else {
      reject("参数有误");
    }
  });
}