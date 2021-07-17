/*!
 * detlaformater.js
 * xiaojinming - v1.0.0 (2020-03-21)
 * Released under MIT license
 */
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
const formats = require('./formats.js');

const formatList = Object.keys(formats).sort(function (a, b) {
  return (formats[b].priority || 0) - (formats[a].priority || 0);
}).map(function (n) {
  return formats[n];
});

var tokenize = function (ops) {
  var retVal = [],
    op;
  //var  attrs = {};
  for (var i in ops) {
    op = ops[i];
    if (typeof op.insert !== 'string') {
      //attrs = {}; //加入后就清理干净
      if (op.insert && op.insert.image) {
        retVal.push({
          type: 'image',
          contents: op.insert,
          attributes: op.attributes || {}
        });
      } else {
        retVal.push({
          type: 'text',
          contents: op.insert,
          attributes: op.attributes || {}
        });
      }
    } else if (op.insert === '\n') {
      //Object.assign(attrs, op.attributes);
      retVal.push({
        type: 'linebreak',
        attributes: op.attributes || {}
      });
      //attrs = {}; //加入后就清理干净
    } else if (op.insert.indexOf('\n') < 0) {
      retVal.push({
        type: 'text',
        contents: op.insert,
        attributes: op.attributes || {}
      });

      /*文本中没有换行符，而且有设置文本style属性，那么手动插入一个分割行对象，因为文本设置rich-text 中attrs.style不能生效
      if (op.attributes){
        retVal.push({
          type: 'linebreak',
          contents: '',
          attributes: op.attributes || {}
        });
      }*/
      if (op.attributes && Object.keys(op.attributes).length > 0) {
        // Object.assign(attrs, op.attributes);
      }
    } else {
      var contents = op.insert;
      while (contents.length) {
        var nextNewline = contents.indexOf('\n');
        if (nextNewline === -1) {
          retVal.push({
            type: 'text',
            contents: contents,
            attributes: op.attributes || {}
          });
          contents = '';
          if (op.attributes && Object.keys(op.attributes).length > 0) {
            //Object.assign(attrs, op.attributes);
          }
        } else if (nextNewline === 0) {
          retVal.push({
            type: 'linebreak',
            attributes: {} //xjm add 
          });
          contents = contents.slice(nextNewline + 1);
          //attrs = {}; //加入后就清理干净
        } else {
          //Object.assign(attrs, op.attributes);
          retVal.push({
            type: 'text',
            contents: contents.slice(0, nextNewline),
            attributes: op.attributes || {}
          });
          retVal.push({
            type: 'linebreak',
            attributes: op.attributes || {}
          });
          contents = contents.slice(nextNewline + 1);
          //attrs = {}; //加入后就清理干净
        }
      }
    }
  }
  if (retVal.length > 0 && retVal.slice(-1)[0].type !== 'linebreak') {
    retVal.push({
      type: 'linebreak',
      attributes: {}
    });
  }
  return retVal;
}

var build = function (token) {
  if (token.type == 'image') {
    console.log('build ', token);
  }
  const matchingFormats = formatList
    .filter(format => format.matches && format.matches(token))
    .map(N => new N(token));
  if (matchingFormats.length === 0) {
    return new formats.TreeNode();
  }
  const retVal = matchingFormats.shift();
  matchingFormats.reduce((prev, curr) => {
    prev.children = [curr]; // eslint-disable-line no-param-reassign
    return curr;
  }, retVal);
  return retVal;
}

function blockize(tokens) {
  var RN = formats.RootNode;
  var retVal = new RN();
  var childList = [];
  tokens.forEach(function (token) {
    if (token.type === 'linebreak') {
      var blockArray = formatList.filter(function (f) {
        return f.matches && f.matches(token);
      });
      if (!blockArray || blockArray.length == 0) {
        return;
      }
      var currentBlock = new blockArray[0](token);
      childList.forEach(function (child) {
        return currentBlock.appendChild(build(child));
      });
      retVal.absorb(currentBlock);
      childList = [];
    } else {
      childList.push(token);
    }
  });
  return retVal;
}

var toNodes = function (_nodes) {
  return {
    name: _nodes.name ? _nodes.name : "p",
    attrs: _nodes.attrs,
    children: _nodes.children && _nodes.children.map((v, i) => {
      return toNodes(v)
    }),
    type: _nodes.type == 'text' ? _nodes.type : '',
    text: _nodes.type == 'text' ? _nodes.text : ''
  }
}

var imgList = [];

var getLastRefreshTime = function (_nodes) {
  if (_nodes.name == 'img' && _nodes.attrs) {
    return _nodes.attrs['data-updatetime'] || '0';
  } else if (_nodes.children && _nodes.children.length > 0) {
    for (var i in _nodes.children) {
      return getLastRefreshTime(_nodes.children[i]);
    }
    return null;
  }
}

var isWillRefresh = function (imgurlupdatetime) {
  var now = new Date().getTime();
  if (!imgurlupdatetime || now - imgurlupdatetime >= 1000 * 60 * 60 * 24) {
    return true;
  }
  return false;
}

var getImgNodes = function (_nodes) {
  if (_nodes.name == 'img' && imgList.length < 40) {
    imgList.push(_nodes);
  }
  if (!_nodes.children) {
    return;
  }
  _nodes.children.forEach((v) => {
    getImgNodes(v);
  })
}
var refreshImgNodes = async function (nodes, collec, _id) {
  //imgList.slice(0,imgList.length> 50? 49:imgList.length);
  imgList = [];
  var now = new Date(), nowStr = now.toLocaleDateString() + " " + now.toLocaleTimeString(),
    time = now.getTime();
  try {
    getImgNodes(nodes);
    var arr = imgList.map((v) => v.attrs['data-fileID']);
    const res = await cloud.getTempFileURL({
      fileList: arr
    })
    console.log(res.fileList);
    if (res.fileList && res.fileList.length > 0) {
      res.fileList.forEach((v, i) => {
        /*
        var imgInfo = imgList.find((img) => {
          return img.attrs && img.attrs['data-fileID'] == v.fileID;
        });
        imgInfo.attrs.src = v.tempFileURL;
        imgInfo.attrs['data-updatetime'] = nowStr;       
        */
        if (v.status === 0) {
          imgList[i].attrs.src = v.tempFileURL;
          imgList[i].attrs['data-updatetime'] = nowStr;
        }
      });
      db.collection(collec).doc(_id).update({
        data: {
          imgurlupdatetime: time
        }
      });
    }
  } catch (err) {
    console.log('refreshImgNodes', err);
  }
}
var deleleExpiredFile = () => {

}
var transform = function (delta) {
  var token = tokenize(delta.ops);
  var nodes = blockize(token);
  return toNodes(nodes);
}

/*
{"actionid":"ACT201908071144377454a3d78440bf4","transtype":"action","actionname":"geActionDetail"}
{"actionid":"ACT201908071144377454a3d78440bf4","transtype":"comm","actionname":"detlaformater"}
*/
module.exports = {
  transform: transform,
  refreshImgNodes: refreshImgNodes,
  deleleExpiredFile: deleleExpiredFile,
  isWillRefresh: isWillRefresh
}

/**
 *  "data-couldPath": "undefined/description/d0f9e80b_b04b5eb2ce98_bc2b2606_74d6.jpg",
    "data-digest": "291ef0f2d489976601eafb620b38c7c4",
    "data-fileID": "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/undefined/description/d0f9e80b_b04b5eb2ce98_bc2b2606_74d6.jpg",
    "data-fileID2": "cloud://mingvt-f8c412dd.6d69-mingvt-f8c412dd-1258088923/undefined/description/d0f9e80b_b04b5eb2ce98_bc2b2606_74d6.jpg",
    "data-tempPath": "wxfile://tmp_df124905642b0f0fdadc72865879d4bb31a6ac7762f1e009.png",
    "data-widht": "393",
    "data-height": "294",
    "data-size": "232272",
    "style": "max-width:100%;vertical-align:top",
    "src": "https://6d69-mingvt-f8c412dd-1258088923.tcb.qcloud.la/undefined/description/d0f9e80b_b04b5eb2ce98_bc2b2606_74d6.jpg"
 * 
 */