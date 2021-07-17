
var eq=(l,r)=>{
  return (l * 100).toFixed() === (r * 100).toFixed()
}
var neq = (l, r) => {
  return (l * 100).toFixed() != (r * 100).toFixed()
}
var lt = (l, r) => {
  return parseInt((l * 100).toFixed()) < parseInt((r * 100).toFixed())
}
var gt = (l, r) => {
  return parseInt((l * 100).toFixed()) > parseInt((r * 100).toFixed())
}
var lte = (l, r) => {
  return parseInt((l * 100).toFixed()) <= parseInt((r * 100).toFixed())
}
var gte = (l, r) => {
  return parseInt((l * 100).toFixed()) >= parseInt((r * 100).toFixed())
}
var add = (l,r)=>{
  return parseInt((l * 100).toFixed()) + parseInt((r * 100).toFixed())
}
var sub = (l, r) => {
  return parseInt((l * 100).toFixed()) - parseInt((r * 100).toFixed())
}
var mul = (l, r) => {
  return parseInt((l * 100).toFixed()) * parseInt((r * 100).toFixed())
}
var div = (l, r) => {
  return parseInt((parseInt((l * 100).toFixed()) / parseInt((r * 100).toFixed())).toFixed())
}
var toFen = (l)=>{
  return parseInt((l * 100).toFixed());
}
module.exports = {
  eq: eq,
  neq: neq,
  lt:lt,
  gt:gt,
  lte: lte,
  gte: gte,
  add:add,
  sub:sub,
  mul:mul,
  div:div,
  toFen: toFen
};