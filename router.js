var Roadsides = window.Roadsides || {};
Roadsides.API_LOC = "http://localhost:8081/"; //set to location of API server
window.onload = function() {
  Roadsides.ROADSIDE_TEMPLATE = Handlebars.compile(document.getElementById("roadside-template").innerHTML);
  Roadsides.Router = {
    update: function() {
      setTimeout(function () {
        if (location.hash === "") {
          location.hash = "#/main";
        }
        Roadsides.Router.loadPage(location.hash);
      }, 0);
    },
    loadPage: function(pageName) {
      pageName = pageName.replace(/[^a-zA-Z0-9]/g, "");
      var request = new XMLHttpRequest();
      request.addEventListener("load", function(data) {
        if (data.target.status === 404) {
          console.log("404");
          //either the page doesn't exist, or we need to query the DB for the roadside
          var dbRequest = new XMLHttpRequest();
          dbRequest.addEventListener("load", function (dbData) {
            var roadsideData = JSON.parse(dbData.target.responseText)[0];
            console.log(roadsideData);
            var html = Roadsides.ROADSIDE_TEMPLATE(roadsideData);
            document.getElementById("mainContent").innerHTML = html;
            Roadsides.Router.highlightActive();
          });
          dbRequest.open("GET", Roadsides.API_LOC + "roadsides?url=/" + pageName);
          dbRequest.send();
          return;
        } else if (data.target.status === 200) {
          console.log("200");
          var html = data.target.responseText;
          document.getElementById("mainContent").innerHTML = html;
          Roadsides.Router.highlightActive();
        } else if (data.target.status === 500 || data.target.status === 501 || data.target.status === 503) {
          document.getElementById("mainContent").innerHTML = "Sorry - we're having problems right now. Please try again later.";
          throw "server error";
        } else {
          //???
          document.getElementById("mainContent").innerHTML = "Sorry - we're having problems right now. Please try again later.";
          throw "invalid status code - " + data.target.status;
        }
      });
      request.open("GET", "templates/" + pageName + ".temp");
      request.send();
    },
    highlightActive: function () {
      var activeEles = document.getElementsByClassName("active");
      for (i = 0; i < activeEles.length; i++) {
        activeEles[i].className = "";
      }
      try {
        document.getElementById(location.hash.replace(/[^a-zA-Z ]/g, "")).className += "active";
      } catch (e) {}

    }
  };
  Roadsides.Router.highlightActive();
  if (window.onpopstate !== null) {
    var allLinks = document.getElementsByTagName("a");
    for (var i = 0; i < allLinks.length; i++) {
      allLinks[i].addEventListener("click", Roadsides.Router.update);
    }
  } else {
    window.onpopstate = Roadsides.Router.update;
  }
  Roadsides.Router.update();
};
