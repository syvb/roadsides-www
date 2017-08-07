//node.js file to render site
/*npm install command-line-args
npm install node-horseman*/
var timestamp = Date.now();
var commandLineArgs = require("command-line-args");
var Horseman = require('node-horseman');
var fse = require("fs-extra");
var request = require('sync-request');

const BASE_URL = "http://new-roadside-stuff-smittyvb.c9users.io:8082/#";
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
}, {
  name: 'staticonly',
  type: Boolean
}, {
  name: 'nodelete',
  type: Boolean
}];
const options = commandLineArgs(optionDefinitions);
if (options.file !== undefined) {
  render(BASE_URL + options.file, options.file);
}
else if (options.all || options.index) {
  //render entire site


  //copy data files from root, to roadside directory
  if ((options.index === undefined) || (options.nodelete)) {
    var roadsideTmpFilePath = "/tmp/roadsideData";
    fse.removeSync("roadside");
    fse.removeSync(roadsideTmpFilePath);
    fse.copySync(process.cwd(), roadsideTmpFilePath);
    fse.copySync(roadsideTmpFilePath, "roadside");
    fse.removeSync("roadside/.git");
    fse.removeSync("roadside/.c9");
    fse.removeSync("roadside/node_modules");
    fse.removeSync("roadside/roadside-to-json");
    fse.removeSync("roadside/images");
    fse.removeSync("roadside/.gitignore");
  }
  //delete index.html, and replace it with #/main
  fse.removeSync("roadside/index.html");
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
    "archive",
    "whatsnew",
    "tch",
    "type",
    "tags",
    "terms",
    "media",
    "extras",
    //"submit"
  ];
  //letters of alphabet
  renderList = renderList.concat("qwertyuiopasdfghjklzxcvbnm".split(""));
  //roadside names
  if (!options.staticonly) {
    JSON.parse(request("GET", ROADSIDE_LIST).body.toString())
      .forEach(function(roadside) {
        renderList.push(roadside.url.substr(1, roadside.url.length));
      });
  }
  //render every page
  renderAll(renderList, options.index);

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
      .at("resourceError", function (e) {
        console.error("ERROR: " + e);
      })
      .cookies([{
        name: 'c9.live.user.click-through',
        value: 'ok',
        domain: '.c9users.io'
      }])
      .open(pageUrl)
      .waitForSelector(".loaded", 7500)
      .html("html").then(function(html) {
        console.log("loaded: " + pageUrl);
        output = html.replace(new RegExp('"#/', "g"), '"/roadside/');
        output = output.split("<!--NO-PRERENDER-->");
        output = output[0] +
          "<script src='hashtourl.js'></script>" +
          output[1].split("<!--END-->")[1];
        output = "<!doctype html><html>" + output + "</html>";
        fse.writeFile("roadside/" + fileName + ".html", output, "utf-8", function(err) {
          console.log(err);
        });
        //setTimeout(function () {
          horseman.close();
        //}, 1000);
        if (callback) {
          callback();
        }
      })
      .catch(function (e) {console.log("Horseman error: " + e)});
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
  if ((index % 5) === 0) {
    setTimeout(renderCurr, 4500);
  } else {
    renderCurr();
  }
}
