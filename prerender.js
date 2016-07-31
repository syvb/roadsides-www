//node.js file to render site
/*npm install command-line-args
npm install node-horseman*/
var timestamp = Date.now();
var commandLineArgs = require("command-line-args");
var fs = require("fs");

const BASE_URL = "https://new-roadside-stuff-smittyvb.c9users.io/#"
const optionDefinitions = [
  { name: 'all', alias: 'a', type: Boolean },
  { name: 'file', type: String, defaultOption: true },
  { name: 'force', type: Boolean }
];
const options = commandLineArgs(optionDefinitions);
if (options.file === undefined) {
    throw "Error - no file to process!";
}

var url = BASE_URL + options.file;

var Horseman = require('node-horseman');
var horseman = new Horseman();
var output = "An error occured. Please try again later.";
horseman
  .open(url)
  .waitForSelector(".roadsideImage", 5000)
  .html("html").then(function (html) {
    output = html;
    output = output.split("<!--NO-PRERENDER-->")
    output = output[0] + output[1].split("<!--END-->")[1];
    fs.writeFile("test.html", output, "utf-8", function () {console.log("Complete.");console.log("Took " + (Date.now() - timestamp) / 1000 + " seconds.");})
    horseman.close();
  });