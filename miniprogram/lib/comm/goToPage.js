const tabBarPagePathArr = '["\/pages\/index\/index","\/pages\/category\/category","\/pages\/myCart\/myCart","\/pages\/index\/index"]';
var switchToTab = (url) => {
  wx.switchTab({
    url: url
  });
};
var getTabPagePathArr = () => {
  return JSON.parse(tabBarPagePathArr);
};
var _goToPage = (url, isRedirect) => {
  var tabBarPagePathArr = getTabPagePathArr();
  // tabBar中的页面改用switchTab跳转
  if (tabBarPagePathArr.indexOf(url) != -1) {
    switchToTab(url);
    return;
  }
  if (!isRedirect) {
    wx.navigateTo({
      url: url
    });
  } else {
    wx.redirectTo({
      url: url
    });
  }
};
var goToPage= function(e) {
  var page = e.currentTarget.dataset.page;
  var params = e.currentTarget.dataset.params;
  params = !!params ? "?" + params : "";
  _goToPage(page == "myTeam" ? `../${page}/${page}?scene='join=A&code=2250'` : (page[0]==='/'?`${page}/${params}`:`../${page}/${page}${params}`));
}
var goToPage2 = function (e) {
  var page = e.currentTarget.dataset.page;
  var params = e.currentTarget.dataset.params;
  params = !!params ? "?" + params : "";
  _goToPage(page == "myTeam" ? `../${page}/${page}?scene='join=A&code=2250'` : `../${page}/${page}${params}`);
}

module.exports ={
  goToPage2: goToPage2,
  goToPage: goToPage
} ;