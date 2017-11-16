const puppeteer = require("puppeteer");
const commandLineArgs = require("command-line-args");
const requestSync = require("sync-request");
const fs = require("fs-extra");

const ROADSIDE_LIST = "http://localhost:8443/roadsides";

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


//Main loop. This keeps running, rendering everything.
function renderLoop() {
  var curRenderList = JSON.parse(JSON.stringify(renderList));
  for (var i = 0; curRenderList.length > 0; i++) {
    let roadsideUrl = curRenderList.pop();
    setTimeout(function () {
      puppeteer.launch().then(async browser => {
        const page = await browser.newPage();
        await page.goto('http://localhost:80/#/' + roadsideUrl);
        const bodyHandle = await page.$('html');
        const html = await page.evaluate(body => body.innerHTML, bodyHandle);
        fs.writeFile(__dirname + '/roadside/' + roadsideUrl + ".html", html, (err) => {
          if (err) throw err;
        });
        await bodyHandle.dispose();
        await browser.close();
        console.log(roadsideUrl + " is rendered!");
      });
    }, i * 1000);
  }
  setTimeout(renderLoop, 30000);
}
renderLoop();
