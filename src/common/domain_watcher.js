// ==UserScript==
// @require jquery.min.js

function G4G(){
  this._init = function(){
    $        = window.$.noConflict(true);
    var host = this.getCurrentHost();
    if (host === 'www.amazon.com'){
      this.showPopup();
    }
  };

  this.getCurrentHost = function(){
    return window.location.host;
  };

  this.showPopup = function(){
    var $toolbar = $("<div />").addClass("g4g-popup").appendTo("body");
    console.log('is about to dump Oli in the DOM');
    $toolbar.text('Oliiiiii');
  };
}


var extension = new G4G();
extension._init();