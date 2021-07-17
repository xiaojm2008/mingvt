const app = getApp();
//{"id":"35","provincecode":"150000","city":"阿拉善盟","code":"152900","initial":"A","short":"Alashanmeng"}
//{"id":"35","pcode":"150000","name":"阿拉善盟","code":"152900","initial":"A","short":"Alashanmeng"}

module.exports = {
  expcode: {
    title: "快递公司信息",
    condi: null,
    action: "logistics.getExpInfo",
    manager:"manager",
    defParams: {},
    transfer: [
      ["title", "快递公司信息"],
      ["id", "$_id"],
      ["code", "$code"],
      ["name", "$name"],
      ["initial", "$code[0]"],
      ["short", "$code"]
    ]
  },
  citycode: {
    title: "城市信息",
    condi: null,
    action: "sys.city",
    manager: "comm",
    defParams: {},
    transfer: [
      ["title", "城市信息"],
      ["id", "$_id"],
      ["pcode", "$prov"],
      ["code", "$city"],
      ["name", "$name"],
      ["initial", "$py[0]"],
      ["short", "$py"],
      ["coordi", "$coordi"]
    ]
  },
  provcode: {
    title: "省份信息",
    condi: null,
    action: "sys.prov",
    manager: "comm",
    defParams: {},
    transfer: [
      ["title", "省份信息"],
      ["id", "$_id"],
      ["code", "$prov"],
      ["name", "$name"],
      ["initial", "$py[0]"],
      ["short", "$py"],
      ["coordi", "$coordi"]
    ]
  },
  stateinfo: {
    title: "国家信息", 
    condi: null,
    action: "comm.getState",
    manager: "manager",
    defParams: {},
    transfer: [
      ["title", "国家信息"],
      ["id", "$_id"],
      ["code", "$code"],
      ["name", "$name"],
      ["initial", "$code[0]"],
      ["short", "$code"]
    ]
  }
}