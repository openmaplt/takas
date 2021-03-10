import mapboxgl from '!mapbox-gl';
import './routestyles.css';
import {version_r} from '../package.json';

i_version.innerHTML = version_r;
i_base_img.onclick = switchBase;
var geojson;
var defaultType = 'topo';
var mapTypes = {
  topo: 't',
  topo_hybrid: 'h'
};
var orto = false;
var marker;
var uuid;
var marsrutas = [];
var offroad = [];
var zymekliai = [];
var marsrutasGeojson;
var markers = [];
markers[0] = '<svg style="width: 100px" display="block" height="41px" width="27px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="#colour"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"><circle fill="#000000" opacity="0.25" cx="5.5" cy="5.5" r="5.4999962"></circle><circle fill="#FFFFFF" cx="5.5" cy="5.5" r="5.4999962"></circle></g></g></svg>';
markers[1] = '<svg style="width: 100px" display="block" height="41px" width="27px" viewBox="0 0 27 41"><g fill-rule="nonzero"><g transform="translate(3.0, 29.0)" fill="#000000"><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="10.5" ry="5.25002273"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="9.5" ry="4.77275007"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="8.5" ry="4.29549936"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="7.5" ry="3.81822308"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="6.5" ry="3.34094679"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="5.5" ry="2.86367051"></ellipse><ellipse opacity="0.04" cx="10.5" cy="5.80029008" rx="4.5" ry="2.38636864"></ellipse></g><g fill="#colour"><path d="M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"></path></g><g opacity="0.25" fill="#000000"><path d="M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"></path></g><g transform="translate(6.0, 7.0)" fill="#FFFFFF"></g><g transform="translate(8.0, 8.0)"></circle></g></g></svg>';


map = new mapboxgl.Map({
    container: 'map',
    /*style: mapData.type + '.json',*/
    style: 'topo.json',
    zoom: 12,
    minZoom: 7,
    maxZoom: 18,
    center: /*pCenter ||*/ [25.33762, 54.76875],
    hash: false,
    maxBounds: [20.700, 53.700, 27.050, 56.650],
    /*bearing: mapData.bearing,
    pitch: mapData.pitch,*/
    attributionControl: false
  })
    .addControl(new mapboxgl.NavigationControl(), 'top-left')
    .addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }), 'top-left')
    .addControl(new mapboxgl.AttributionControl(), 'bottom-left')
    .on('moveend', function () {
      /*setMapData();*/
      /*changeHashUrl();*/
    })
    .on('load', function() {
      runApp();
    })
  ;

function getIcon(pIconId, pColour) {
return markers[pIconId].replaceAll('#colour', pColour);
} // getIcon
function runApp() {
setTimeout(function() {
  const urlParams = new URLSearchParams(window.location.search);
  uuid = urlParams.get('uuid');
  if (uuid) {
    ikelti();
  }
}, 100);
};
function switchTo(m) {
map.setStyle(m + '.json');
mapData.type = m;
mapData.id = null;
changeHashUrl(mapData);
}
function switchBase() {
if (orto) {
  switchTo('topo');
  i_base_img.src = 'map_orto.png';
} else {
  switchTo('hybrid');
  i_base_img.src = 'map_topo.png';
}
orto = !orto;
if (geojson) {
  var dummy = setTimeout(addGeoJson, 100);
}
}
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
}
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
