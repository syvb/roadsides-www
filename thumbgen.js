var request = require('sync-request');
var Jimp    = require('jimp');
var fse = require("fs-extra");

const ROADSIDE_LIST = "http://new-roadside-stuff-smittyvb.c9users.io:8081/roadsides";
const IMG_SERVER    = "https://smittyvb.github.io/roadsides"

var roadsides = JSON.parse(request("GET", ROADSIDE_LIST).body.toString());
roadsides.forEach(function (roadsideData) {
  Jimp.read(IMG_SERVER + roadsideData.url + ".jpg", function (err, image) {
    if (err) {
      return;
    }
    console.log(IMG_SERVER + roadsideData.url + ".jpg");
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