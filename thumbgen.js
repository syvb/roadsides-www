//ENSURE SERVERS ARE RUNNING!

var request  = require('sync-request');
var Jimp     = require('jimp');
var fse      = require("fs-extra");
var download = require("download");

const ROADSIDE_LIST = "http://new-roadside-stuff-smittyvb.c9users.io:8081/roadsides";
const IMG_SERVER    = "https://roadsideattractions.ca"
var interval      = 425; // time between each pic render

var roadsides = JSON.parse(request("GET", ROADSIDE_LIST).body.toString());
//var roadsides = [{
//  url: "/lcra1519"
//}]
var curInterval = 250;
var doneRoadsides = 0;
var totalRoadsides = roadsides.length;
roadsides.forEach(function (roadsideData) {
  setTimeout(function () {
    download(IMG_SERVER + roadsideData.url + ".jpg", '/tmp/thumbs').then(function (data) {
      //console.log(data.body);
      //console.log(roadsideData.url);
      //console.log(IMG_SERVER + roadsideData.url + ".jpg");
      Jimp.read('/tmp/thumbs' + roadsideData.url + '.jpg').then(function (image) {
        //console.log(image);
        var file = "thumbs/" + roadsideData.url + ".thumb" + ".jpg";
        image
          //.autocrop(.1, false)
          .exifRotate()
          .normalize()
          .resize(Jimp.AUTO, 100)
          .rgba(false)
          .quality(65)
          .write(file)
        ;
        doneRoadsides++;
        console.log('\033[2J');
        console.log(`Completed ${doneRoadsides}/${totalRoadsides} roadsides! ${Math.floor((doneRoadsides / totalRoadsides) * 100)}% done.`);
      }).catch(function (err) {
        throw new Error;
      });
    });
  }, curInterval);
  curInterval += interval;
  interval += .1;
});