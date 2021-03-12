import mapboxgl from '!mapbox-gl';
import './routestyles.css';
import {version_r} from '../package.json';
import { initMap, switchTo, map } from './map.js';
import { getIcon } from './markers.js';

i_version.innerHTML = version_r;
i_base_img.onclick = switchBase;
var orto = false;
var uuid;
var marsrutas = [];
var offroad = [];
var zymekliai = [];
var marsrutasGeojson;

initMap(runApp);

function runApp() {
  const urlParams = new URLSearchParams(window.location.search);
  uuid = urlParams.get('uuid');
  if (uuid) {
    ikelti();
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

function mZymeklis(p_pavadinimas, p_idx, p_lon, p_lat) {
  var zzz = document.createElement('div');
  var ttt = document.createElement('div');
  ttt.innerHTML = getIcon(marsrutas[p_idx].icon, marsrutas[p_idx].colour);
  ttt.className = 'marker';
  ttt.classList.add('taskuZymeklis');
  zzz.appendChild(ttt);
  //if (marsrutas[p_idx].tipas == 1) {
  var z_tekstas = document.createElement('div');
  z_tekstas.className = 'taskuEtiketes';
  z_tekstas.innerHTML = p_pavadinimas;
  zzz.appendChild(z_tekstas);
  //}
  var zymeklis = new mapboxgl.Marker({element: zzz, offset: [0, -5]})
    .setLngLat([p_lon, p_lat])
    .addTo(map);
  return zymeklis;
} // mZymeklis

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

function ikelti() {
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
    //i_marsruto_pavadinimas.value = data.pavadinimas;
    marsrutas.forEach((el, idx) => {
      if (!el.icon) {
        marsrutas[idx].icon = 0;
      }
      if (!el.colour) {
        marsrutas[idx].colour = '#55ff55';
      }
      var zymeklis = mZymeklis(el.pavadinimas, idx, el.lon, el.lat);
      zymekliai.push(zymeklis);
    });

    // zoom to gpx extent
    var coordinates = [];
    marsrutasGeojson.features.forEach(el => {
      coordinates = coordinates.concat(el.geometry.coordinates);
    });
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, { padding: 20 });

    addGeoJson();
  });
}
