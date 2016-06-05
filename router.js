var Roadsides = window.Roadsides || {};
Roadsides.API_LOC = ""; //set to location of API server
window.onload = function() {
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
      pageName = pageName.replace(/[^a-zA-Z ]/g, "");
      var request = new XMLHttpRequest();
      request.addEventListener("load", function(data) {
        if (data.target.status === 404) {
          return;
        } else if (data.target.status === 200) {
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
    for (i = 0; i < allLinks.length; i++) {
      allLinks[i].addEventListener("click", Roadsides.Router.update);
    }
  } else {
    window.onpopstate = Roadsides.Router.update;
  }
  Roadsides.Router.update();
};
