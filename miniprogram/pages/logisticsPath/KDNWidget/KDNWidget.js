(function () {
  var kdnOptions = {
    baseUrl: "http://www.kdniao.com/JSInvoke/"
  };
  var utilityService = new KDNUtilitiesService();

  function KDNSearchResultService(options) {
    this.param = options || {};
    this.validateData = function () {
      if (!utilityService.hasProperty(this.param, "expCode") || !utilityService.hasProperty(this.param, "expNo")) {
        return false
      }
      this.param.currentUrl = "expCode=" + this.param.expCode + "&expNo=" + this.param.expNo;
      if (!utilityService.hasProperty(this.param, "sortType")) {
        this.param.sortType = "DESC"
      }
      this.param.currentUrl += "&sortType=" + this.param.sortType;
      if (!utilityService.hasProperty(this.param, "color")) {
        this.param.color = "rgb(46,114,251)"
      }
      this.param.currentUrl += "&color=" + this.param.color;
      if (this.param.color.substring(0, 3) != "rgb" || this.param.color.substring(0, 3) != "RGB") {
        this.param.color = "rgb(46,114,251)"
      }
      /*
      if (!utilityService.hasProperty(this.param, "backUrl")) {
        this.param.backUrl = window.location.href
      }
      this.param.currentUrl += "&backUrl=" + this.param.backUrl;
      */
      return true
    };
    this.excuteProcess = function () {
      return kdnOptions.baseUrl + "MSearchResult.aspx?" + this.param.currentUrl
    }
  }
  function KDNPCSearchResultService(options) {
    this.param = options || {};
    this.validateData = function () {
      if (!utilityService.hasProperty(this.param, "expCode") || !utilityService.hasProperty(this.param, "expNo") || !utilityService.hasProperty(this.param, "container")) {
        return false
      }
      return true
    };
    this.excuteProcess = function () {
      var _0 = document.getElementById((this.param.container || ""));
      var _2 = "normal";
      if (this.param.showType == "pop") _2 = "pop";
      var iframeSrc = kdnOptions.baseUrl + "SearchResult.aspx?expCode=" + this.param.expCode + "&expNo=" + this.param.expNo;
      var iframeElement = document.createElement("iframe");
      iframeElement.setAttribute("width", "900");
      iframeElement.setAttribute("height", "550");
      iframeElement.setAttribute("border", "0");
      iframeElement.setAttribute("frameborder", "0");
      iframeElement.setAttribute("scrolling", "no");
      iframeElement.setAttribute("src", iframeSrc);
      if (_2 == "normal") {
        _0.innerHTML = "";
        _0.style.display = "block";
        _0.appendChild(iframeElement)
      } else {
        _0.innerHTML = "";
        _0.style.display = "block";
        _0.setAttribute("class", "kdnlogin-box");
        var myhtml = "<div class='kdnlogin-title'>即时查询结果<div class='kdnlogin-close'>关闭</div></div><div class='kdnlogin-content'><iframe width='900' height='550' frameborder='0' scrolling='auto' src='" + iframeSrc + "'> </iframe></div>";
        _0.innerHTML = myhtml;
        utilityService.validateReg.addEvent(document.getElementsByClassName("kdnlogin-close")[0], "click", function () {
          _0.style.removeProperty("display");
          _0.style.display = "none";
          _0.innerHTML = ""
        }, this)
      }
    }
  }
  function KDNSearchTrackService(options) {
    this.param = options || {};
    this.validateData = function () {
      if (!utilityService.hasProperty(this.param, "sortType")) this.param.sortType = "DESC";
      if (!utilityService.hasProperty(this.param, "color")) this.param.color = "rgb(46,114,251)";
      if (!utilityService.hasProperty(this.param, "backUrl")) {
        this.param.backUrl = window.location.href
      }
      return true
    };
    this.excuteProcess = function () {
      window.location.href = kdnOptions.baseUrl + "MSearchTrack.aspx?backUrl=" + this.param.backUrl + "&sortType=" + this.param.sortType + "&color=" + this.param.color
    }
  }
  function KDNPCSearchTrackService(options) {
    this.param = options || {};
    this.validateData = function () {
      if (!utilityService.hasProperty(this.param, "container")) {
        return false
      }
      return true
    };
    this.excuteProcess = function () {
      var targetContainer = document.getElementById(this.param.container);
      if (!targetContainer) {
        console.error("请传入一个容器div");
        return false
      }
      targetContainer.style.width = "1015px";
      targetContainer.style.height = "810px";
      targetContainer.style.margin = "0px auto";
      var iframeHtml = "<iframe frameborder='0' width='1012' height='780' scrolling='auto' src='" + kdnOptions.baseUrl + "SearchTrack.aspx'></iframe>";
      targetContainer.innerHTML = iframeHtml
    }
  }
  function KDNOnlineOrderService(options) {
    this.param = options || {};
    this.validateData = function () {
      if (!utilityService.hasProperty(this.param, "sortType")) this.param.sortType = "DESC";
      if (!utilityService.hasProperty(this.param, "color")) this.param.color = "rgb(46,114,251)";
      if (!utilityService.hasProperty(this.param, "backUrl")) {
        this.param.backUrl = window.location.href
      }
      return true
    };
    this.excuteProcess = function () {
      window.location.href = kdnOptions.baseUrl + "MOnlineOrder.aspx?backUrl=" + this.param.backUrl + "&sortType=" + this.param.sortType + "&color=" + this.param.color
    }
  }
  function KDNPCOnlineOrderService(options) {
    this.param = options || {};
    this.validateData = function () {
      if (!utilityService.hasProperty(this.param, "container")) {
        return false
      }
      return true
    };
    this.excuteProcess = function () {
      var targetContainer = document.getElementById(this.param.container);
      if (!targetContainer) {
        console.error("请传入一个容器div");
        return false
      }
      targetContainer.style.width = "1015px";
      targetContainer.style.height = "705px";
      targetContainer.style.margin = "0px auto";
      var iframeHtml = "<iframe frameborder='0' width='1012' height='700' scrolling='auto' src='" + kdnOptions.baseUrl + "OnlineOrder.aspx'></iframe>";
      targetContainer.innerHTML = iframeHtml
    }
  }
  function KDNUtilitiesService() {
    this.hasProperty = function (object, property) {
      return object.hasOwnProperty(property) || (property in object)
    };
    this.validateReg = {
      checkNum: function (targetValue) {
        return new RegExp("^[0-9]*$").test(targetValue)
      },
      addEvent: function (elm, evType, fn, useCapture) {
        if (elm.addEventListener) {
          elm.addEventListener(evType, fn, useCapture);
          return true
        } else if (elm.attachEvent) {
          var r = elm.attachEvent('on' + evType, fn);
          return r
        } else {
          elm['on' + evType] = fn
        }
      }
    }
  }
  function Widget(options) {
    this.customerOptions = options || {};
    this.validateOptions = function () {
      var _1 = this.customerOptions;
      var _3 = this.utilitiesService;
      if ((typeof _1) === 'object' && _3.hasProperty(_1, "serviceType")) {
        var selectType = _1.serviceType || "";
        switch (selectType) {
          case "A":
            this.currentService = new KDNSearchResultService(_1);
            break;
          case "B":
            this.currentService = new KDNPCSearchResultService(_1);
            break;
          case "C":
            this.currentService = new KDNSearchTrackService(_1);
            break;
          case "D":
            this.currentService = new KDNPCSearchTrackService(_1);
            break;
          case "E":
            this.currentService = new KDNOnlineOrderService(_1);
            break;
          case "F":
            this.currentService = new KDNPCOnlineOrderService(_1);
            break;
          default:
            console.error("没有此类型的服务，请对照快递鸟官网（http://www.kdniao.com/）相关api修改后重试");
            break
        }
        this.isValidateParam = this.currentService.validateData()
      } else {
        console.error("调用快递鸟外部调用功能缺少必要参数，请对照快递鸟官网（http://www.kdniao.com/）相关api修改后重试")
      }
      return this
    };
    this.isValidateParam = false;
    this.currentService = null;
    this.utilitiesService = new KDNUtilitiesService();
    this.runer = function () {
      var page = null;
      if (this.isValidateParam) {
        page = this.currentService.excuteProcess()
      }
      return page;
    }
  }
  var api = {
    run: function (opts) {
      var w = new Widget(opts);
      return w.validateOptions().runer()
    }
  };
  //this.KDNWidget = api;
  module.exports = api;
})();