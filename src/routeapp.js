import mapboxgl from '!mapbox-gl';
import './routestyles.css';
import { initMap, switchTo, map } from './map.js';
import { migrateOldData, recreateMarkers } from './markers.js';
import packagej from '../package.json';
const { version } = packagej;

i_version.innerHTML = version;
i_base_img.onclick = switchBase;
var orto = false;
var uuid;
var marsrutas = [];
var offroad = [];
var marsrutasGeojson;

initMap(runApp);

function runApp() {
  const urlParams = new URLSearchParams(window.location.search);
  uuid = urlParams.get('uuid');
  if (uuid) {
    loadRoute();
  }
};

function switchBase() {
  if (orto) {
    switchTo('topo');
    i_base_img.src = 'map_orto.png';
  } else {
    switchTo('hybrid');
    i_base_img.src = 'map_topo.png';
  }
  orto = !orto;
  if (marsrutasGeojson) {
    var dummy = setTimeout(addGeoJson, 100);
  }
} // switchBase

function addGeoJson() {
  var mapLayer = map.getLayer('route');
  if (typeof mapLayer !== 'undefined') {
    map.removeLayer('route').removeSource('route');
  }
  map.addLayer({
    "id": "route",
    "type": "line",
    "source": {
      "type": "geojson",
      "data": marsrutasGeojson
    }, // source
    "filter": [
      "all",
      ["!=", "transport", "offroad"]
    ],
    "layout": {
      "line-join": "round",
      "line-cap": "round"
    }, // layout
    "paint": {
      "line-color": [
        "match",
        ["get", "transport"],
        "foot",
        "rgba(0, 0, 255, 0.4)",
        "bike",
        "rgba(0, 255, 255, 0.4)",
        "car",
        "rgba(255, 0, 255, 0.4)",
        "offroad",
        "rgba(68, 68, 221, 0.4)",
        "rgba(255, 0, 0, 0.4)"
      ],
      /*"rgba(0, 0, 255, 0.4)",*/
      "line-width": 6
    } // paint
  }, orto ? "label-road" : "topo_sym"); // addLayer

  var mapLayer = map.getLayer('route-d');
  if (typeof mapLayer !== 'undefined') {
    map.removeLayer('route-d').removeSource('route-d');
  }
  map.addLayer({
    "id": "route-d",
    "type": "line",
    "source": {
      "type": "geojson",
      "data": marsrutasGeojson
    }, // source
    "filter": [
      "all",
      ["==", "transport", "offroad"]
    ],
    "layout": {
      "line-join": "round",
      "line-cap": "butt"
    }, // layout
    "paint": {
      "line-color": [
        "match",
        ["get", "transport"],
        "foot",
        "rgba(0, 0, 255, 0.4)",
        "bike",
        "rgba(0, 255, 255, 0.4)",
        "car",
        "rgba(255, 0, 255, 0.4)",
        "offroad",
        "rgba(68, 68, 221, 0.4)",
        "rgba(255, 0, 0, 0.4)"
      ],
      "line-dasharray": [1, 1],
      "line-width": 6
    } // paint
  }, orto ? "label-road" : "topo_sym"); // addLayer
  var mapLayer = map.getLayer('route-distance');
  if (typeof mapLayer !== 'undefined') {
    map.removeLayer('route-distance').removeSource('route-distance');
  }
  map.addLayer({
    "id": "route-distance",
    "type": "symbol",
    "source": {
      "type": "geojson",
      "data": marsrutasGeojson
    }, // source
    "layout": {
      "text-field": "{distance}",
      "symbol-placement": "line",
      "text-anchor": "bottom",
      "text-size": { "stops": [[10, 8], [20, 16]] },
      "text-font": ["Roboto Condensed Italic"]
    },
    "paint": {
      "text-halo-width": 1.5,
      "text-halo-color": "rgba(255, 255, 255, 1)"
    }
  }, orto ? "label-road" : "topo_sym"); // addLayer
} // addGeoJson

function loadRoute() {
fetch('php/m.php?uuid=' + uuid)
  .then(response => response.json())
  .then(data => {
    marsrutasGeojson = JSON.parse(data.marsrutas);
    marsrutas = JSON.parse(data.taskai);
    if (data.offroad) {
      offroad = JSON.parse(data.offroad);
      offroad.forEach(el => {
        if (el) {
          marsrutasGeojson.features.push(el);
        }
      });
    } else {
      offroad = [];
    }
    migrateOldData(marsrutas);
    for (var i=0; i<marsrutas.length; i++) {
      marsrutas[i].tipas = 2; // so that markers are unmovable
    }
    recreateMarkers(map, marsrutas);

    // zoom to gpx extent
    var coordinates = [];
    marsrutasGeojson.features.forEach(el => {
      coordinates = coordinates.concat(el.geometry.coordinates);
    });
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, { padding: 50 });

    addGeoJson();
  });
} // loadRoute
