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

    this.getSupportedURLs().then(function(data) {
      // var host = self.getCurrentHost(); // current url
      var host = self.getCurrentHost();
      var affiliateCode; // variable to store the unique "affiliate item id"

      // finds the "Home URL" value in the JSON and stores it as supportedHost if it equals the host
      var supportedHost = !!_.find(data, function(value, key) {
        affiliateCode = value['Affiliate Program_id'];
        return self.getHomeURL(value['Home URL']) === host;       
      }); 

      if (supportedHost && self.canDisplayPopup(host)) { 
        var url = self.parseUrl(affiliateCode); // This is the deep link + unique id for database
        // self.showPopup(self.getDeepLink(host), self.parseUrl(affiliateCode));
        self.showPopup(host, self.parseUrl(affiliateCode));      
      }        
    });
  };

  /*
  * Function returns "items" array inside the JSON as a deferred object
  */
  this.getSupportedURLs = function(){
    var url = 'http://www.gifts4good.org.au/affiliate-store-item-list?json=true'; 
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
    var uniqueId;
    $.ajax({
      type: "GET",
      url: "http://localhost/downloads.php?id="+id,
      datatype: "html",
      async: false,
      success: function(response) {
        uniqueId = response;
      }
    });
    return uniqueId;
  }

  /*
  * Function returns a concatenated string of the aggregator format and unique id.
  */
  this.parseUrl = function(code) {
    var uniqueId = self.getUniqueId(1);
    var aggregator = self.getAggregator(code);
    return aggregator + uniqueId;
  };

  /*
  * Function takes the affiliate program id, identifies the aggregator and returns the format.
  */
  this.getAggregator = function(code) {
    //Aggregators

    // hard coding probably isnt the best way - should probably create variables based on the item id in the json
    var affiliate_window = "&clickref=";    
    var amazon = "?tag=";
    var apd = "?subId1=";
    var apple = "&ct=";
    var book_depository = "&data1="
    var booking = "&label=";
    var clix_galore = "&OID=";
    var commission_factory = "?UniqueId=";
    var commission_junction = "?sid=";
    var performance = "/pubref:";
    var rakuten = "&u1=";

    switch(code) {
      // Affiliate Window
      case "5104821":
        return affiliate_window;
        break;
      // Amazon
      case "5027802":
        return amazon;
        break;
      //APD DGM
      case "5027803":
        return apd;
        break;
      // Apple Itunes
      case "5329828":
        return apple;
        break;
      // Book Depository
      case "5027804":
        return book_depository;
        break;
      // Booking.com
      case "5023795":
        return booking;
        break;
      // Clix Galore
      case "5027806":
        return clix_galore;
        break;
      // Commission Factory
      case "5027801":
        return commission_factory;
        break;
      // Commission Junction
      case "5047759":
        return commission_junction;
        break;
      // Performance Horizon Group
      case "5510020":
        return performance;
        break;
      // Rakuten Linkshare
      case "5031316":
        return rakuten;
        break;
      case "5392941":
        return affiliate_window;
      default:
        break;
    }
  };

  this.getDeepLink = function(url) {
    // return window.location.href.replace('https?://', '');
    return url = url.replace(/^.*\/\/[^\/]+/, '');
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