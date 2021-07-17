const helperServ = require("../../../lib/utils/helper.js");
const pageServ = require('../../../lib/utils/pagehelper.js');
class movable {
  constructor(pageContext) {
    this.data = pageContext.data;
    this.page = pageContext;
    this.page.dragStart = this.dragStart.bind(this);
    this.page.dragMove = this.dragMove.bind(this);
    this.page.dragEnd = this.dragEnd.bind(this);
  }

  /** moveable */
  dragStart(e) {
    var startIndex = e.target.dataset.index;
    // 初始化页面数据
    //console.debug(`****touches****`, e.touches[0]);   
    if (e.touches[0].pageY > e.touches[0].clientY) {
      this.data.pageInfo.scrollHeight = `${e.touches[0].pageY + 80}px`;
    } else {
      this.data.pageInfo.scrollHeight = '100%';
    }
    this.page.setData({
      "movableViewInfo.y": e.touches[0].pageY - (this.data.pageInfo.rowHeight / 2),
      "movableViewInfo.data": this.data.enrollinfo[startIndex].name,
      "movableViewInfo.showClass": "inline",
      "pageInfo.scrollHeight": this.data.pageInfo.scrollHeight,
      "pageInfo.startY": e.touches[0].pageY,
      "pageInfo.startIndex": startIndex,
      "pageInfo.scrollY": false,
      "pageInfo.readyPlaceIndex": startIndex,
      "pageInfo.selectedIndex": startIndex
    })
  }
  dragMove(e) {
    var enrollinfo = this.data.enrollinfo
    var pageInfo = this.data.pageInfo
    // 计算拖拽距离
    var movableViewInfo = this.data.movableViewInfo
    var movedDistance = e.touches[0].pageY - pageInfo.startY
    //movableViewInfo.y = pageInfo.startY - (pageInfo.rowHeight / 2) + movedDistance
    movableViewInfo.y = e.touches[0].pageY - (pageInfo.rowHeight / 2);

    // 修改预计放置位置
    var movedIndex = parseInt(movedDistance / pageInfo.rowHeight)

    var readyPlaceIndex = pageInfo.startIndex + movedIndex
    var len = enrollinfo.length;
    /*console.debug(`moveableY:${movableViewInfo.y},startY:${pageInfo.startY},移动的距离:${movedDistance},selectedIndex:${pageInfo.selectedIndex},开始位置${pageInfo.startIndex},预计位置移动的${movedIndex},将要放置的索引${readyPlaceIndex},scrollHeight:${pageInfo.scrollHeight}`,len);*/

    if (readyPlaceIndex < 0) {
      readyPlaceIndex = 0
    } else if (readyPlaceIndex >= len) {
      readyPlaceIndex = len - 1
    }

    if (readyPlaceIndex != pageInfo.selectedIndex) {
      var selectedData = enrollinfo[pageInfo.selectedIndex]
      enrollinfo.splice(pageInfo.selectedIndex, 1)
      enrollinfo.splice(readyPlaceIndex, 0, selectedData)
      pageInfo.selectedIndex = readyPlaceIndex
    }
    // 移动movableView
    pageInfo.readyPlaceIndex = readyPlaceIndex
    // console.debug('移动到了索引', readyPlaceIndex, '选项为', enrollinfo[readyPlaceIndex])
    if (movableViewInfo.y > e.touches[0].clientY) {
      pageInfo.scrollHeight = `${movableViewInfo.y + 80}px`;
    } else {
      pageInfo.scrollHeight = '100%';
    }
    this.page.setData({
      movableViewInfo: movableViewInfo,
      enrollinfo: enrollinfo,
      pageInfo: pageInfo
    })
    // console.debug('************end of dragMove************')
  }

  dragEnd(e) {
    //console.debug(`----------------1 dragEnd pageInfo---------------------`, this.data.pageInfo);
    // 重置页面数据
    var pageInfo = this.data.pageInfo
    pageInfo.readyPlaceIndex = null
    pageInfo.startY = null
    pageInfo.selectedIndex = null
    pageInfo.startIndex = null
    pageInfo.scrollY = true
    //console.debug(`----------------2 dragEnd pageInfo---------------------`, pageInfo);
    //console.debug(`----------------3 dragEnd movableViewInfo---------------------`, this.data.movableViewInfo);
    this.page.setData({
      pageInfo: pageInfo,
      "movableViewInfo.showClass": 'none'
    })
  }
}

module.exports = movable;