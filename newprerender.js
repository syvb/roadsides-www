const puppeteer = require("puppeteer");
const commandLineArgs = require("command-line-args");
const requestSync = require("sync-request");
const fs = require("fs-extra");

const execSync = require("child_process").execSync;

const ROADSIDE_LIST = "http://localhost:8443/roadsides";

var renderList = [];

JSON.parse(requestSync("GET", ROADSIDE_LIST).body.toString())
  .forEach(function(roadside) {
    renderList.push(roadside.url.substr(1, roadside.url.length));
  });

console.log("got roadside list");

var sPages = [
  "main",
  //static pages
  "contact",
  "founder",
  "pics",
  "province",
  "map",
  "merch",
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
  "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
renderList = renderList.concat(sPages);

const optionDefinitions = [{
  name: 'file',
  type: String,
  defaultOption: true
}];
const options = commandLineArgs(optionDefinitions);
function render(roadsideUrl, cb) {
  puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    const pageUri = 'http://localhost:' + (process.env.ROADPORT || '80') + (process.env.NO_SPA_SUB ? '' : '/spa') + '/#/' + roadsideUrl;
    console.log(pageUri);
    await page.goto(pageUri);
    await page.waitFor(".loaded");
    var html = await page.evaluate(() => document.documentElement.outerHTML);
    html = html.replace(new RegExp('"#/', "g"), '"/roadside/');
    html = html.split("<!--NO-PRERENDER-->");
    html = html[0] +
      "<script src='hashtourl.js'></script>" +
      html[1].split("<!--END-->")[1];
    var canShowAd = false;//sPages.indexOf(roadsideUrl) === -1;
    var randomCanShowAd = Math.random();
    console.log(roadsideUrl, canShowAd, randomCanShowAd.toFixed(2));
    if (canShowAd && (randomCanShowAd > 0.5)) {
      html = html.replace("<!--AD-->", 
//`<a href="/roadside/merch"><img src="https://ipfs.eternum.io/ipfs/QmZBAspszTBUhX7LpYPY4mvYM5sKHkbrJVZ6iEdqvknA83/lcra-ad1.jpg"></a>`
`<a href="/roadside/merch"><div style="padding-top: 13em;">Ad</div><img src="https://ipfs.eternum.io/ipfs/QmZBAspszTBUhX7LpYPY4mvYM5sKHkbrJVZ6iEdqvknA83/lcra-ad1.jpg"></a>`
                   );
    }
    output = "<!doctype html><html>" + html + "</html>";
    fs.writeFile(__dirname + '/roadside/' + ((roadsideUrl === "main") ? "index" : roadsideUrl) + ".html", html, (err) => {
      if (err) throw err;
    });
    await browser.close();
    cb();
  });
}
if (options.file) {
  render(options.file, function () {
    console.log("Rendered " + options.file);
  });
} else {
  function renderAll(toRender) {
    if (toRender.length === 0) {
      return;
      //setTimeout(renderLoop, 30000);
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
}
