// ==UserScript==
// @require jquery.min.js
// @require mustache.min.js
// @require lodash.min.js
// @include http://*
// @include https://*
// ==/UserScript==

function G4G(){
  var self   = this;

  /*
  * Main function
  */
  this._init = function(){
    $ = window.$.noConflict(true);
    _ = window._.noConflict(true);

    // Main loop
    this.getSupportedURLs().then(function(data) {
      var host = self.getCurrentHost(); // current url
      
      var optIn; // variable to store "download opt in" value

      // finds the "Home URL" value in the JSON and stores it as supportedHost if it equals the host

      var affiliateItemId; // variable to store the unique "affiliate item id"
      var uniqueIdLabel;
      var affiliateLink;
      var deepLink;
      var url;
      var path;

      var supportedHost = !!_.find(data, function(value, key) {
        path = encodeURIComponent(self.stripTrailingSlash(window.location.pathname));
        url = encodeURIComponent(window.location.href);
        affiliateLink = value['Affiliate Link'];

        for (var object in value) {
          if (object == Object.keys(value)[21]) {
            affiliateItemId = value[object]['items']['0']['itemid'];            
            uniqueIdLabel = value[object]['items']['0']['Unique ID Label'];            
            deepLink = value[object]['items']['0']['Deep Link'];
          }
        }

        optIn = value['Download opt in'];
        return self.getHomeURL(value['Home URL']) === host;       
      });

      // if retailer url exists within json AND if retailer has opted in
      // another field "enabled" if retailer has opted in: can temporarly be disabled
      if (supportedHost && self.canDisplayPopup(host) && optIn == 1) { 
        var result = self.getDeepLink(affiliateItemId, affiliateLink, deepLink, uniqueIdLabel, url);
        console.log(result);  
        self.showPopup(host, result);
      }        
    });
  };

  this.stripTrailingSlash = function(str) {
    if(str.substr(-1) === '/') {
        return str.substr(0, str.length - 1);
    }
    return str;
  }

  /*
  * Function returns "items" array inside the JSON as a deferred object
  */
  this.getSupportedURLs = function(){
    var url = 'https://www.gifts4good.org.au/affiliate-store-item-list?json=true'; 
    var deferred = new $.Deferred();
    $.getJSON(url, function(data) {
      deferred.resolve(data['webapps_0']['items']);      
    });
    return deferred.promise(); 
  };

  /*
  * Function connects to downloads database table and retrieves the unique id based on the id parameter
  * @param id
  */
  this.getUniqueId = function(id) {
    $.get("http://localhost/downloads.php?id="+id, function(data) {
      $.each(data, function(value, key) {
        console.log(value);
      });
      return data;
    });
      
  };

  this.getDeepLink = function(itemId, affiliateLink, deepLink, uniqueIdLabel, url) {
    var apd = 5027803;
    var rakuten = 5031316;
    var affiliate_window = 5392941;
    var clix_galore = 5027806;

    switch(itemId) {
      case apd:
        console.log(affiliateLink + deepLink + url + uniqueIdLabel);
        return affiliateLink + deepLink + url + uniqueIdLabel;

      case rakuten:
        break;

      case affiliate_window:
        return affiliateLink + uniqueIdLabel + deepLink + url;
        break;

      case clix_galore:
        return affiliateLink + url + uniqueIdLabel;
        break;

      default:
        break; 
    }
  };

  /*
  * Function returns a concatenated string of the aggregator format and unique id.
  */
  this.parseUrl = function() {
    var uniqueId = self.getUniqueId(1);
    return uniqueId;
  };

  /*
  * Function removes http and https from the host url
  */
  this.getCurrentHost = function(){
    return String(window.location.host.replace('https?://', ''));
  };

  /*
  * Function removes http and https from the home url in the JSON in an attempt to make each url in the JSON the same
  */
  this.getHomeURL = function(url){
   var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }
    return String(domain);
  }

  /*
  * Function gets popup template file and appends to the body dom element
  */
  this.showPopup = function(current_host, new_link) {
    var self = this;
    var templateFile = kango.io.getResourceUrl('res/popup.html.mst');
    $.get(templateFile, function (template) {
      var rendered = Mustache.render(template, {current_host: current_host, new_link: new_link});
      $('body').append(rendered); 
      self.bindStopShow(current_host);
      self.closePopup(current_host);
    });
  };

  /*
  * Function closes popup when activate free donation button is pressed
  */
  this.closePopup = function(host){
    $('.g4g-close').click(function(){
      kango.storage.setItem("closeButton:" + host, new Date().getTime());
      $('#g4g-popup').remove();
    });
  };

  /*
  * Function closes popup if the close button is pressed
  */
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