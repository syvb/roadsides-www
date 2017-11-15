const puppeteer = require('puppeteer');
var commandLineArgs = require("command-line-args");

const optionDefinitions = [{
  name: 'file',
  type: String,
  defaultOption: true
}];
const options = commandLineArgs(optionDefinitions);

puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.goto('http://localhost:80/#' + options.file);
  const bodyHandle = await page.$('html');
  const html = await page.evaluate(body => body.innerHTML, bodyHandle);
  console.log(html);
  await bodyHandle.dispose();
  await browser.close();
});
