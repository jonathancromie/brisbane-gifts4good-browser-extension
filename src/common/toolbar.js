function G4G() {
  var self = this;
  //kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
  //  self._onCommand();
  //});
}

G4G.prototype = {
  //_onCommand: function() {
  //  kango.browser.tabs.create({url: 'http://rhokbrisbane.org/'});
  //},

  _initPopup: function() {
    kango.ui.browserButton.setPopup({
      url: "g4g.html",
      width: 320,
      height: 300
    });
  }
};

var extension = new G4G();
extension._initPopup();