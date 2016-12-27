//node.js file to render site
/*npm install command-line-args
npm install node-horseman*/
var timestamp = Date.now();
var commandLineArgs = require("command-line-args");
var Horseman = require('node-horseman');
var fse = require("fs-extra");

const BASE_URL = "https://new-roadside-stuff-smittyvb.c9users.io:8082/#";
const ROADSIDE_LIST = "/home/ubuntu/temp-api/roadsides.json";
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
  var roadsideTmpFilePath = "/tmp/roadsideData";
  fse.removeSync("prerendered");
  fse.removeSync(roadsideTmpFilePath);
  fse.copySync(process.cwd(), roadsideTmpFilePath);
  fse.copySync(roadsideTmpFilePath, "prerendered");

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
    "all",
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
  JSON.parse(fse.readFileSync(ROADSIDE_LIST, {
      encoding: "utf-8"
    })).roadsides
    .forEach(function(roadside) {
      renderList.push(roadside.url.substr(1, roadside.url.length));
    });
  console.log(renderList);
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
  console.log(pageUrl);
  try {
    var horseman = new Horseman();
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
        output = output.replace("#/", "/prerendered");
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
    index = options.index ? options.index : 0;
  }
  if (index === toRender.length) {
    return;
  }
  var renderCurr = function() {
    render(BASE_URL + toRender[index], toRender[index], function() {
      renderAll(toRender, index + 1);
    });
  };
  if ((index % 10) === 0) {
    setTimeout(renderCurr, 5000);
  } else {
    renderCurr();
  }
}
