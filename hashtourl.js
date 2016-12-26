addEventListener("hashchange", function () {
  location.pathname = "/prerendered" + 
    location.hash.substr(1, location.hash.length);
});