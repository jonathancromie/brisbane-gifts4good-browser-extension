// ==UserScript==
// @require jquery.min.js
// @include http://*
// @include https://*
// ==/UserScript==

function G4G(){
  var self   = this;

  this._init = function(){
    $        = window.$.noConflict(true);
    this.getSupportedURLs().then(function(data){
      var host = self.getCurrentHost();
      $.each(data, function(key, value) {
        console.log(key);
        if (host === key){
          self.showPopup(value);
        }
      });
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

  this.getCurrentHost = function(){
    return window.location.host;
  };

  this.showPopup = function(value){
    var $toolbar = $("<div />").addClass("g4g-popup").appendTo("body");
    console.log('is about to dump Oli in the DOM');
    $toolbar.text('Oliiiiii');
  };
}


var extension = new G4G();
extension._init();