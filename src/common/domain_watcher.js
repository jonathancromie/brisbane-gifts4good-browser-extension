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
    $        = window.$.noConflict(true);
    _        = window._.noConflict(true);
    this.getSupportedURLs().then(function(data){
      var host          = self.getCurrentHost();
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
      kango.storage.setItem(host, new Date().getTime());
      $('#g4g-popup').remove();
    });
  };

  this.canDisplayPopup = function(host){
    var dateNb    = kango.storage.getItem(host);
    if (!dateNb)    { return true; }
    var todayNB   = new Date().getTime();
    var oneDayMs  = 86400000;

    if ((todayNB - dateNb) > oneDayMs){
      kango.storage.removeItem(host);
      return true;
    } else {
      return false;
    }
  };
}


var extension = new G4G();
extension._init();
