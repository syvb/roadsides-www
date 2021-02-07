var PRODUCTION = true;
var NAME_IGNORE = [
  "the",
  "a",
  "an",
  "world's largest",
];

var fs = require("fs");

var initJson = fs.readFileSync("csvtojson.json");
initJson = String(initJson);
if (initJson.indexOf("],") > -1) {
  initJson = initJson.split("],")[0] + "]";
}
initJson = JSON.parse(initJson);
var outJson = [];
var curLineNum = 1;

function cap(name) {
  var outName = "";
  name.split(" ").forEach(function(word) {
    outName += word.substr(0, 1).toUpperCase() + word.substr(1, word.length) + " ";
  });
  return outName.substr(0, outName.length -1);
}

function sortName(name) {
  name = name.toLowerCase();
  var words = name.split(/ /);
  if (NAME_IGNORE.indexOf(words[0]) > -1) {
    words.shift();
  }
  return words.join(" ");
}

initJson.forEach(function(roadside) {
  try {
  curLineNum++;
  if (((roadside.productionReady !== "yes") && PRODUCTION) || roadside.url === undefined){
    return;
  }
  
  roadside.url = roadside.url.replace("http://roadsideattractions.ca", "").replace(".html", "");
  roadside.sortName = sortName(roadside.name);
  roadside.name = cap(roadside.name);
  roadside.city = cap(roadside.city);
  if (roadside.province === "newfoundland and labrador") {
    roadside.province = "Newfoundland and Labrador";
  } else {
    roadside.province = cap(roadside.province);
  }
  roadside.line = curLineNum;
  
  outJson.push(roadside);
  } catch (e) { console.log("error on", roadside, e); }
});

var output = JSON.stringify(outJson, null, 2);

output = '{"roadsides": \n\n' + output + "}"

fs.writeFileSync("io/processed.json", output);
fs.unlinkSync("csvtojson.json");
