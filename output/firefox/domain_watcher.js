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

    this.getSupportedURLs().then(function(data) {
      var host = self.getCurrentHost();
      // self.storeG4GParam(host);

      var affiliateLink;
      var affiliateCode;

      var supportedHost = !!_.find(data, function(value, key) {
        // console.log(value['Affiliate Link']);
        // affiliateLink = value['Affiliate Link'];
        affiliateCode = value['Affiliate Program_id'];
        // console.log(url);
        return self.getHomeURL(value['Home URL']) === host;       
      }); 

      if (supportedHost && self.canDisplayPopup(host)) {       
          self.showPopup(host, self.parseUrl(affiliateCode));

          
          // self.showPopup(self.getDeepLink(), self.parseUrl(affiliateCode));
      }
        // self.showPopup(host, self.parseUrl(data[host])); 
        
    });
  };

  this.getSupportedURLs = function(){
    
    // var url = 'http://localhost/affiliate-store-item-list.json';
    var url = 'https://www.gifts4good.org.au/affiliate-store-item-list?json=true'; 
    var deferred = new $.Deferred();
    $.getJSON(url, function(data) {
      deferred.resolve(data['webapps_0']['items']);      
    });
    return deferred.promise(); 
  };

  this.getUniqueId = function(id) {
    var uniqueId;
    $.ajax({
      type: "GET",
      url: "http://localhost/downloads.php?id="+id,
      datatype: "html",
      async: true,
      success: function(response) {
        // console.log(response);
        uniqueId = response;
      }
    });
    return uniqueId;
  }

  this.parseUrl = function(code) {
    // return url.
    //   replace("{cause}", "GIVIT").
    //   replace("{memberId}", "1111").
    //   replace("{uniqueId}", Date.now());

    var uniqueId = self.getUniqueId(1);

    console.log(uniqueId);

    // return self.getAggregator(code) + "{uniqueId}";
    return self.getAggregator(code) + uniqueId;

    // return oldUrl.replace(oldUrl, newUrl);
  };

  this.getAggregator = function(code) {
    //Aggregators
    var affiliate_window = "&clickref=UNIQUEID";    
    var amazon = "?tag=";
    var apd = "?subId1=";
    var apple = "&ct=UNIQUEID";
    var book_depository = "&data1=UNIQUEID"
    var booking = "&label=UNIQUEID";
    var clix_galore = "&OID=UNIQUEID";
    var commission_factory = "?UniqueId=";
    var commission_junction = "?sid=UNIQUEID";
    var performance = "/pubref:UNIQUEID";
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
      default:
        break;
    }
  };

  this.getDeepLink = function() {
    return String(window.location.href);
  };

  this.getCurrentHost = function(){
    return String(window.location.host.replace('https?://', ''));
  };

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

  this.showPopup = function(current_host, new_link) {
    var self = this;
    var templateFile = kango.io.getResourceUrl('res/popup.html.mst');
    $.get(templateFile, function (template) {
      var rendered = Mustache.render(template, {current_host: current_host, new_link: new_link});
      $('body').append(rendered); 
      self.bindStopShow(current_host);
    });

    $('#g4g-popup').click(function(event) {
      KangoAPI.closeWindow()
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