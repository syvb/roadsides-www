const puppeteer = require("puppeteer");
const commandLineArgs = require("command-line-args");
const requestSync = require("sync-request");
const fs = require("fs-extra");

const execSync = require("child_process").exec;

const ROADSIDE_LIST = "http://localhost:8443/roadsides";

var renderList = [
  "main",
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
  "submit",
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"
];

JSON.parse(requestSync("GET", ROADSIDE_LIST).body.toString())
  .forEach(function(roadside) {
    renderList.push(roadside.url.substr(1, roadside.url.length));
});

const optionDefinitions = [{
  name: 'file',
  type: String,
  defaultOption: true
}];
const options = commandLineArgs(optionDefinitions);

function render(roadsideUrl, cb) {
  puppeteer.launch().then(async browser => {
    console.log("Starting to render " + roadsideUrl + ".");
    const page = await browser.newPage();
    await page.goto('http://localhost:80/#/' + roadsideUrl);
    const bodyHandle = await page.$('html');
    const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    const linkedHtml = html.replace(new RegExp('"#/', "g"), '"/roadside/')
    const htmlParts = linkedHtml.split("<!--NO-PRERENDER-->");
    const realHtml = "<!doctype html><html>" + htmlParts[0] + "<script src='hashtourl.js'></script>" + htmlParts[1].split("<!--END-->")[1]+ "</html>";
    fs.writeFile(__dirname + '/roadside/' + ((roadsideUrl === "main") ? "index" : roadsideUrl) + ".html", realHtml, (err) => {
      if (err) throw err;
    });
    await bodyHandle.dispose();
    await browser.close();
    cb(roadsideUrl);
  });
}

function renderAll(toRender) {
  if (toRender.length === 0) {
    return;
    setTimeout(renderLoop, 30000);
  }
  render(toRender.shift(), function (rendered) {
    console.log("Rendered " + rendered + ".");
    renderAll(toRender);
  });
}

//Main loop. This keeps running, rendering everything.
function renderLoop() {
  console.log("Starting!");
  execSync("sh roadside-to-json/convert.sh");
  console.log("Converted JSON!");
  renderAll(JSON.parse(JSON.stringify(renderList)));
  console.log("Rendered. Rendering again in 2 minutes.");
}
renderLoop();
