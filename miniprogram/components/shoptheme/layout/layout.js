const subUnits = require("../cfg/subUnits.js");
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    toggerDisabled: null,
    activeIndex: 0,
    flows: null,
    subUnits: null
  },
  lifetimes: {
    ready: function() {
      var flows = [];
      subUnits.forEach((v, i, arr) => {
        flows.push({
          step: v.name,
          desc: '',
          width: null
        })
        var children = v.children;
        if (children.length % 5 == 0){
          return;
        }
        var willAdd = 5 - children.length % 5;
        //console.log("*******ready*****", children.length, children.length%5, willAdd)
        for (var i = 0; i < willAdd; i++) {
          children.push({
            id: i + "_temp"
          });
        }
      });
      this.setData({
        flows: flows,
        subUnits: subUnits
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    flowTogger: function(e) {
      this.setData({
        activeIndex: e.detail.index
      })
    },
    selectAction: function(e) {
      var index = e.currentTarget.dataset.index,
        cindex = e.currentTarget.dataset.cindex,
        subUnit = this.data.subUnits[index],
        ctrl = subUnit.children[cindex];
      var data = {};
      if (this.preindex !== undefined && this.precindex !== null) {
        data[`subUnits[${this.preindex}].children[${this.precindex}].active`] = null;
      }
      data[`subUnits[${index}].children[${cindex}].active`] = !ctrl.active;
      this.preindex = index;
      this.precindex = cindex;
      this.setData(data);
      //复位，下次加载不会显示选中
      ctrl.active = !ctrl.active;
      //发送到:modaldialog.layoutTogger
      this.triggerEvent("togger", {
        ctrl: {
          "unitid": subUnit.id,
          "compid": ctrl.id
        }
      });
    }
  }
})