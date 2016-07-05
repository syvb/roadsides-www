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
          document.getElementById("mainContent").innerHTML = html;
          Roadsides.Router.highlightActive();
        });
        dbRequest.open("GET", Roadsides.API_LOC + "roadsides?url=/" + pageName);
        dbRequest.send();
      },
      //static page
      function(pageName, fail) {
        var request = new XMLHttpRequest();
        request.addEventListener("load", function(data) {
          if (data.target.status === 404) {
            return fail();
          }
          var html = data.target.responseText;
          document.getElementById("mainContent").innerHTML = html;
          Roadsides.Router.highlightActive();
        });
        request.open("GET", "templates/" + pageName + ".temp");
        request.send();
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
      var currRouteFunc = 0;
      //go through routing table
      var fail = function () {};
      fail = function() {
        currRouteFunc += 1;
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
