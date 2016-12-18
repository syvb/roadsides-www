var Roadsides = window.Roadsides || {};
Roadsides.API_LOC = "//" + window.location.hostname + ":8081/"; //set to location of API server
/*
Each item in the routing table is evaluated, in order from top to bottom.
If one succeeds, then the program stop going through the table.
Each function is passed a callback function. If a function does not apply for the page, or otherwise fails, call fail(), and return.
Each function is also passed the name of the current page, in order to get the correct content.
These functions are responsible for setting the HTML code.
*/

window.onload = function() {
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
    htmlFromRoadsideArray: function (array) {
      var html = "<table class ='roadsideList'>";
      array.forEach(function (roadside) {
        html += '<tr>';
        html += '<td class="listImage"><img src="http://smittyvb.github.io/roadsides' + roadside.url + '.jpg" height="100" /></td>';
        //html += '<td>&nbsp;&nbsp;&nbsp;</td>'
        html += '<td class="listTitle"><a href="#'  + roadside.url + '">' + roadside.name + ' <br /> ' + roadside.city + ', ' + roadside.province + '</a></td>';
        html += '</tr>';
      });
      html += "</table>";
      return html;
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
          console.log(roadsideData);
          var html = Roadsides.ROADSIDE_TEMPLATE(roadsideData);
          document.getElementById("mainContent").innerHTML = html + "<div class='loaded'></div>";
          document.getElementById("mainContent").className = "roadside text-center";
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
        //query the database
        var request = new XMLHttpRequest();
        request.onload = function (data) {
          var dbJson = JSON.parse(data.target.responseText);
          var html = Roadsides.Router.htmlFromRoadsideArray(dbJson);
          document.getElementById("mainContent").innerHTML = "<div class='loaded'></div><h1>By Province - " + Roadsides.Router.provinceUrlMapping[pageName] + "</h1>" + html;
        };
        request.open("GET", Roadsides.API_LOC + "roadsides?province=" + Roadsides.Router.provinceUrlMapping[pageName] + "&_sort=name");
        request.send();
      },
      //alphabetical page
      function (pageName, fail) {
        if (pageName.length !== 1) {
          return fail();
        }
        var request = new XMLHttpRequest();
        request.onload = function (data) {
          var dbJson = JSON.parse(data.target.responseText);
          var html = Roadsides.Router.htmlFromRoadsideArray(dbJson);
          document.getElementById("mainContent").innerHTML = "<div class='loaded'></div><h1>Alphabetical - " + pageName + "</h1>" + html;
        };
        request.open("GET", Roadsides.API_LOC + "roadsides?name_like=^" + pageName + "&_sort=name");
        request.send();
      },
      function (pageName, fail) {
        if (pageName !== "all") {
          return fail();
        }
        var request = new XMLHttpRequest();
        request.onload = function (data) {
          var dbJson = JSON.parse(data.target.responseText);
          var html = Roadsides.Router.htmlFromRoadsideArray(dbJson);
          document.getElementById("mainContent").innerHTML = "<div class='loaded'></div><h1>All Roadside Attractions</h1>" + html;
        };
        request.open("GET", Roadsides.API_LOC + "roadsides?_sort=name");
        request.send();
      },
      function (pageName, fail) {
        if (pageName !== "archive") {
          return fail();
        }
        var request = new XMLHttpRequest();
        request.onload = function (data) {
          var dbJson = JSON.parse(data.target.responseText);
          var html = Roadsides.Router.htmlFromRoadsideArray(dbJson);
          document.getElementById("mainContent").innerHTML = "<div class='loaded'></div><h1>Archive</h1>" + html;
        };
        request.open("GET", Roadsides.API_LOC + "roadsides?_sort=name&archive=true");
        request.send();
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
  var dropdownlinks = document.getElementsByClassName("dropdownlinks");
  for (i = 0; i < dropdownlinks.length; i++) {
    dropdownlinks[i].addEventListener("change", function(e) {
      var selected = e.target.value;
      if ((location.hash.replace("/", "") === selected) || (selected === "none")) {
        return;
      }
      location.hash = "/" + selected;
      Roadsides.Router.update();
    });
  }
  Roadsides.Router.update();
};
