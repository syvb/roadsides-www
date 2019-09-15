var fixHash = function () {
  if ((location.hash === "#main") || (location.hash === "#/main")) {
    location.pathname = "http://roadsideattractions.ca/";
  }
  if (location.hash !== "") {
    location.pathname = "/roadside" + 
    location.hash.substr(1, location.hash.length).toLowerCase();
  }

};

addEventListener("hashchange", fixHash);
addEventListener("load", fixHash);

/*if ((location.pathname === "/roadside/submit") || (location.hash.indexOf("submit") > -1)) {
  setTimeout(function () {document.getElementById('a').innerHTML = '<iframe src="//submit.roadsideattractions.ca/" style="height: 55em;width: 72%;border: none;"></iframe>';}, 0);
}*/
