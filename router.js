var Roadsides = window.Roadsides || {};
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
        var html = data.target.responseText;
        document.getElementById("mainContent").innerHTML = html;
        Roadsides.Router.highlightActive();
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
  if (!window.onpopstate) {
    var allLinks = document.getElementsByTagName("a");
    for (i = 0; i < allLinks.length; i++) {
      allLinks[i].addEventListener("click", Roadsides.Router.update);
    } 
  } else {
    window.onpopstate = Roadsides.Router.update;
  }
  Roadsides.Router.update();
};