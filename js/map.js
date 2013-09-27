
var infowindow = new google.maps.InfoWindow();

function initialize() {

var styles = [
  {
    "stylers": [
      { "visibility": "simplified" },
      { "hue": "#5fafc1" },
      { "gamma": 0.3 }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "color": "#333333" },
      { "visibility": "simplified" }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels",
    "stylers": [
      { "visibility": "on" }
    ]
  }
];

  // Enable the visual refresh
  google.maps.visualRefresh = true;

  var mapOptions = {
    center: new google.maps.LatLng(50, 15),
    disableDefaultUI: true,
    zoom: 4,
    // mapTypeId: google.maps.MapTypeId.ROADMAP
    styles: styles
  };
  
  var map = new google.maps.Map(document.getElementById("map-canvas"),mapOptions);

  // create the Bounds object
  var bounds = new google.maps.LatLngBounds();
  
    for (i in orgMap){

      var filter = isInArray(networkChoice, orgMap[i].networks);

      if(!networkChoice || filter){


        var center  = orgMap[i].center;
        var title   = orgMap[i].name;
        var body    = orgMap[i].content;

        createMarker(center, title, body);
      
        // extend the bounds to include this marker's position
        bounds.extend(center);
        // resize the map
        map.fitBounds(bounds);

      } 
 
    }

  function createMarker(center,title,body) {

    // Marker icon defaults
    var flag = {
      url:         'img/dr-map-marker.png'     
    };

       
    var marker = new google.maps.Marker({
      position: center,
      title: title,
      map: map,
      icon: flag,
      // animation: google.maps.Animation.DROP
    });

    google.maps.event.addListener(marker, 'click', function () {
      infowindow.setContent(body);
      infowindow.open(map, marker);
    });

  }



}

google.maps.event.addDomListener(window, 'load', initialize);