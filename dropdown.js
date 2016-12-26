addEventListener("load", function() {
  var Roadsides = window.Roadsides || {};
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
});
