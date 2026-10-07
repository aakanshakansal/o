const badLoadingScreen = () => {
  function customLoadingScreen() {}
  var loadingScreen = new customLoadingScreen();
  customLoadingScreen.prototype.displayLoadingUI = () => {};
  customLoadingScreen.prototype.hideLoadingUI = () => {
    //this.setState({ loadingScreen: false });
  };
  return loadingScreen;
};

export default badLoadingScreen;
