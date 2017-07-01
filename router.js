var Roadsides = window.Roadsides || {};
Roadsides.API_LOC = "https://new-roadside-stuff-smittyvb.c9users.io:8081/"; //set to location of API server
/*
Each item in the routing table is evaluated, in order from top to bottom.
If one succeeds, then the program stop going through the table.
Each function is passed a callback function. If a function does not apply for the page, or otherwise fails, call fail(), and return.
Each function is also passed the name of the current page, in order to get the correct content.
These functions are responsible for setting the HTML code.
*/

addEventListener("load", function() {
  Roadsides.ROADSIDE_TEMPLATE = Handlebars.compile(document.getElementById("roadside-template").innerHTML);
  Roadsides.Router = {
    provinceUrlMapping: {
      "alberta": "Alberta",
      "bc": "British Columbia",
      "manitoba": "Manitoba",
      "newbrunswick": "New Brunswick",
      "nfld": "Newfoundland and Labrador",
      "nwt": "Northwest Territories",
      "novascotia": "Nova Scotia",
      "nunavut": "Nunavut",
      "ontario": "Ontario",
      "pei": "Prince Edward Island",
      "quebec": "Quebec",
      "sask": "Saskatchewan",
      "yukon": "Yukon"
    },
    htmlFromRoadsideArray: function (array, showInitDate, limit) {
      if (limit === undefined) {
        limit = Infinity;
      }
      var html = "<table class ='roadsideList'>";
      array.forEach(function (roadside, index) {
        if (index >= limit) {
          return;
        }
        html += '<tr>';
        html += '<td class="listImage"><a href="#'  + roadside.url + '"><img src="//smittyvb.github.io/roadsides' + roadside.url + '.jpg" height="100" /></a></td>';
        //html += '<td>&nbsp;&nbsp;&nbsp;</td>'
        html += '<td class="listTitle"><a href="#'  + roadside.url + '"><span style="font-weight: 900;">' + roadside.name + '</span> <br /> ' + roadside.city + ', ' + roadside.province + '</a>' + (showInitDate === true ? "<br />Date Added To Site: " + roadside.initDate.split(".")[0] : "") + '</td>';
        html += '</tr>';
      });
      html += "</table>";
      return html;
    },
    dbQuery: function (query, title, whatsNew, limit) {
      var request = new XMLHttpRequest();
      request.onload = function (data) {
        var dbJson = JSON.parse(data.target.responseText);
        if (whatsNew) {
          dbJson.reverse();
        }
        var html = Roadsides.Router.htmlFromRoadsideArray(dbJson, whatsNew, limit);
        document.getElementById("mainContent").innerHTML = "<div class='loaded'></div><h1>" + title + "</h1>" + html;
      };
      request.open("GET", Roadsides.API_LOC + "roadsides?" + query);
      request.send();
    },
    routeTable: [
      //roadside page
      function(pageName, fail) {
        var dbRequest = new XMLHttpRequest();
        dbRequest.addEventListener("load", function(dbData) {
          if ((dbData.target.responseText === "[]") || (JSON.parse(dbData.target.responseText) === undefined)) {
            return fail();
          }
          var roadsideData = JSON.parse(dbData.target.responseText)[0];
          if (roadsideData.initDate) {
            roadsideData.initDate = roadsideData.initDate.split(".")[0];
          }
          roadsideData.imgUrls = [
            {imgUrl: "//smittyvb.github.io/roadsides" + roadsideData.url + ".jpg"}
          ];
          var extraPics = roadsideData.photos - 1;
          var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
          for (var i = 0; i < extraPics; i++) {
            roadsideData.imgUrls.unshift({imgUrl: "//smittyvb.github.io/roadsides/lcra" + roadsideData.line + alphabet[i] + ".jpg"});
          }
          if (extraPics === 0) {
            roadsideData.showGallery = false;
          } else {
            roadsideData.showGallery = true;
          }
          if (roadsideData.gps === "na") {
            roadsideData.noGps = true;
            roadsideData.gps = "";
          } else {
            roadsideData.noGps = false;
          }
          console.log(roadsideData);
          var html = Roadsides.ROADSIDE_TEMPLATE(roadsideData);

          //social media page tags
          document.getElementsByTagName("head")[0].innerHTML += "\n<!-- Social Tags -->\n<meta name=\"twitter:title\" content=\"" + roadsideData.name + "\">\n<meta name=\"twitter:image:alt\" content=\"" + roadsideData.name + "\">\n<meta property=\"og:title\" content=\"" + roadsideData.name + "\">\n<meta name=\"twitter:url\" content=\"" + "http://roadsideattractions.ca" + roadsideData.url + "\">\n<meta property=\"og:url\" content=\"" + "http://roadsideattractions.ca" + roadsideData.url + "\">\n<meta name=\"twitter:image:src\" content=\"" + ("//smittyvb.github.io/roadsides" + roadsideData.url + ".jpg") + "\">\n<meta property=\"og:image\" content=\"" + ("//smittyvb.github.io/roadsides" + roadsideData.url + ".jpg") + "\">\n<meta name=\"twitter:description\" content=\"Large Canadian Roadside Attractions\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n<meta name=\"twitter:site\" content=\"@Roadside_Canada\">\n<meta name=\"twitter:creator\" content=\"@Roadside_Canada\">\n<meta name=\"twitter:domain\" content=\"roadsideattractions.ca\">\n<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:site_name\" content=\"Large Canadian Roadside Attractions\">\n<meta property=\"og:locale\" content=\"en_US\">\n          ";
          document.getElementById("mainContent").className = "roadside text-center";
          document.getElementById("mainContent").innerHTML = html;
          document.getElementById("mainContent").innerHTML += "<div class='loaded'></div>";
          
          document.title = roadsideData.name;
          setTimeout(function () {
            $(".fotorama").fotorama();
            
/**
*  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
*  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables*/

var disqus_url = "roadsideattractions.ca/prerendered" + roadsideData.url;

var disqus_config = function () {
this.page.url = "roadsideattractions.ca/prerendered" + roadsideData.url;  // Replace PAGE_URL with your page's canonical URL variable
this.page.identifier = roadsideData.url; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
this.page.title = roadsideData.name;
};

(function() { // DON'T EDIT BELOW THIS LINE
var d = document, s = d.createElement('script');
s.src = '//roadsides.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
          }, 100);
          Roadsides.Router.highlightActive();
        });
        dbRequest.open("GET", Roadsides.API_LOC + "roadsides?url=/" + pageName);
        dbRequest.send();
      },
      //province page
      function(pageName, fail) {
        //make sure we have a valid province url
        if (Roadsides.Router.provinceUrlMapping[pageName] === undefined) {
          return fail();
        }
        Roadsides.Router.dbQuery("province=" + Roadsides.Router.provinceUrlMapping[pageName] + "&_sort=city&archive=false",
          Roadsides.Router.provinceUrlMapping[pageName]);
      },
      //alphabetical page
      function (pageName, fail) {
        if (pageName.length !== 1) {
          return fail();
        }
        Roadsides.Router.dbQuery("sortName_like=^" + pageName + "&_sort=sortName&archive=false", 
        "Alphabetical - " + pageName.toUpperCase());
      },
      function (pageName, fail) {
        if (pageName !== "alphabet") {
          return fail();
        }
        Roadsides.Router.dbQuery("_sort=sortName&archive=false", "All Roadside Attractions");
      },
      function (pageName, fail) {
        if (pageName !== "archive") {
          return fail();
        }
        Roadsides.Router.dbQuery("_sort=sortName&archive=true", "Archive");
      },
      function(pageName, fail) {
        if (pageName !== "whatsnew") {
          return fail();
        }
        Roadsides.Router.dbQuery("initDate_like=^[0-9]", 
          "Most Recently Added Roadside Attractions",
          true, 20);
      },
      //static page
      function(pageName, fail) {
        var request = new XMLHttpRequest();
        request.addEventListener("load", function(data) {
          if (data.target.status === 404) {
            return fail();
          }
          var html = data.target.responseText;
          document.getElementById("mainContent").innerHTML = html + "<div class='loaded'></div>";
          document.getElementById("mainContent").className = "static";
          Roadsides.Router.highlightActive();
        });
        request.open("GET", "templates/" + pageName + ".temp");
        request.send();
      },
      //404
      function(pageName,fail) {
        document.getElementById("mainContent").innerHTML = "The page you were looking for does not exist at this time.";
      }
    ],
    update: function() {
      setTimeout(function() {
        if (location.hash === "") {
          location.hash = "#/main";
        }
        Roadsides.Router.loadPage(location.hash);
      }, 0);
    },
    loadPage: function(pageName) {
      document.getElementById("mainContent").class = "text-center";
      pageName = pageName.replace(/[^a-zA-Z0-9]/g, "");
      doneFuncCalled = false;
      var currRouteFunc = 0;
      //go through routing table
      var fail = function () {};
      fail = function() {
        currRouteFunc += 1;
        startFuncNum = currRouteFunc;
        Roadsides.Router.routeTable[currRouteFunc](pageName, fail);
      };
      Roadsides.Router.routeTable[0](pageName, fail);
    },
    highlightActive: function() {
      var activeEles = document.getElementsByClassName("active");
      for (i = 0; i < activeEles.length; i++) {
        activeEles[i].className = "";
      }
      try {
        document.getElementById(location.hash.replace(/[^a-zA-Z ]/g, "")).className += "active";
      }
      catch (e) {}

    },
  };
  Roadsides.Router.highlightActive();
  if (window.onpopstate !== null) {
    var allLinks = document.getElementsByTagName("a");
    for (var i = 0; i < allLinks.length; i++) {
      allLinks[i].addEventListener("click", Roadsides.Router.update);
    }
  }
  else {
    window.onpopstate = Roadsides.Router.update;
  }
  Roadsides.Router.update();
});
addEventListener("load", function() {
  Roadsides.Router.update();
});
