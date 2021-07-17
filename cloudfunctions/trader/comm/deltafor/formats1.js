var TreeNode = function() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  this.children = [];
  this.attributes = {}, tp = '';
  Object.assign(this.attributes, opts.attributes);
  this.type = this.constructor.name;
  this.name = "";
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
}
BoldNode.matches = function(token) {
  return token.attributes && token.attributes.bg;
}

var Text = function(opts) {
  TreeNode.call(this, opts);
  this.text = opts.contents || '';
  this.name = "text";
  this.type = "text";
  this.attrs = null;
  this.children = null;
  this.absorb = (child) => {
    return child;
  }
}
Text.matches = function(token) {
  return false;
}
var TextNode = function(opts) {
  console.log("1----------", opts);
  BlockNode.call(this, opts);
  if (opts.contents == "2019/8/10") {
    console.log("2----------", opts);
  }
  this.name = `span`;
  this.attrs = {
    style: this.toStyle()
  };
  this.children = [new Text(opts)];

  this.appendChild = (node) => {
    this.children[0].appendChild(node);
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
  'italic2': true
}
TextNode.matches = (token) => {
  return token.type === 'text' && (token.contents === '' || token.contents) && typeof token.contents === 'string' && token.attributes.image === undefined;
  //return token.type === 'text' && (token.contents === '' || token.contents) && typeof token.contents === 'string' && (token.attributes === undefined || token.attributes.image === undefined);
}
TextNode.specialNodes = (attrs) => {
  for (var i in attrs) {
    if (specialNodesMap[i]) {
      return true;
    }
  }
}
var StrongNode = function() {
  BlockNode.call(this, arguments ? arguments[0] : null);
  this.name = `${this.attributes.bold}`;

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


  this.isLeaf = () => {
    return true;
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

  this.absorb = (child) => {
    return child;
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
  this.absorb = (child) => {
    return child;
  }
}
ListItemNode.matches = () => {
  var token = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return false;
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

var UncheckListNode = function(opts) {
  BlockNode.call(this, opts);
  this.name = `ol`;
  this.attrs = {
    style: this.toStyle()
  };
  this.children = [new ListItemNode(opts)];

  this.appendChild = (node) => {
    this.children[0].appendChild(node);
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
}
BackgroundColorNode.matches = (token) => {
  return token.attributes && token.attributes.bg;
}
BackgroundColorNode.priority = 100;

var SuperscriptNode = function() {
  SpanNode.call(this, arguments ? arguments[0] : null);
  this.name = "sup";
  this.attrs = {
    style: this.toStyle()
  };
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