const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
const db = cloud.database();

var _toNodes=(node)=> {
  if (!node.children) {
    if (node.define) {
      node.children = node.define.map((item, i) => {
        return item;
      });
      //console.log(`*******_toNodes node.children is undefined but node.define is exists***********`);
    }
  }
  if (node.children) {
    var add = {};
    node.children.forEach((v, i, arr) => {
      if (v.define) {
        add[i] = v.define.map((item, i) => {
          return item;
        })
        //console.log(`*******_toNodes find define splice ${i}***********`);
      }
    });
    var l = 0;
    for (var k in add) {
      var p = parseInt(k) + l;
      var a1 = add[k];
      l = l + a1.length - 1;
      //console.log(`******posi=${p} k=${k} len=${l}******`);
      a1.unshift(p, 1)
      Array.prototype.splice.apply(node.children, a1);
      //console.log(`******posi=${p} k=${k} len=${l}****node=`);
    }
  }
  return {
    id: node.id,
    name: node.name,
    attrs: node.attrs,
    value: node.value || '',
    url:node.url||'',
    event:node.event||'',
    children: node.children && node.children.map((v, i, arr) => {
      return _toNodes(v)
    })
  };
}
var toNodes=(defines)=> { 
  return defines.map((item, i) => {
    return _toNodes(item);
  });
}
module.exports = async (event, wxContext) => {
  const {
    transtype,
    actionname,
    shopid
  } = event;
  if (!shopid) {
    return {
      errMsg: '参数错误'
    }
  }
  var res = await db.collection('xlh_shopthema').where({
    shopid: shopid
  }).get();
  if(res.data && res.data.length>0){
    return {
      errMsg:"success",
      data:toNodes(res.data[0].thema)
    }
  }
  return null;
}