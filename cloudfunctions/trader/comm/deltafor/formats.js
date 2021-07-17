/*!
 * formats.js
 * xiaojinming - v1.0.0 (2020-03-21)
 * Released under MIT license
 */
var _get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);
  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);
    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var TreeNode = function() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  this.children = [];
  this.attributes = {}, tp = '';
  Object.assign(this.attributes, opts.attributes);
  /*
  for (var k in opts.attributes) {
    tp= typeof opts.attributes[k];
    this.attributes[k] = tp != 'object' && tp!='string' ? opts.attributes[k].toString() : opts.attributes[k];
  }*/

  this.type = this.constructor.name;
  this.name = "";
  this.dfsTraverse = () => {
    return this.children.reduce(function(prev, curr) {
      return prev.concat(curr);
    }, [this]);
  }

  this.openTag = () => {
    return '';
  }

  this.closeTag = () => {
    return '';
  }

  this.promiseContents = () => {
    return Promise.resolve(this.contents || '');
  }

  this.toHTMLAsync = () => {
    var _this = this;

    var indentLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    if (this.isLeaf) {
      return this.promiseContents().then(function(contents) {
        return '' + _this.openTag() + contents + _this.closeTag(); // eslint-disable-line max-len
      });
    } else {
      return Promise.all(this.children.map(function(c) {
        return c.toHTMLAsync(0);
      })).then(function(childHTML) {
        return '' + _this.openTag() + childHTML.join('') + _this.closeTag(); // eslint-disable-line max-len
      });
    }
  }

  this.plainTextAsync = () => {
    if (this.isLeaf()) {
      if (this.promisePlainContents) {
        return this.promisePlainContents();
      } else {
        return Promise.resolve(this.plainText());
      }
    } else {
      return Promise.all(this.children.map(function(c) {
        return c.plainTextAsync();
      })).then(function(c) {
        return c.join('');
      });
    }
  }

  this.plainText = () => {
    return this.children.map(function(c) {
      return c.plainText();
    }).join('');
  }

  this.toHTML = () => {
    var indentLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    if (this.isLeaf()) {
      return '' + this.openTag() + this.contents + this.closeTag(); // eslint-disable-line max-len
    } else {
      return '' + this.openTag() + this.children.map(function(c) {
        return c.toHTML(0);
      }).join('') + this.closeTag(); // eslint-disable-line max-len
    }
  }

  this.isLeaf = () => {
    return false;
  }

  this.appendChild = (child) => {
    this.children.push(child);
  }

  this.absorb = (child) => {
    this.children.push(child);
    return null;
  }

  this.toJSON = () => {
    return {
      type: this.type,
      level: this.level,
      children: this.children,
      attributes: this.attributes,
      contents: this.contents
    };
  }

  this.getPriority = () => {
    return this.constructor['priority'];
  }
  this.toStyle = () => {
    var style = '';
    console.log(`toStyle ${this.constructor.name}`, this.attributes);
    for (var k in this.attributes) {
      if (k != 'class') {
        style = style + getStyle(k, this.attributes[k]);
      }
    }
    return style;
  };
}

var styleMap = {
  "italic": "font-style:italic;",
  "align": "text-align:{align};",
  "bold": "font-weight:bold;",  
  "underline": "text-decoration:underline",
  "indent": "text-indent:{indent}cm",
  "center": "text-align:center;",
  "color": "color:{color};",
  "bg": "background-color:{bg};"
}
var getStyle = (k, v) => {
  var style = styleMap[k];
  if (!style) {
    return '';
  } else {
    const regex = new RegExp('\\{(.+?)\\}', 'gi');
    if (regex.test(style)) {
      style = style.replace(regex, v);
    }
    console.log('regex return ', style);
    return style;
  }
}
TreeNode.matches = (token) => {
  return false;
}
var BlockNode = function() {
  TreeNode.call(this, arguments ? arguments[0] : null);
  this.level = 'block';

  function plainTextAsync() {
    return Promise.all(this.children.map(function(child) {
      return child.plainTextAsync();
    })).then(function(c) {
      return c.join('') + '\n';
    });
  }

  function plainText() {
    return _get(BlockNode.prototype.__proto__ || Object.getPrototypeOf(BlockNode.prototype), 'plainText', this).call(this) + '\n';
  }

  function appendChild(child) {
    if (this.children.length === 0) {
      this.children.push(child);
    } else {
      var remains = this.children[this.children.length - 1].absorb(child);
      if (remains !== null) {
        this.children.push(remains);
      }
    }
  }
}
BlockNode.matches = () => {
  return false;
}
var SpanNode = function() {
  TreeNode.call(this, arguments ? arguments[0] : null);
  this.level = 'span';
  //this.attrs = {style:this.toStyle()};

  this.absorb = function absorb(child) {
    if (child.type === this.type) {
      this.children = this.children.concat(child.children);
      return null;
    } else {
      return child;
    }
  };
}
SpanNode.matches = (token) => {
  //return token.type && token.type=='span';
  return false;
}

var BoldNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "span";
  this.attrs = {
    style: this.toStyle() // `background-color:${this.attributes.bg }`
  }
  this.openTag = function openTag() {
    return '<span style="background-color:' + this.attributes.bg + ';">';
  }
  this.closeTag = function closeTag() {
    return '</span>';
  }
}
BoldNode.matches = function(token) {
  return token.attributes && token.attributes.bg;
}

var Text = function (opts) {
  TreeNode.call(this, opts);
  this.text = opts.contents || '';
  this.name = "text";
  this.type = "text";
  this.attrs = null;
  this.children = null;
  this.openTag = function openTag() {
    return '';
  }
  this.closeTag = function closeTag() {
    return '';
  }  
  this.absorb = (child) => {
    return child;
  }
}
Text.matches = function (token) {
  return false;
}
var TextNode = function (opts) {
  console.log("1----------", opts);
  BlockNode.call(this, opts);
  if (opts.contents == "2019/8/10"){
    console.log("2----------",opts);
  }
  this.name = `span`;
  this.attrs = {
    style: this.toStyle()
  };
  this.children = [new Text(opts)];

  this.appendChild = (node) => {
    this.children[0].appendChild(node);
  }

  this.openTag = () => {
    return '<span>';
  }

  this.closeTag = () => {
    return '</span>';
  }

  this.absorb = (child) => {
    if (child.type === this.type) {
      this.children = this.children.concat(child.children);
      return null;
    } else {
      return child;
    }
  }
}
/*
var TextNode = function() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  SpanNode.call(this, opts);
  this.unescapedContents = opts.contents || '';
  this.name = "text";
  this.type = "text";
  this.text = this.unescapedContents;
  this.children=[];
  this.attrs = {
    style: this.toStyle()
  };

  this.plainText = () => {
    return this.unescapedContents;
  }

  this.openTag = () => {
    return '<span>';
  }

  this.closeTag = () => {
    return '</span>';
  }

  this.appendChild = () => {
    throw new Error('TextNode cannot have chldren');
  }

  this.isLeaf = () => {
    return true;

  }

  this.absorb = (child) => {
    if (child.type === this.type) {
      this.unescapedContents = this.unescapedContents.concat(child.unescapedContents);
      return null;
    } else {
      return child;
    }
  }

  this.escape = (contents) => {
    return contents.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  this.getContents = () => {
    if (this.unescapedContents.trim() === '') {
      return '&nbsp;';
    } else {
      return this.escape(this.unescapedContents);
    }
  }
}
*/
const specialNodesMap = {
  'italic2':true
}
TextNode.matches = (token) => {
  return token.type === 'text' && (token.contents === '' || token.contents) && typeof token.contents === 'string' && token.attributes.image === undefined;
  //return token.type === 'text' && (token.contents === '' || token.contents) && typeof token.contents === 'string' && (token.attributes === undefined || token.attributes.image === undefined);
}
TextNode.specialNodes=(attrs)=>{
  for(var i in attrs){
    if(specialNodesMap[i]){
      return true;
    }
  }
}
var StrongNode = function () {
  BlockNode.call(this, arguments ? arguments[0] : null);
  this.name = `${this.attributes.bold}`;

  this.openTag = () => {
    return '<strong>';
  }
  this.closeTag = () => {
    return '</strong>';
  }
  this.absorb = (child) => {
    return child;
  }
}
StrongNode.matches = (token) => {
  return token.attributes.bold;
}

var parseCustomData = function(attributes) {
  var attrs = {};
  datacustom = attributes && attributes['data-custom'] ? decodeURIComponent(attributes['data-custom']) : null;
  if (datacustom) {
    var farr = datacustom.split("&");
    var params = {};
    farr.forEach((item, idx, arr2) => {
      var i = item.indexOf("=");
      var key = item.substr(0, i);
      var val = item.substr(i + 1);
      params['data-' + key] = val;
    });
    Object.assign(attrs, params);
  }
  return attrs;
}
var ImageNode = function() {
  //arguments ? arguments[0] : null
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  SpanNode.call(this, opts);
  this.name = "img";
  if (opts.contents && opts.contents.image) {
    this.imageUrl = opts.contents.image;
  } else {
    this.imageUrl = opts.attributes.image;
  }
  this.attrs = parseCustomData(opts.attributes || {})
  this.attrs.style = "max-width:100%;vertical-align:top";
  this.attrs.src = this.imageUrl;

  this.contents = '<img src="' + this.imageUrl + '">';
  this.plainText = () => {
    return 'IMAGE: ' + this.imageUrl;
  }


  this.isLeaf = () => {
    return true;
  }

  this.openTag = () => {
    return '';
  }

  this.closeTag = () => {
    return '';
  }
}
ImageNode.matches = (token) => {
  return token.type === 'image';
}
var ParagraphNode = function() {
  BlockNode.call(this, arguments ? arguments[0] : null);
  this.name = "p";
  this.attrs = {
    style: this.toStyle()
  };

  this.openTag = () => {
    return '<p>';
  }

  this.closeTag = () => {
    return '</p>';
  }

  this.absorb = (child) => {
    return child;
  }

  this.toHTMLAsync = () => {
    var _this2 = this;

    var indentLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    if (this.children.length === 0) {
      this.children.push(new _text.TextNode({
        type: 'text',
        attributes: {},
        contents: ''
      }));
    }
    return Promise.all(this.children.map(function(c) {
      return c.toHTMLAsync(0);
    })).then(function(childHTML) {
      return '' + _this2.openTag() + childHTML.join('') + _this2.closeTag(); // eslint-disable-line max-len
    });
  }

  this.toHTML = () => {
    var indentLevel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    if (this.children.length === 0) {
      this.children.push(new _text.TextNode({
        type: 'text',
        attributes: {},
        contents: ''
      }));
    }
    // if (this.children.length === 0) {
    // return `${new Array(0).join(' ')}${this.openTag()}&nbsp;${this.closeTag()}`;
    // } else {
    return _get(ParagraphNode.prototype.__proto__ || Object.getPrototypeOf(ParagraphNode.prototype), 'toHTML', this).call(this, indentLevel);
    // }
  }
}
ParagraphNode.matches = (token) => {
  return token.type === 'linebreak' && (!!token.attributes && token.attributes.list === undefined && token.attributes.header === undefined);
}
ParagraphNode.priority = 101;

var RootNode = function() {
  //arguments ? arguments[0] : null
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  TreeNode.call(this, opts);
  this.absorb = (child) => {
    var remains = child;
    if (this.children.length > 0) {
      remains = this.children[this.children.length - 1].absorb(child);
    }
    if (remains !== null) {
      this.children.push(remains);
    }
    return null;
  }

  this.toHTML = () => {
    return this.children.map(function(c) {
      return c.toHTML(0);
    }).join(''); // eslint-disable-line max-len
  }

  this.toHTMLAsync = () => {
    return Promise.all(this.children.map(function(c) {
      return c.toHTMLAsync(0);
    })).then(function(childHTML) {
      return childHTML.join(''); // eslint-disable-line max-len
    });
  }
}
RootNode.matches = () => {
  return false;
}

var ItalicNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = 'p';
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<p>';
  }
  this.closeTag = () => {
    return '</p>';
  }
}
ItalicNode.matches = (token) => {
  return token.attributes && token.attributes.italic;
}
var EmNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = 'em';
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<em>';
  }
  this.closeTag = () => {
    return '</em>';
  }
}
EmNode.matches = (token) => {
  return token.attributes && token.attributes.em;
}

var LinkNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = 'a';
  this.attrs = {
    style: this.toStyle(),
    target: '_blank',
    href: this.attributes.link
  };

  this.openTag = () => {
    return '<a target="_blank" href="' + this.attributes.link + '">';
  }
  this.closeTag = () => {
    return '</a>';
  }
}
LinkNode.matches = (token) => {
  return token.attributes && token.attributes.link;
}

var ListItemNode = function() {
  TreeNode.call(this, arguments ? arguments[0] : null);
  this.name = `li`;
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<li>';
  }
  this.closeTag = () => {
    return '</li>';
  }
  this.absorb = (child) => {
    return child;
  }
  this.plainTextAsync = () => {
    return _get(ListItemNode.prototype.__proto__ || Object.getPrototypeOf(ListItemNode.prototype), 'plainTextAsync', this).call(this).then(function(t) {
      return '* ' + t + '\n';
    });
  }
  this.plainText = () => {
    return '* ' + _get(ListItemNode.prototype.__proto__ || Object.getPrototypeOf(ListItemNode.prototype), 'plainText', this).call(this) + '\n';
  }
}
ListItemNode.matches = () => {
  var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return false;
  // return (token.attributes && token.attributes.list);
}

var OrderedListNode = function(opts) {
  BlockNode.call(this, opts);
  this.name = `ol`;
  this.attrs = {
    style: this.toStyle()
  };
  this.children = [new ListItemNode(opts)];

  this.appendChild = (node) => {
    this.children[0].appendChild(node);
  }

  this.openTag = () => {
    return '<ol>';
  }

  this.closeTag = () => {
    return '</ol>';
  }

  this.absorb = (child) => {
    if (child.type === this.type) {
      this.children = this.children.concat(child.children);
      return null;
    } else {
      return child;
    }
  }
}
OrderedListNode.matches = (token) => {
  return token.type === 'linebreak' && token.attributes && (token.attributes.list === 'ordered' || token.attributes.ordered === true);
}
/*
ListItemNode.matches = () => {
  var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return false;
  // return (token.attributes && token.attributes.list);
}
*/
var UncheckListNode = function (opts) {
  BlockNode.call(this, opts);
  this.name = `ol`;
  this.attrs = {
    style: this.toStyle()
  };
  this.children = [new ListItemNode(opts)];

  this.appendChild = (node) => {
    this.children[0].appendChild(node);
  }

  this.openTag = () => {
    return '<ol>';
  }

  this.closeTag = () => {
    return '</ol>';
  }

  this.absorb = (child) => {
    if (child.type === this.type) {
      this.children = this.children.concat(child.children);
      return null;
    } else {
      return child;
    }
  }
}
UncheckListNode.matches = (token) => {
  return token.type === 'linebreak' && token.attributes && (token.attributes.list === 'unchecked' || token.attributes.list === 'checked');
}
var UnorderedListNode = function(opts) {
  BlockNode.call(this, opts);
  this.children = [new ListItemNode(opts)];
  this.name = `ul`;
  this.attrs = {
    style: this.toStyle()
  };
  this.appendChild = (node) => {
    this.children[0].appendChild(node);
  }
  this.openTag = () => {
    return '<ul>';
  }
  this.closeTag = () => {
    return '</ul>';
  }
  this.absorb = (child) => {
    if (child.type === this.type) {
      this.children = this.children.concat(child.children);
      return null;
    } else {
      return child;
    }
  }
}
UnorderedListNode.matches = (token) => {
  return token.type === 'linebreak' && token.attributes && (token.attributes.list === 'bullet' || token.attributes.bullet === true);
}

var HeaderNode = function() {
  BlockNode.call(this, arguments ? arguments[0] : null);
  this.name = `h${this.attributes.header}`;
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<h' + this.attributes.header + '>';
  }
  this.closeTag = () => {
    return '</h' + this.attributes.header + '>';
  }
  this.absorb = (child) => {
    return child;
  }
}
HeaderNode.matches = (token) => {
  return token.type === 'linebreak' && token.attributes && token.attributes.header;
}

var UnderlineNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "u";
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<u>';
  }
  this.closeTag = () => {
    return '</u>';
  }
}

UnderlineNode.matches = (token) => {
  return token.attributes && token.attributes.underline;
}
UnderlineNode.priority = 89;

var StrikethroughNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "s";
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<s>';
  }
  this.closeTag = () => {
    return '</s>';
  }
}
StrikethroughNode.matches = (token) => {
  return token.attributes && token.attributes.strike;
}

var ColorNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "span";
  this.attrs = {
    style: `${this.attributes.color}`
  };
  this.openTag = () => {
    return '<span style="color:' + this.attributes.color + ';">';
  }
  this.closeTag = () => {
    return '</span>';
  }
}
ColorNode.matches = (token) => {
  return token.attributes && token.attributes.color;
}
ColorNode.priority = 99;

var BackgroundColorNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "span";
  this.attrs = {
    style: `${this.attributes.bg}`
  };
  this.openTag = () => {
    return '<span style="background-color:' + this.attributes.bg + ';">';
  }
  this.closeTag = () => {
    return '</span>';
  }
}
BackgroundColorNode.matches = (token) => {
  return token.attributes && token.attributes.bg;
}
BackgroundColorNode.priority=100;

var SuperscriptNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "sup";
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<sup>';
  }
  this.closeTag = () => {
    return '</sup>';
  }
}
SuperscriptNode.matches = (token) => {
  return token.attributes && token.attributes.super;
}

var SubscriptNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "sub";
  this.attrs = {
    style: this.toStyle()
  };
  this.openTag = () => {
    return '<sub>';
  }
  this.closeTag = () => {
    return '</sub>';
  }
}
SubscriptNode.matches = (token) => {
  return token.attributes && token.attributes.sub;
}

var formats = {
  bold: BoldNode,
  //italic: ItalicNode,
  link: LinkNode,
  listItem: ListItemNode,
  ordered: OrderedListNode,
  unchecked: UncheckListNode,
  paragraph: ParagraphNode,
  text: TextNode,
  TreeNode: TreeNode,
  //StrongNode: StrongNode,
  RootNode: RootNode,
  bullet: UnorderedListNode,
  header: HeaderNode,
  underline: UnderlineNode,
  strikethrough: StrikethroughNode,
  color: ColorNode,
  bgcolor: BackgroundColorNode,
  subscript: SuperscriptNode,
  superscript: SubscriptNode,
  SpanNode: SpanNode,
  BlockNode: BlockNode,
  image: ImageNode,
  em: EmNode
};

module.exports = formats;