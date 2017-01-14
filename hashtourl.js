var fixHash = function () {
  if ((location.hash === "#main") || (location.hash === "#/main")) {
    location.pathname = "http://roadsideattractions.ca/";
  }
  location.pathname = "/prerendered" + 
    location.hash.substr(1, location.hash.length).toLowerCase();
};

addEventListener("hashchange", fixHash);
addEventListener("load", fixHash);


var disqus_url = "http://roadsideattractions.ca/prerendered" + location.pathname.split("/prerendered")[1];

var disqus_config = function () {
this.page.url = "http://roadsideattractions.ca/prerendered" + location.pathname.split("/prerendered")[1];  // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = location.pathname.split("/prerendered")[1]; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};

(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = '//roadsides.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();