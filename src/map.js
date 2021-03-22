import mapboxgl from '!mapbox-gl';

var defaultType = 'topo';
var defaultLat = 54.76875;
var defaultLng = 25.33762;
var defaultZoom = 12;
var cookieName = 'Data';
var hashData;
var map;

var mapTypes = mapTypes || {
  topo: 't',
  hybrid: 'h'
};
var mapData = {
  type: defaultType,
  zoom: defaultZoom,
  lat: defaultLat,
  lng: defaultLng,
  bearing: 0,
  pitch: 0
};
  
function getMapDataFromHashUrl() {
  var hash = window.location.hash;
  if (hash.length > 0) {
    hash = hash.replace('#', '');

    var mapQueries = hash.split('/');
  
    // Add support old hash format: #8/55.23777/23.871
    if (mapQueries.length === 3) {
      return {
        zoom: parseFloat(mapQueries[0]),
        lat: parseFloat(mapQueries[1]),
        lng: parseFloat(mapQueries[2])
      }
    }
  
    if (mapQueries.length < 6) {
      return null;
    }
  
    var type = defaultType;
    for (var key in mapTypes) {
      if (mapTypes[key] === mapQueries[0]) {
        type = key;
        break;
      }
    }
  
    return {
      type: type,
      zoom: parseFloat(mapQueries[1]),
      lat: parseFloat(mapQueries[2]),
      lng: parseFloat(mapQueries[3]),
      bearing: parseInt(mapQueries[4]),
      pitch: parseInt(mapQueries[5]),
      objectId: mapQueries[6] || null
    };
  }
  return null;
} // getMapDataFromHashUrl

function storeCookie(name, value) {
  var date = new Date();
  date.setDate(date.getDate() + 365);
  var expires = "expires=" + date.toUTCString();
  document.cookie = name + '=' + JSON.stringify(value) +
    ';path=/;' + expires +
    ';SameSite=Lax';
} // storeCookie
  
function readCookie(name) {
  var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
  if (result) {
    return JSON.parse(result[1]);
  }
    return null;
} // readCookie

function switchTo(m) {
  map.setStyle(m + '.json');
    mapData.type = m;
    mapData.id = null;
    changeHashUrl(mapData);
}

function setMapData() {
  mapData.zoom = Number(map.getZoom().toFixed(2));
  mapData.lat = Number(map.getCenter().lat.toFixed(5));
  mapData.lng = Number(map.getCenter().lng.toFixed(5));
  mapData.bearing = parseInt(map.getBearing());
  mapData.pitch = parseInt(map.getPitch());
} // setMapData

function getUrlHash(state) {
  var hash = [];
  for (var key in state) {
    var value = state[key];
    if (key === 'type') {
      value = mapTypes[state.type]
    }
    hash.push(value);
  }
  return hash.join('/');
} // getUrlHash
  
function changeHashUrl() {
  var hash = getUrlHash(mapData);
  window.location.hash = '#' + hash;
  storeCookie(cookieName, mapData);
} // changeHashUrl
  
function initMap(callback) {
  var cookieData;
  if (hashData = getMapDataFromHashUrl()) {
    mapData = Object.assign(mapData, hashData);
  }

  if (!hashData && (cookieData = readCookie(cookieName))) {
    mapData = Object.assign(mapData, hashData);
  }

  changeHashUrl();

  map = new mapboxgl.Map({
    container: 'map',
    style: mapData.type + '.json',
    zoom: mapData.zoom,
    minZoom: 7,
    maxZoom: 18,
    center: [mapData.lng, mapData.lat],
    hash: false,
    maxBounds: [20.700, 53.700, 27.050, 56.650],
    bearing: mapData.bearing,
    pitch: mapData.pitch,
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
      setMapData();
      changeHashUrl();
    })
    .on('load', function() {
      callback();
    })
  ;
} // initMap
export { initMap, switchTo, map };