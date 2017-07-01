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


var disqus_url = "http://roadsideattractions.ca/roadside" + location.pathname.split("/roadside")[1];

var disqus_config = function () {
this.page.url = "http://roadsideattractions.ca/roadside" + location.pathname.split("/roadside")[1];  // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = location.pathname.split("/roadside")[1]; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
};

(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = '//roadsides.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();

if ((location.pathname === "/roadside/submit") || (location.hash.indexOf("submit") > -1)) {
  setTimeout(function () {document.getElementById('a').innerHTML = '<iframe src="//submit.roadsideattractions.ca/" style="height: 55em;width: 72%;border: none;"></iframe>';}, 0);
}