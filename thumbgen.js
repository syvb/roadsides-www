var request  = require('sync-request');
var Jimp     = require('jimp');
var fse      = require("fs-extra");
var download = require("download");

const ROADSIDE_LIST = "http://new-roadside-stuff-smittyvb.c9users.io:8081/roadsides";
const IMG_SERVER    = "https://roadsideattractions.ca"

var roadsides = JSON.parse(request("GET", ROADSIDE_LIST).body.toString());
roadsides.forEach(function (roadsideData) {
  download(IMG_SERVER + roadsideData.url + ".jpg").then(function (data) {
    fs.writeFileSync('/tmp/thumbs' + roadsideData.url + '.jpg', data);
    console.log(roadsideData.url);
    console.log(IMG_SERVER + roadsideData.url + ".jpg");
    Jimp.read("lenna.png", function (err, image) {
      if (err) {
        console.log("ERROR! " + roadsideData.url);
      }
      image
        //.autocrop(0.0002, false)
        .exifRotate()
        .normalize()
        .resize(Jimp.AUTO, 100)
        .rgba(false)
      ;
      var file = "thumbs/" + roadsideData.url + ".thumb" + image.getExtension();
      image.write(file);
    });
  });
});