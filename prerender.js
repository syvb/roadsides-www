//node.js file to render site
/*npm install command-line-args
npm install node-horseman*/
var timestamp = Date.now();
var commandLineArgs = require("command-line-args");
var Horseman = require('node-horseman');
var fse = require("fs-extra");
var request = require('sync-request');

const BASE_URL = "https://new-roadside-stuff-smittyvb.c9users.io:8082/#";
const ROADSIDE_LIST = "http://new-roadside-stuff-smittyvb.c9users.io:8081/roadsides";
const optionDefinitions = [{
  name: 'all',
  alias: 'a',
  type: Boolean
}, {
  name: 'file',
  type: String,
  defaultOption: true
}, {
  name: 'force',
  type: Boolean
}, {
  name: 'index',
  type: Number
}];
const options = commandLineArgs(optionDefinitions);
if (options.file !== undefined) {
  render(BASE_URL + options.file, options.file);
}
else if (options.all) {
  //render entire site


  //copy data files from root, to prerendered directory
  if (options.index === undefined) {
    var roadsideTmpFilePath = "/tmp/roadsideData";
    fse.removeSync("prerendered");
    fse.removeSync(roadsideTmpFilePath);
    fse.copySync(process.cwd(), roadsideTmpFilePath);
    fse.copySync(roadsideTmpFilePath, "prerendered");
    fse.removeSync("prerendered/.git");
    fse.removeSync("prerendered/.c9");
    fse.removeSync("prerendered/node_modules");
    fse.removeSync("prerendered/roadside-to-json");
    fse.removeSync("prerendered/images");
    fse.removeSync("prerendered/.gitignore");
  }
  //delete index.html, and replace it with #/main
  fse.removeSync("prerendered/index.html");
  render(BASE_URL + "main", "index");

  //get list of all pages in site
  var renderList = [
    //static pages
    "contact",
    "founder",
    "pics",
    "province",
    //all roadsides page
    "alphabet",
    //province pages
    "alberta",
    "bc",
    "manitoba",
    "newbrunswick",
    "nfld",
    "nwt",
    "novascotia",
    "nunavut",
    "ontario",
    "pei",
    "quebec",
    "sask",
    "yukon",
    //other
    "archive"
  ];
  //letters of alphabet
  renderList = renderList.concat("qwertyuiopasdfghjklzxcvbnm".split(""));
  //roadside names
  JSON.parse(request("GET", ROADSIDE_LIST).body.toString())
    .forEach(function(roadside) {
      renderList.push(roadside.url.substr(1, roadside.url.length));
    });
  //render every page
  renderAll(renderList);

  //print timestamp
  console.log("Complete.");
  console.log("Took " + Date.now() - timestamp);
}
else {
  console.log("Invalid arguments.");
}

var output = "An error occured. Please try again later.";

function render(pageUrl, fileName, callback) {
  console.log("rendering: " + pageUrl);
  try {
    var horseman = new Horseman({
      timeout: 10000,
      loadImages: false,
      webSecurity: false,
      injectJquery: false
    });
    horseman
      .open(pageUrl)
      .waitForSelector(".loaded", 7500)
      .html("html").then(function(html) {
        console.log("loaded: " + pageUrl);
        output = html;
        output = output.split("<!--NO-PRERENDER-->");
        output = output[0] +
          "<script src='hashtourl.js'></script>" +
          output[1].split("<!--END-->")[1];
        fse.writeFile("prerendered/" + fileName + ".html", output, "utf-8", function(err) {
          console.log(err);
        });
        horseman.close();
        if (callback) {
          callback();
        }
      });
  }
  catch (e) {
    console.log("Can't render " + pageUrl);
  }
}


function renderAll(toRender, index) {
  if (index === undefined) {
    index = options.index ? options.index + 40 : 0; //40 is about the number of static pages
  }
  if (index === toRender.length) {
    return;
  }
  var renderCurr = function() {
    render(BASE_URL + toRender[index], toRender[index], function() {
      renderAll(toRender, index + 1);
    });
  };
  if ((index % 15) === 0) {
    setTimeout(renderCurr, 15000);
  } else {
    renderCurr();
  }
}
