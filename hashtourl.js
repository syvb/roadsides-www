addEventListener("hashchange", function () {
  if ((location.hash === "#main") || (location.hash === "#/main")) {
    location.pathname = "/prerendered/";
  }
  location.pathname = "/prerendered" + 
    location.hash.substr(1, location.hash.length).toLowerCase();
});