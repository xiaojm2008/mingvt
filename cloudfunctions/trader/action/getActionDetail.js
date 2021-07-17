const formatter = require('../comm/deltafor/detlaformater.js');
const cloud = require('wx-server-sdk')
cloud.init({
  env: require("../env.js")
})
// 云函数入口函数
module.exports = async (event, context) => {
  //const wxContext = cloud.getWXContext();
  if(!event.actionid){
    return {
      errMsg:"参数错误"
    }
  }
  const db = cloud.database({
    throwOnNotFound: false
  });

  var res = await db.collection('xlh_enrollaction').doc(event.actionid).get();

  var nodes = {};
  if (res.data && !res.data.formatterflag){
    nodes = formatter.transform(res.data.description);
    res.data.description2 = [nodes];
  }
  if (formatter.isWillRefresh(res.data.imgurlupdatetime)){
    await formatter.refreshImgNodes(nodes, 'xlh_enrollaction', res.data._id);
  }
  return res;
}

/*
     [{
      "name": "strong",
      "attrs": {
        "style": "text-align:right;"
      },
      "children": [
        {
          "name": "span",
          "attrs": {
            "style": "font-weight:bold;font-size:30px"
          },
          "type": "text",
          "text": "上面的书帮我看看有没有借！"
        },
        {
          "name": "img",
          "attrs": {
              "couldPath": "undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg",
              "digest": "d4dbc8c0b61c1400251a036c838824fd",
              "fileID": "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg",
              "fileID2": "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg",
              "tempPath": "wxfile://tmp_53bd8971edb05f1c3622158d40249b100f064ebddd604ef2.png",
              "widht": "393",
              "height": "813",
              "size": "388158",
            "class": "",
            "style": "max-width:100%;vertical-align:top",
            "src": "https://6d69-mingvt-f8c412dd-1258088923.tcb.qcloud.la/undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg"
          },
        },
      ]
    }]; */
    /*
    res.data[0].description = [{
      name: 'p',
      text:"",
      type:"",
      attrs: {
        class: 'div_class',
        style: 'line-height: 60px; color: red;'
      },
      children: [{
        name:"span",
        type: 'text',
        text: 'Hello&nbsp;World!'
      },
        {
          "children": [],
          "attrs": {},
          name: "span",
          type: 'text',
          text: 'Hello&nbsp;World!'
        }, {
          "name": "img",
          "attrs": {
            "dataset": { //不能用对象
              "couldPath": "undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg",
              "digest": "d4dbc8c0b61c1400251a036c838824fd",
              "fileID": "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg",
              "fileID2": "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg",
              "tempPath": "wxfile://tmp_53bd8971edb05f1c3622158d40249b100f064ebddd604ef2.png",
              "widht": "393",
              "height": "813",
              "size": "388158"
            },
            "class":"",
            "style": "max-width:100%;vertical-align:top",
            "src": "https://6d69-mingvt-f8c412dd-1258088923.tcb.qcloud.la/undefined/description/fabb0291_56cb1d198d0f_9ae5a66f_7b23.jpg"
          },
          "children": [],
          "type": "",
          "text": ""
        }]
    }];*/