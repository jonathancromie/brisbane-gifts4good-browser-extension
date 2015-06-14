// ==UserScript==
// @require jquery.min.js
// @require mustache.min.js
// @require lodash.min.js
// @include http://*
// @include https://*
// ==/UserScript==

function G4G(){
  var self   = this;

  this._init = function(){
    $ = window.$.noConflict(true);
    _ = window._.noConflict(true);

    this.getSupportedURLs().then(function(data){
      var host = self.getCurrentHost();
      self.storeG4GParam(host);

      var supportedHost = !!_.find(data, function(value, key){ return key === host });
      if (supportedHost && self.canDisplayPopup(host)) { self.showPopup(host, self.parseUrl(data[host])); }
    });
  };

  this.getSupportedURLs = function(){
    var deferred = new $.Deferred();
    var url      = kango.io.getResourceUrl('res/affiliates.json');
    $.getJSON(url, function(data) {
      deferred.resolve(data);
    });
    return deferred.promise();
  };

  this.parseUrl = function(url) {
    return url.
      replace("{cause}", "GIVIT").
      replace("{memberId}", "1111").
      replace("{uniqueId}", Date.now());
  };

  this.getCurrentHost = function(){
    return window.location.host.replace('www.', '');
  };

  this.showPopup = function(current_host, new_link) {
    var self = this;
    var templateFile = kango.io.getResourceUrl('res/popup.html.mst');
    $.get(templateFile, function (template) {
      var rendered = Mustache.render(template, {current_host: current_host, new_link: new_link});
      $('body').append(rendered);
      self.bindStopShow(current_host);
    });
  };

  this.bindStopShow = function(host){
    $('.g4g-noshop').click(function(){
      kango.storage.setItem("closeButton:" + host, new Date().getTime());
      $('#g4g-popup').remove();
    });
  };

  this.storeG4GParam = function(host){
    var g4gPresent = /[?&]g4g=/.test(location.search);
    if (g4gPresent) {
      kango.storage.setItem("g4gParam:" + host, new Date().getTime());
    }
  };

  this.canDisplayPopup = function(host){
    return self.validateClosedButtonDate(host) && self.validateG4GParam(host);
  };

  this.validateG4GParam = function(host){
    var g4gParamAccepted = kango.storage.getItem("g4gParam:" + host);
    if (!g4gParamAccepted) { return true };

    var todayNB   = new Date().getTime();
    var fiveMinMs  = 300000;

    if ((todayNB - g4gParamAccepted) > fiveMinMs){
      kango.storage.removeItem("g4gParam:" + host);
      return true;
    } else {
      return false;
    }
  };

  this.validateClosedButtonDate = function(host) {
    var closePopupKey = kango.storage.getItem("closeButton:" + host);
    if (!closePopupKey) { return true; }

    var todayNB   = new Date().getTime();
    var oneDayMs  = 86400000;

    if ((todayNB - closePopupKey) > oneDayMs){
      kango.storage.removeItem("closeButton:" + host);
      return true;
    } else {
      return false;
    }
  };
}


var extension = new G4G();
extension._init();
