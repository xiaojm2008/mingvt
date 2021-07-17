const cdata = "<![CDATA[";
const cdata_c = "]]";

var getXmlField = (body, fieldName) => {
  const cIdx = cdata.length;
  const ccIdx = 2;
  var beg = `<${fieldName}>`;
  var end = `</${fieldName}>`;
  var idx = body.indexOf(beg);
  if (idx < 0) {
    return null;
  }
  var fieldVal = body.substring(idx + beg.length, body.indexOf(end));
  console.log(`${fieldName} = `, fieldVal);
  idx = fieldVal.indexOf(cdata);
  if (idx < 0) {
    return fieldVal;
  }
  var b = fieldVal.indexOf(cdata) + cIdx;
  var e = fieldVal.indexOf(cdata_c);
  return fieldVal.substring(b, e);
}

module.exports = getXmlField;