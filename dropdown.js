addEventListener("load", function() {
  var Roadsides = window.Roadsides || {};
  var dropdownlinks = document.getElementsByClassName("dropdownlinks");
  for (i = 0; i < dropdownlinks.length; i++) {
    dropdownlinks[i].selectedIndex = 0;
    dropdownlinks[i].addEventListener("change", function(e) {
      var selected = e.target.value;
      if ((location.hash.replace("/", "") === selected) || (selected === "none")) {
        return;
      }
      location.hash = "/" + selected;
      if (Roadsides.Router) Roadsides.Router.update();
      e.target.selectedIndex = 0;
    });
  }
  if (Roadsides.Router || window.PRERENDER) { Roadsides.Router.update(); } else { setTimeout(() => $(".fotorama").fotorama(), 100); }
});
