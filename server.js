'use strict';

const express = require('express');
const ecstatic = require('ecstatic');
const http = require('http');
const request = require('request');

const app = express();

var twitterChange = function (req, res, next) {
  var userAgent = req.headers['user-agent'];
  if (userAgent.startsWith('facebookexternalhit/1.1') ||
  userAgent === 'Facebot' ||
  userAgent.startsWith('Twitterbot')) {
    var roadsideUrl = req.path;
    if (roadsideUrl.indexOf(".") > -1) {
      roadsideUrl = req.path.split(".")[0];
    }
    request('http://localhost:8443/roadsides?url=' + roadsideUrl, function (error, response, body) {
      try {
        var roadsideData = JSON.parse(body)[0];
        console.log(roadsideData);
      } catch (e) {
        next();
      }
      res.send("\n<!-- Social Tags -->\n<meta name=\"twitter:title\" content=\"" + roadsideData.name + 
        "\">\n<meta name=\"twitter:image:alt\" content=\"" + roadsideData.name + "\">\n<meta property=\"og:title\" content=\"" 
        + roadsideData.name + "\">\n<meta name=\"twitter:url\" content=\"" + "https://roadsideattractions.ca" + roadsideData.url 
        + "\">\n<meta property=\"og:url\" content=\"" + "http://roadsideattractions.ca" + roadsideData.url 
        + "\">\n<meta name=\"twitter:image:src\" content=\"" + "https://roadsideattractions.ca" + roadsideData.url + ".jpg" 
        + "\">\n<meta property=\"og:image\" content=\"" + ("https://roadsideattractions.ca" + roadsideData.url + ".jpg") + 
        "\">\n<meta name=\"twitter:description\" content=\"Large Canadian Roadside Attractions\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<meta name=\"twitter:site\" content=\"@Roadside_Canada\">\n<meta name=\"twitter:creator\" content=\"@Roadside_Canada\">\n<meta name=\"twitter:domain\" content=\"roadsideattractions.ca\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:site_name\" content=\"Large Canadian Roadside Attractions\">\n<meta property=\"og:locale\" content=\"en_US\">\n");
    });

    } else {
    next();
  }
}

console.log(typeof twitterChange);

app.use("/", twitterChange);

app.use(ecstatic({
  root: __dirname,
  showdir: true,
}));


http.createServer(app).listen(80);

console.log('Started static server.');
