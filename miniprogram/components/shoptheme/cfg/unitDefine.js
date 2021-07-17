/**
 * unitid:组件分类ID,譬如base_components（基本组件类）,compid 组件ID： unitid+compid 唯一
 * 参考utils.js中 getUnitDefine方法获取
 */
module.exports = [{
    "id": "base_components",
    "name": "基本组件",
    "children": [{
        "id": "icon",
        "type": "icon",
        "name": "图标",
        "define": [{
          "id": "icon",
          "name": "icon",
          "attrs": {
            "size": "20",
            "type": "success",
          }
        }]
      },
      {
        "id": "text",
        "type": "text",
        "name": "文本",
        "define": [{
          "id": "text",
          "name": "text",
          "attrs": {
            "style": "width:60px;height:25px;line-height:25px;color:black;font-size:15px;display:inline-block;"
          }
        }]
      },
      {
        "id": "image",
        "type": "image",
        "name": "图片",
        "define": [{
          "id": "image",
          "name": "image",
          "attrs": {
            "style": "width:100px;height:100px;",
            "src": ""
          }
        }]
      },
      {
        "id": "view",
        "type": "view",
        "posiofitem": [0],
        "name": "视图容器",
        "define": [{
          "id": "view",
          "name": "view",
          "attrs": {
            "style": "width:100%;min-height:100px;",
            "class": "loc-v"
          }
        }]
      },
      {
        "id": "scroll-view",
        "type": "scroll-view",
        "posiofitem": [0],
        "name": "滚动视图容器",
        "define": [{
          "id": "scroll-view",
          "name": "scroll-view",
          "attrs": {
            "style": "width:100%;height:200px;",
            "class": "loc-v"
          }
        }]
      }
    ]
  },
  {
    "id": "biz_components",
    /** unitid 单元ID */
    "name": "业务组件",
    "children": [{
      "id": "shopswiper",
      /** compid 组件ID： unitid+compid 唯一*/
      "type": "user",
      "posiofitem": [0],
      "name": "轮播组件",
      "define": [{
        "id": "shopswiper",
        "name": "swiper",
        "desc": "swiper",
        "length": "5",
        "attrs": {
          "style": "height:220px",
          "class": "",
        },
        "children": [{
            "id": "shopimg",
            "desc": "图片",
            "name": "image",
            "attrs": {
              "style": "height:220px",
              "mode": "scaleToFill",
              "class": "",
            }
          },
          {
            "id": "shopimg",
            "desc": "图片",
            "name": "image",
            "attrs": {
              "style": "height:220px",
              "mode": "scaleToFill",
              "class": "",
            }
          }
        ]
      }]
    }, {
      "id": "search",
      "type": "system",
      "name": "搜索控件",
      "define": [{
        "name": "search"
      }]
    }, {
      "id": "swiperlist",
      "type": "system",
      "name": "滑动列表",
      "config": "./config/swiperlist.js",
      "attrs": {
        "category": "",
        "datasource": "",
        "action": "",
        "manager": ""
      },
      "define": [{
        "name": "swiperlist",
        "template": "",
        "attrs": {
          "datasource": {
            "vfor": "${datasource}",
            "format": ["code", "name"],
            "value": [{
              "code": "",
              "name": "选项1"
            }, {
              "code": "",
              "name": "选项2"
            }]
          },
          "action": "goods.getGoodsList",
          "manager": "trader"
        }
      }]
    }, {
      "id": "iconcategory",
      "type": "user",
      "posiofitem": [0],
      "name": "图标型分类栏",
      "attrs": {
        "category": ""
      },
      "define": [{
        "id": "iconcategory",
        "desc": "分类栏",
        "name": "view",
        "attrs": {
          "style": "grid-template-columns:repeat(4, 1fr);grid-template-rows:repeat(auto-fill, 100px);",
          "class": "x-grid",
        },
        "children": [{
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "height:60px;width:60px;",
                  "class": "x-svgimg x-radius-btn"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "height:60px;width:60px;",
                  "class": "x-svgimg x-radius-btn"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "height:60px;width:60px;",
                  "class": "x-svgimg x-radius-btn"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "height:60px;width:60px;",
                  "class": "x-svgimg x-radius-btn"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "height:60px;width:60px;",
                  "class": "x-svgimg x-radius-btn"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "height:60px;width:60px;",
                  "class": "x-svgimg x-radius-btn"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "height:60px;width:60px;",
                  "class": "x-svgimg x-radius-btn"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell line-clamp"
                }
              }
            ]
          }
        ]
      }]
    }, {
      "id": "imgcategory",
      "type": "user",
      "posiofitem": [0],
      "name": "图片型分类栏",
      "attrs": {
        "category": "",
      },
      "define": [{
        "id": "imgcategory",
        "desc": "分类栏",
        "name": "view",
        "attrs": {
          "style": "grid-template-columns:repeat(3, 1fr);grid-template-rows:repeat(3, 110px);",
          "class": "x-grid",
        },
        "children": [{
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;grid-row:1/3;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          },
          {
            "desc": "栏目",
            "name": "view",
            "attrs": {
              "style": "height:100%;width:100%;",
              "class": "x-item"
            },
            "children": [{
                "desc": "图片",
                "name": "image",
                "attrs": {
                  "style": "",
                  "class": "x-image"
                }
              },
              {
                "desc": "标题",
                "name": "text",
                "attrs": {
                  "style": "",
                  "class": "x-cell-f line-clamp"
                }
              }
            ]
          }
        ]
      }]
    }]
  },
  {
    "id": "sys_template",
    "name": "系统模板",
    "children": [{
        "id": "simpleswiper",
        "type": "user",
        /**第几个children下面循环，数组长度就是几，下面是第二个children数组下面循环的，第一个元素是VIEW,第二个元素是swiper,所以是swiper下面 */
        "posiofitem": [0, 0],
        "name": "轮播组件",
        "define": [{
          "id": "top_swiper",
          "name": "view",
          "block": true,
          "type": "",
          "text": "",
          "attrs": {
            "style": "height:220px",
            "class": "",
          },
          "children": [{
            "id": "1",
            "name": "swiper",
            "block": true,
            "attrs": {
              "current": 0,
              "indicatordots": true,
              "indicator-active-color": "rgb(200,200,169)",
              "indicator-color": "rgb(223, 157, 157)",
              "style": "height:100%",
            },
            "children": [{
                "name": "image",
                "attrs": {
                  "src": "",
                  "mode": "scaleToFill",
                  "class": "slide-image",
                  "style": "height:100%;width:100%;"
                },
                "children": null
              }

            ]
          }]
        }],
        "enddefine": 1
      },
      {
        "id": "grid",
        "type": "user",
        "posiofitem": [0],
        "name": "网格组件",
        "attrs": {
          "navitype": ""
        },
        "define": [{
          "id": "container",
          "name": "view",
          "type": "",
          "text": "",
          "attrs": {
            "style": "grid-gap:5px;grid-template-columns:repeat(2,50%);grid-template-rows:repeat(auto-fill,280px);justify-content: space-evenly-grid;",
            "class": "fu-grid",
          },
          "children": [{
            "id": "1",
            "name": "view",
            "block": true,
            "attrs": {
              "class": "item",
              "style": "height:100%;width:100%;"
            },
            "children": [{
              "name": "image",
              "attrs": {
                "src": "",
                "mode": "scaleToFill",
                "class": "image"
              }
            }, {
              "name": "view",
              "attrs": {
                "class": "text line-clamp",
                "style": "width:100%;"
              },
              "children": [{
                "name": "view",
                "attrs": {
                  "class": "x-row",
                },
                "children": [{
                  "desc": "主题",
                  "name": "text",
                  "attrs": {
                    "class": "x-subject",
                    "vfor": "${goodsname}"
                  }
                }]
              }, {
                "name": "view",
                "type": "",
                "text": "",
                "attrs": {
                  "class": "x-row",
                },
                "children": [{
                  "desc": "价格",
                  "name": "text",
                  "attrs": {
                    "class": "x-num",
                    "vfor": "${saleprice}"
                  }
                }, {
                  "desc": "月销量",
                  "name": "text",
                  "attrs": {
                    "class": "x-txt",
                    "title": "月销量"
                  }
                }, {
                  "desc": "月销量",
                  "name": "text",
                  "attrs": {
                    "class": "x-num",
                    "vfor": "${monthsales}"
                  }
                }]
              }]
            }]
          }]
        }]
      },
      {
        "id": "colgrid",
        "type": "colgrid",
        "posiofitem": [0, 0],
        "name": "网格组件",
        "define": [{
          "id": "category",
          "name": "view",
          "type": "",
          "text": "",
          "attrs": {
            "class": "ext-horiz-view",
          },
          "children": [{
            "id": "1",
            "name": "view",
            "attrs": {
              "class": "col-grid",
            },
            "children": [{
              "id": "11",
              "name": "view",
              "attrs": {
                "class": "item",
                "style": "height:100%;width:100%;"
              },
              "children": [{
                "id": "111",
                "name": "image",
                "attrs": {
                  "src": "",
                  "style": "height:188px;width:100%;"
                }
              }, {
                "name": "text",
                "attrs": {
                  "class": "text line-clamp",
                  "style": "width:98%;"
                }
              }]
            }]
          }]
        }],
        "enddefine": 1
      },
      {
        "id": "summaryctrl",
        "type": "summaryctrl",
        "posiofitem": null,
        "name": "商品注脚组件",
        "define": [{
          "name": "view",
          "attrs": {
            "class": "x-row",
          },
          "children": [{
            "desc": "主题",
            "name": "text",
            "attrs": {
              "class": "x-subject",
              "vfor": "${goodsname}"
            }
          }]
        }, {
          "name": "view",
          "type": "",
          "text": "",
          "attrs": {
            "class": "x-row",
          },
          "children": [{
            "desc": "价格",
            "name": "text",
            "attrs": {
              "class": "x-num",
              "vfor": "${saleprice}"
            }
          }, {
            "desc": "月销量",
            "name": "text",
            "attrs": {
              "class": "x-txt",
              "title": "月销量"
            }
          }, {
            "desc": "月销量",
            "name": "text",
            "attrs": {
              "class": "x-num",
              "vfor": "${monthsales}"
            }
          }]
        }],
        "enddefine": 1
      }
    ]
  },
  {
    "id": "sys_components",
    "name": "系统组件",
  },
  {
    "id": "suit",
    "name": "套件",
  },
  {
    "id": "other",
    "name": "其他",
  }
]

/*
      "dataformat": {
        "id": "title",
        "type": "",
        "property": {
          "name": {
            "id": "name",
            "name": "标题",
            "ctrl_type": "text",
            "type": "0",
            "required": "O",
            "label": 1,
            "value": "请输入成员",
            "placeholder": '请输入成员'
          },
          "picpath": {
            "id": "picpath",
            "name": "标题背景图片",
            "ctrl_type": "image",
            "required": "O",
            "label": 1,
            "value": {
              "fileID": null,
              "path": "/images/pic.png",
              "height": 50,
              "width": 800
            }
          }
        },
        "children": [
          {
            "id": "child",
            "type": "",
            "property": {
              "name": {
                "id": "name",
                "name": "成员",
                "ctrl_type": "text",
                "type": "0",
                "required": "O",
                "label": 1,
                "value": "请输入成员",
                "placeholder": '请输入成员'
              },
              "picpath": {
                "id": "picpath",
                "name": "成员背景图片",
                "ctrl_type": "image",
                "type": "9",
                "required": "O",
                "label": 1,
                "value": {
                  "fileID": null,
                  "path": "/images/pic.png",
                  "height": 50,
                  "width": 800
                }
              }
            }
          }
        ]
      },
*/