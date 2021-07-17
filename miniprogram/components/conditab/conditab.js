// components/conditab/conditab.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabs: {
      type: Array,
      value: []
    },
    curtab: {
      type: Number,
      value: 0
    },
    winHeight: {
      type: Number,
      value: 0
    },
    myStyle: {
      type: String,
      value: ''
    },
    size: {
      type: Number,
      value: 80
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    category: [],
    selected: 0
  },
  lifetimes: {
    ready: function() {
      var tabs = this.properties.tabs;
      if (tabs && tabs.length > 0) {
        var data = {};
        tabs.forEach((t, tidx) => {
          //t=>tab
          for (var i = 0; i < t.items.length; i++) {
            var l1 = t.items[i];
            if (l1.active) {
              if (l1.items && l1.items.length > 0) {
                data[`tabs[${tidx}].l2sel`] = i;
                var l2sub = l1.items && l1.items.findIndex(l2 => l2.active);
                data[`tabs[${tidx}].l2subsel`] = l2sub;
              } 
              data[`tabs[${tidx}].catesel`] = i;              
              return;
            }
          }
        });
        console.log("******ready******",data)
        if(Object.keys(data)>0){
          this.setData(data);
        }
      }
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    toggle: function(e) {
      const idx = e.currentTarget.dataset.index;
      this.data.category = this.data.tabs[idx].items;
      this.setData({
        winHeight: 0,
        anima: false,
        curtab: idx,
        category: this.data.category
      })
      this.setData({
        anima: true,
        winHeight: this.data.category.length < 13 ? this.data.category.length * 40 : 12 * 40
      })
    },
    hide: function(e) {
      this.setData({
        winHeight: 0
      });
    },
    naviTap: function(e) {
      const idx = e.currentTarget.dataset.index,
        item = this.data.category[idx],
        tab = this.data.tabs[this.data.curtab];
      var data = {};
      if (tab.catesel || tab.catesel === 0) {
        data[`category[${tab.catesel}].active`] = false;
      }
      data[`category[${idx}].active`] = true;
      data[`tabs[${this.data.curtab}].catesel`] = idx;
      if (!item.items || item.items.length === 0) {
        this.triggerEvent("togger", {
          item: item
        });
        data[`tabs[${this.data.curtab}].name`] = (item.name === '所有' ? tab.title : item.name);
        data["winHeight"] = 0;
      } else {
        //二级选择
        data["selected"] = idx;
      }
      this.setData(data);
    },
    contentTap: function(e) {
      const idx = this.data.selected,
        cidx = e.currentTarget.dataset.index,
        tab = this.data.tabs[this.data.curtab],
        items = this.data.category[idx],
        item = items.items[cidx];
      var data = {};
      data[`tabs[${this.data.curtab}].name`] = (item.name === '所有' ? items.name : item.name);
      //二级选择（level2）
      data[`tabs[${this.data.curtab}].l2sel`] = idx;
      data[`tabs[${this.data.curtab}].l2subsel`] = cidx;
      if (this.data.tabs[this.data.curtab].multi) {
        this.setData(data);
        this.triggerEvent("togger", {
          item: items.find(v => v.active)
        });
      } else {
        data["winHeight"] = 0;
        if ((tab.l2sel || tab.l2sel === 0) && (tab.l2subsel || tab.l2subsel === 0)) {
          data[`category[${tab.l2sel}].items[${tab.l2subsel}].active`] = false;
        }
        data[`category[${idx}].items[${cidx}].active`] = true;
        this.setData(data);
        this.triggerEvent("togger", {
          item: item
        });
      }
    }
  }
})