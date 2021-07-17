  /**
   * 组件定义描述文件，数据定义参考unitDefine.js
   * utils.js getBaseComponents 获取组件定义
   */
  module.exports= [
    {
      "id": "base_components",
      "name": "基本组件",
      "children": [
        {
          "id": "icon",
          "type": "icon",
          "name": "图标",
          "icon": "icon-success",
          "property": "layout_icon",
          "style": ""
        },
        {
          "id": "text",
          "type": "text",
          "name": "文本",
          "icon": "icon-info",
          "property": "layout_text",
          "style": "css_style"
        },
        {
          "id": "image",
          "type": "image",
          "name": "图片",
          "icon": "icon-pic",
          "property": "layout_image",
          "style": "css_style"
        },
        {
          "id": "view",
          "type": "view",
          "block":true,
          "name": "视图容器",
          "icon": "icon-console",
          "property": "layout_view",
          "style": "css_style"
        },
        {
          "id": "swiper",
          "type": "swiper",
          "block": true,
          "name": "滑块视图容器",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/swiper.svg",
          "property": "layout_swiper",
          "style": "css_style"
        },
        {
          "id": "swiper-item",
          "type": "swiper-item",
          "block": true,
          "name": "滑块子视图",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/swiper.svg",
          "property": "",
          "style": ""
        },
        {
          "id": "scroll-view",
          "type": "scroll-view",
          "block": true,
          "name": "可滚动视图区域",
          "img": "/images/scroll.png",
          "property": "layout_scroll-view",
          "style": "css_style"
        }
      ]
    },
    {
      "id": "biz_components",
      "name": "业务组件",
      "children": [
        {
          "id": "shopswiper",
          "type": "shopswiper",
          "name": "店铺轮播",
          "define": require("./shopswiper.js"),
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/swiper.svg",
          "icon": ""
        },
        {
          "id": "search",
          "type": "search",
          "name": "搜索栏",
          "img": "",
          "icon": "icon-search"
        },
        {
          "id": "swiperlist",
          "type": "swiperlist",
          "name": "列表控件",
          "img": "",
          "icon": "icon-search"
        },
        {
          "id": "iconcategory",
          "type": "iconcategory",
          "name": "图标型分类导航栏",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/swiper.svg",
          "icon": "",
          "value": null
        },
        {
          "id": "imgcategory",
          "type": "imgcategory",
          "name": "图片型分类导航栏",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/swiper.svg",
          "icon": "",
          "value": null
        },
        {
          "id": "tabview",
          "type": "tabview",
          "name": "TAB页分类导航栏",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/listgrid.svg",
          "dataformat": null
        },
        {
          "id": "areacategory",
          "type": "areacategory",
          "name": "分类区",
          "define": require("./zcomponent.js"),
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/swiper.svg",
          "icon": "",
          "value": null
        }
      ]
    },
    {
      "id": "sys_template",
      "name": "系统模板",
      "children": [
        {
          "id": "simpleswiper",
          "type": "simpleswiper",
          "name": "图片轮播",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/swiper.svg",
          "icon": "",
          "dataformat": null
        },
        {
          "id": "grid",
          "type": "grid",
          "name": "网格",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/listgrid.svg",
          "dataformat": null
        },
        {
          "id": "waterfall",
          "type": "waterfall",
          "name": "瀑布流",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/listgrid.svg",
          "dataformat": null
        },
        {
          "id": "summaryctrl",
          "type": "summaryctrl",
          "name": "商品注脚组件",
          "img": "cloud://xiaovt-818we.7869-xiaovt-818we-1259627454/assets/imgs/layout/listgrid.svg"
        }
      ]
    },
    {
      "id": "suit",
      "name": "套件",
      "children": [      
      ]
    },
    {
      "id": "other",
      "name": "其他",
      "children":[]
    }
  ];

