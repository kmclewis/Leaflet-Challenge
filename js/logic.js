// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var link = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"



// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) +"<br>"+"Earthquake magnitude: " +"<b>"+feature.properties.mag+"</b>"+"</p>" );
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer:function(feature,latlng) {
      return L.circleMarker(latlng, {
        fillOpacity:1,
        opacity:1,
        weight: .5,
        stroke: true,
        color:"black",
        fillColor:getColor(feature.properties.mag),
        radius:feature.properties.mag*4});}})



  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}
//Create function to add color based on earthquake magnitude
function getColor(d) {
return   d > 5  ? '#f06b6b' :
         d > 4  ? '#f0a76b' :
         d > 3  ? '#f3ba4d' :
         d > 2  ? '#f3db4d' :
         d > 1  ? '#e1f34d' :
                  '#b7f34d';
}

// Creating the faultlines layergroup
var faultlines = new L.LayerGroup();
d3.json(link, function(data) {
 // Creating a geoJSON layer with the retrieved data
 L.geoJson(data, {
   // Styling the faultlines
   style: function(feature) {
     return {
       weight:2,
       color: "orange",
     };
   },
 }).addTo(faultlines);
});

function createMap(earthquakes) {

  // Define streetmap, lightmap and satellite layers

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY

  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Street Map": streetmap,
    "Satellite Map" : satellite    
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Faultlines: faultlines
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      39.89, -109.23
    ],
    zoom: 5,
    layers: [lightmap, earthquakes, faultlines]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map


  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap)

//Adding info to the legend
  var info = L.control({
    position: "bottomright"
  });
  info.onAdd = function() {
    var div = L.DomUtil.create("div", "legend"),
    grades =[0,1,2,3,4,5];    
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };
  // Add the info legend to the map
  info.addTo(myMap);
}

