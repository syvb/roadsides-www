const puppeteer = require("puppeteer");
const commandLineArgs = require("command-line-args");
const requestSync = require("sync-request");
const fs = require("fs-extra");

const execSync = require("child_process").execSync;

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
    const page = await browser.newPage();
    await page.goto('http://localhost:80/spa/#/' + roadsideUrl);
    const bodyHandle = await page.$('html');
    const html = await page.evaluate(body => body.innerHTML, bodyHandle);
    fs.writeFile(__dirname + '/roadside/' + ((roadsideUrl === "main") ? "index" : roadsideUrl) + ".html", html, (err) => {
      if (err) throw err;
    });
    await bodyHandle.dispose();
    await browser.close();
    cb();
  });
}

function renderAll(toRender) {
  if (toRender.length === 0) {
    return;
    setTimeout(renderLoop, 30000);
  }
  render(toRender.shift(), function () {
    process.stdout.write('\x1B[2J\x1B[0f');
    console.log( ( (1 - (toRender.length / renderList.length)) * 100).toFixed(1) + "% done!");
    renderAll(toRender);
  });
}

//Main loop. This keeps running, rendering everything.
function renderLoop() {
  //execSync("cd roadside-to-json;sh convert.sh;cd ..");
  renderAll(JSON.parse(JSON.stringify(renderList)));
}
renderLoop();
