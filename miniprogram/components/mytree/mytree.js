const pageServ = require('../../lib/utils/pagehelper.js');
Component({
  properties: {
    node: {
      type: "Object",
      value: null,
    },
    nodeindex:{   
      type: "String",
      value: '0'
    },
    myStyle: {
      type: "String",
      value: ''
    }
  },
  data: {
    extend: false
    //isBranch: false
  },

  methods: {
    toggle: function(e) {
      if (this.properties.node.children) {
        this.setData({
          extend: !this.data.extend,
        })
      }
    },
    tapItem: function(e) {      
      console.log('点击nodeindex:', e.currentTarget.dataset.nodeindex);
      pageServ.getEleRect("#" + e.currentTarget.id, this, (pos) => {
      this.triggerEvent('togger', {
        fromsrc:'tree',
        pos:pos,
        ckey: e.currentTarget.dataset.ckey,
        nodeindex: e.currentTarget.dataset.nodeindex
      });
      });
    },
    toggerDo: function(e) {
      console.log('*****toggerDo*********', e);
      this.triggerEvent('togger', { 
        fromsrc: 'tree',  
        pos: e.detail.pos,  
        ckey: e.detail.ckey,
        nodeindex:e.detail.nodeindex
      });
    }
  },
  ready: function(e) {
    //nodeinfo: this.properties.node,
    /*this.setData({
      isBranch: Boolean(this.properties.node && this.properties.node.children && this.properties.node.children.length)
    });*/
    console.log("*********ready********", this.data);
  },
  /*
    observers: {
      
      'node': function (node) {
        if (!node) {
          return;
        }
        console.log("*********observers node********", node);
        this.setData({
          nodeinfo:node,
          isBranch: node && node.children && node.children.length,
        });
      }
    },*/
})