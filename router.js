var Roadsides = window.Roadsides || {};
Roadsides.API_LOC = "http://" + location.hostname + ":8443/"; //set to location of API server
Roadsides.ARCHIVE_PROV_INFO = `
<div style="text-align: left; width: 100%;max-width: 110rem;">
  Archived roadsides for each province:
  <a href="#/albertaarchived">Alberta</a>,
  <a href="#/bcarchived">British Columbia</a>,
  <a href="#/manitobaarchived">Manitoba</a>,
  <a href="#/newbrunswickarchived">New Brunswick</a>,
  <a href="#/nfldarchived">Newfoundland and Labrador</a>,
  <a href="#/nwtarchived">Northwest Territories</a>,
  <a href="#/novascotiaarchived">Nova Scotia</a>,
  <a href="#/nunavutarchived">Nunavut</a>,
  <a href="#/ontarioarchived">Ontario</a>,
  <a href="#/peiarchived">Prince Edward Island</a>,
  <a href="#/quebecarchived">Quebec</a>,
  <a href="#/saskarchived">Saskatchewan</a>,
  <a href="#/yukonarchived">Yukon</a>
</div>`;
/*
Each item in the routing table is evaluated, in order from top to bottom.
If one succeeds, then the program stop going through the table.
Each function is passed a callback function. If a function does not apply for the page, or otherwise fails, call fail(), and return.
Each function is also passed the name of the current page, in order to get the correct content.
These functions are responsible for setting the HTML code.
*/

addEventListener("load", function() {
  Roadsides.ROADSIDE_TEMPLATE = Handlebars.compile(document.getElementById("roadside-template").innerHTML);
  Roadsides.Router = {
    provinceUrlMapping: {
      "alberta": "Alberta",
      "bc": "British Columbia",
      "manitoba": "Manitoba",
      "newbrunswick": "New Brunswick",
      "nfld": "Newfoundland and Labrador",
      "nwt": "Northwest Territories",
      "novascotia": "Nova Scotia",
      "nunavut": "Nunavut",
      "ontario": "Ontario",
      "pei": "Prince Edward Island",
      "quebec": "Quebec",
      "sask": "Saskatchewan",
      "yukon": "Yukon"
    },
    htmlFromRoadsideArray: function (array, showInitDate, limit) {
      if (limit === undefined) {
        limit = Infinity;
      }
      var html = "<table class ='roadsideList'>";
      array.forEach(function (roadside, index) {
        if (index >= limit) {
          return;
        }
        if (roadside.archive === "hidden") {
          return;
        }
        html += '<tr>';
        html += '<td class="listImage"><a href="#'  + roadside.url + '"><img src="https://roadsideattractions.ca' + roadside.url + '.jpg" height="100" /></a></td>';
        //html += '<td>&nbsp;&nbsp;&nbsp;</td>'
        html += '<td class="listTitle"><a href="#'  + roadside.url + '"><span style="font-weight: 900;">' + roadside.name + '</span> <br /> ' + roadside.city + ', ' + roadside.province + '</a>' + (showInitDate === true ? "<br />Date added to site: " + roadside.initDate.split(".")[0] : "") + '</td>';
        html += '</tr>';
      });
      html += "</table>";
      return html;
    },
    dbQuery: function (query, title, whatsNew, limit, archive) {
      var request = new XMLHttpRequest();
      request.onload = function (data) {
        var dbJson = JSON.parse(data.target.responseText);
        if (whatsNew) {
          dbJson.reverse();
        }
        var html = Roadsides.Router.htmlFromRoadsideArray(dbJson, whatsNew, limit);
        if (archive) {
          html = Roadsides.ARCHIVE_PROV_INFO + html;
        }
        document.getElementById("mainContent").innerHTML = "<div class='loaded'></div><h1>" + title + "</h1>" + html;
      };
      request.open("GET", Roadsides.API_LOC + "roadsides?" + query);
      request.send();
    },
    routeTable: [
      //roadside page
      function(pageName, fail) {
        var dbRequest = new XMLHttpRequest();
        dbRequest.addEventListener("load", function(dbData) {
          if ((dbData.target.responseText === "[]") || (JSON.parse(dbData.target.responseText) === undefined)) {
            return fail();
          }
          var roadsideData = JSON.parse(dbData.target.responseText)[0];
          if (roadsideData.initDate) {
            roadsideData.initDate = roadsideData.initDate.split(".")[0];
          }
          roadsideData.imgUrls = [
            {imgUrl: "https://roadsideattractions.ca" + roadsideData.url + ".jpg"}
          ];
          var extraPics = roadsideData.photos - 1;
          var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
          for (var i = 0; i < extraPics; i++) {
            roadsideData.imgUrls.unshift({imgUrl: "https://roadsideattractions.ca/lcra" + roadsideData.line + alphabet[i] + ".jpg"});
          }
          if (extraPics === 0) {
            roadsideData.showGallery = false;
          } else {
            roadsideData.showGallery = true;
          }
          if (roadsideData.gps === "na") {
            roadsideData.noGps = true;
            roadsideData.gps = "";
          } else {
            roadsideData.noGps = false;
          }
          if ((roadsideData.archive === "FALSE") || (roadsideData.archive === "hidden")) {
            roadsideData.archive = false;
          }
          if (roadsideData.archive === "TRUE") {
            roadsideData.archive = true;
          }
          console.log(roadsideData);
          var html = Roadsides.ROADSIDE_TEMPLATE(roadsideData);

          //social media page tags
          document.querySelectorAll("meta[property], meta[name='twitter:title'], meta[name='twitter:image:alt'], meta[name='twitter:image:src'], meta[name='twitter:description'], meta[name='twitter:card'], meta[name='twitter:site'], meta[name='twitter:creator'], meta[name='twitter:domain']").forEach(x => x.remove())
          document.getElementsByTagName("head")[0].innerHTML += document.getElementById("media").innerHTML = "\n<!-- Social Tags -->\n<meta name=\"twitter:title\" content=\"" + roadsideData.name + "\">\n<meta name=\"twitter:image:alt\" content=\"" + roadsideData.name + "\">\n<meta property=\"og:title\" content=\"" + roadsideData.name + "\">\n<meta name=\"twitter:url\" content=\"" + "https://roadsideattractions.ca" + roadsideData.url + "\">\n<meta property=\"og:url\" content=\"" + "http://roadsideattractions.ca" + roadsideData.url + "\">\n<meta name=\"twitter:image:src\" content=\"" + "https://roadsideattractions.ca" + roadsideData.url + ".jpg" + "\">\n<meta property=\"og:image\" content=\"" + ("https://roadsideattractions.ca" + roadsideData.url + ".jpg") + "\">\n<meta name=\"twitter:description\" content=\"Large Canadian Roadside Attractions\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<meta name=\"twitter:site\" content=\"@Roadside_Canada\">\n<meta name=\"twitter:creator\" content=\"@Roadside_Canada\">\n<meta name=\"twitter:domain\" content=\"roadsideattractions.ca\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:site_name\" content=\"Large Canadian Roadside Attractions\">\n<meta property=\"og:locale\" content=\"en_US\">\n";
          document.getElementById("mainContent").className = "roadside text-center";
          document.getElementById("mainContent").innerHTML = html;
          document.getElementById("mainContent").innerHTML += "<div class='loaded'></div>";
          
          document.title = roadsideData.name;
          setTimeout(function () {
            // should be done in dropdown in prerendered:
            // $(".fotorama").fotorama();
          }, 100);
          Roadsides.Router.highlightActive();
        });
        dbRequest.open("GET", Roadsides.API_LOC + "roadsides?url=/" + pageName);
        dbRequest.send();
      },
      //province page
      function(pageName, fail) {
        //make sure we have a valid province url
        if (Roadsides.Router.provinceUrlMapping[pageName] === undefined) {
          return fail();
        }
        Roadsides.Router.dbQuery("province=" + Roadsides.Router.provinceUrlMapping[pageName] + "&_sort=city&archive=FALSE",
          Roadsides.Router.provinceUrlMapping[pageName]);
      },
      //province archived page
      function(pageName, fail) {
        //make sure we have a valid province url
        let province = pageName.match(/^(\w+)archived$/);
        if (province === null) return fail();
        province = province[1];
        if (Roadsides.Router.provinceUrlMapping[province] === undefined) {
          return fail();
        }
        Roadsides.Router.dbQuery("province=" + Roadsides.Router.provinceUrlMapping[province] + "&_sort=city&archive=TRUE",
          Roadsides.Router.provinceUrlMapping[province] + " - Archived");
      },
      //alphabetical page
      function (pageName, fail) {
        if (pageName.length !== 1) {
          return fail();
        }
        Roadsides.Router.dbQuery("sortName_like=^" + pageName + "&_sort=sortName&archive=FALSE", 
        "Alphabetical - " + pageName.toUpperCase());
      },
      function (pageName, fail) {
        if (pageName !== "alphabet") {
          return fail();
        }
        Roadsides.Router.dbQuery("_sort=sortName&archive=FALSE", "All Roadside Attractions");
      },
      function (pageName, fail) {
        if (pageName !== "archive") {
          return fail();
        }
        Roadsides.Router.dbQuery("_sort=sortName&archive=TRUE", "Archive", undefined, undefined, true);
      },
      function(pageName, fail) {
        if (pageName !== "whatsnew") {
          return fail();
        }
        Roadsides.Router.dbQuery("initDate_like=^[0-9]", 
          "Most Recently Added Roadside Attractions",
          true, 20);
      },
      //static page
      function(pageName, fail) {
        var request = new XMLHttpRequest();
        request.addEventListener("load", function(data) {
          if (data.target.status === 404) {
            return fail();
          }
          var html = data.target.responseText;
          document.getElementById("mainContent").innerHTML = html + "<div class='loaded'></div>";
          document.getElementById("mainContent").className = "static";
          Roadsides.Router.highlightActive();
        });
        request.open("GET", "templates/" + pageName + ".temp");
        request.send();
      },
      //404
      function(pageName,fail) {
        document.getElementById("mainContent").innerHTML = "The page you were looking for does not exist at this time.";
      }
    ],
    update: function() {
      setTimeout(function() {
        if (location.hash === "") {
          location.hash = "#/main";
        }
        Roadsides.Router.loadPage(location.hash);
      }, 0);
    },
    loadPage: function(pageName) {
      document.getElementById("mainContent").class = "text-center";
      pageName = pageName.replace(/[^a-zA-Z0-9]/g, "");
      doneFuncCalled = false;
      var currRouteFunc = 0;
      //go through routing table
      var fail = function () {};
      fail = function() {
        currRouteFunc += 1;
        startFuncNum = currRouteFunc;
        Roadsides.Router.routeTable[currRouteFunc](pageName, fail);
      };
      Roadsides.Router.routeTable[0](pageName, fail);
    },
    highlightActive: function() {
      var activeEles = document.getElementsByClassName("active");
      for (i = 0; i < activeEles.length; i++) {
        activeEles[i].className = "";
      }
      try {
        document.getElementById(location.hash.replace(/[^a-zA-Z ]/g, "")).className += "active";
      }
      catch (e) {}

    },
  };
  Roadsides.Router.highlightActive();
  if (window.onpopstate !== null) {
    var allLinks = document.getElementsByTagName("a");
    for (var i = 0; i < allLinks.length; i++) {
      allLinks[i].addEventListener("click", Roadsides.Router.update);
    }
  }
  else {
    window.onpopstate = Roadsides.Router.update;
  }
  Roadsides.Router.update();
});
addEventListener("load", function() {
  Roadsides.Router.update();
});

//IE Fix
//For some reason, IE won't detect hash changes correctly
function isIE() {
  if (navigator.appName == 'Microsoft Internet Explorer') {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null) {
      return true;
    }
  }
  if (!!window.MSInputMethodContext && !!document.documentMode) {
    return true; //IE11 detect
  }
  return false;
}

if (isIE()) {
  var lastHash = location.hash;
  setInterval(function () {
    if (location.hash != lastHash) {
      Roadsides.Router.update();
    }
  }, 550);
}
