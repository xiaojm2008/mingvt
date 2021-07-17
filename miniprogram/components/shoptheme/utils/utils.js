
const subUnits = require("../cfg/subUnits.js");
const unitDefine = require("../cfg/unitDefine.js");
const xcomponent = require("../cfg/xcomponent.js");
/**根据unitid,compid创建控件对象（unitDefine.js）
 * compinfo:{
 *  unitid:组件单元(分类)ID
 *  compid:控件ID
 * } 
 */
var getComponents = (compinfo) => {
  const subUnit = subUnits.find(v => v.id == compinfo.unitid);
  const comp = subUnit.children.find(v => v.id == compinfo.compid);
  return comp;
}
/**获取基本控件信息（subUnits.js）
 * 根据unitDefine.js 组件的define数组成员的name和 subUnits.js 中的type关联
 * node.name(包括：text,image,icon,view,scroll-view)
 */
var getBaseComponents = (node) => {
  const subUnit = subUnits.find(v => v.id == 'base_components');
  const children = subUnit.children.find(v => v.type == node.name);
  return children;
}

/**根据unitid,compid创建控件对象（unitDefine.js）
 * compinfo:{
 *  unitid:组件单元(分类)ID
 *  compid:组件(控件)ID
 * } 
 */
var createComponent = (compinfo, pgContext, options) => {
  console.log("createComponent*******", compinfo);
  var ctrl = getComponents(compinfo);
  if (!ctrl) {
    return null;
  }
  if (ctrl.define) {
    return new ctrl.define(pgContext, options);
  }
  var unit = unitDefine.find(v => v.id == compinfo.unitid);
  if (!unit || !compinfo.compid) {
    return null;
  }
  console.log("getUnitDefine2*******", unit)
  var comp = unit.children.find(v => v.id == compinfo.compid);
  if (comp && comp.define) {
    /**存储 unitid:组件分类ID，备用（譬如参考theme1.js 中 节点事件 tapTreeNode 用）  */
    comp.unitid = unit.id;
    return new xcomponent(pgContext, Object.assign({ meta: comp }, options));
  }
  return null;
}
var createContainer = (nodename, pgContext, options)=>{
  return createComponent({ unitid: 'base_components', compid: nodename||'view'},pgContext,options);
}
module.exports = {
  createContainer: createContainer,
  createComponent: createComponent,
  getComponents: getComponents,
  getBaseComponents: getBaseComponents
};