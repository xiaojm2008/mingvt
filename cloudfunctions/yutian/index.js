/*
须知少日拿云志，曾许人间第一流
*/
var query = require('./lib/query');
var getModelsValue = require('./lib/getModelsValue');
var getGoodsInfo = require('./lib/getGoodsInfo');
var manageRight = require('./lib/manageRight');
var mySeq = require('./lib/mySeq');
var myValidate = require('./lib/myValidate');
var dateFormat = require('./lib/dateFormat');

var yixiuxiu = {};
yixiuxiu.query = query;
yixiuxiu.getModelsValue = getModelsValue;
yixiuxiu.getGoodsInfo = getGoodsInfo;
yixiuxiu.manageRight = manageRight;
yixiuxiu.mySeq = mySeq;
yixiuxiu.myValidate = myValidate;
yixiuxiu.dateFormat = dateFormat;

module.exports = yixiuxiu;
