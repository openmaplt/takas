import mapboxgl from '!mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { showMessage, hideMessage, showTempMessage }  from './message.js';
import { markers, recreateMarkers, setOnMove, removeAllMarkers, setMarkersMovable, migrateOldData, defaultColour } from './markers.js';
import { map } from './map.js';
import { controlInitial, kuriamMarsruta, setCreatingRoute, setCreatingPoint, phpBase, orto } from './app.js';

const cMsgRouteSaved = 'Maršrutas sėkmingai įrašytas';
const cMsgLoading = 'Skaičiuojamas maršrutas. Palaukite...';
const cMsgPointHasShadows = 'Šis taškas turi šešėlių, iš pradžių juos ištrinkite!';

var marsrutoId; // id of a loaded route
var draw; // object for drawing manual (offroad) routes
var totalDistance; // total route distance
var marsrutas = [];
var offroad = [];
var routeUuid;

i_settings_accept.onclick = actionSettingsAccept;
i_settings_cancel.onclick = actionSettingsCancel;
i_change_route_point_name.onclick = actionChangeRoutePointName;

function setUrl(uuid) {
  routeUuid = uuid;
  i_url.innerHTML = window.location.protocol + '//' +
    window.location.host + window.location.pathname + 'route.html?uuid=' + uuid;
  i_copy_url.style.display = 'inline';
  i_download_geojson.style.display = 'inline';
} // setUrl
  
function loadRoute(e) {
  i_marsrutu_sarasas.style.display = 'none';
  marsrutoId = e.srcElement.getAttribute('id');
  if (marsrutoId > 0) {
    fetch(phpBase + 'route.php?id=' + marsrutoId)
      .then(response => response.json())
      .then(data => {
        marsrutasGeojson = JSON.parse(data.marsrutas);
        marsrutas = JSON.parse(data.taskai);
        if (data.offroad) {
          offroad = JSON.parse(data.offroad);
        } else {
          offroad = [];
        }
        setUrl(data.uuid);
        i_download_geojson.href = phpBase + 'geojson.php?id=' + marsrutoId;
        migrateOldData(marsrutas);
        i_marsruto_pavadinimas.value = data.pavadinimas;
        recreateMarkers(map, marsrutas);
    
        // zoom to gpx extent
        var coordinates = [];
        marsrutasGeojson.features.forEach(el => {
          coordinates = coordinates.concat(el.geometry.coordinates);
        });
        offroad.forEach(el => {
          if (el) {
            coordinates = coordinates.concat(el.geometry.coordinates);
          }
        });
        if (coordinates.length > 0) {
          // only try to calculate route extent if there are any coordinates
          var bounds = coordinates.reduce(function(bounds, coord) {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          map.fitBounds(bounds, { padding: 50 });
        }
        i_irasyti_marsruta.style.display = 'inline';
    
        updateRoute();
        routeUnchanged();
      });
  }
} // loadRoute

function saveRoute() {
  /* TODO: This has to be done only when we finish CHANGING some offroad */
  draw.getAll().features.forEach(el => {
    for (var i=0; i<el.geometry.coordinates.length; i++) {
      // round coordinate values to 5 digits after comma
      // as there is no point to have more precision
      el.geometry.coordinates[i][0] = round5(el.geometry.coordinates[i][0]);
      el.geometry.coordinates[i][1] = round5(el.geometry.coordinates[i][1]);
    }
    offroad[el.id] = el;
  });
  const postData = new FormData();
  postData.append('pavadinimas', i_marsruto_pavadinimas.value);
  postData.append('marsrutas', JSON.stringify(marsrutasGeojson));
  for (var i=0; i<marsrutas.length; i++) {
    marsrutas[i].lat = round5(marsrutas[i].lat);
    marsrutas[i].lon = round5(marsrutas[i].lon);
  }
  postData.append('taskai', JSON.stringify(marsrutas));
  postData.append('offroad', JSON.stringify(offroad));
  postData.append('id', marsrutoId);
  fetch(phpBase + 'save_route.php', { method: 'POST', body: postData })
    .then(response => response.json())
    .then(data => {
      if (marsrutoId == 0) {
        setUrl(data.uuid);
      }
      marsrutoId = data.id;
      showTempMessage(cMsgRouteSaved);
      routeUnchanged();
    });
} // saveRoute

function routeChanged() {
  i_url.innerHTML = '<b>Yra neįrašytų pakeitimų!</b>'
  i_copy_url.style.display = 'none';
  i_download_geojson.style.display = 'none';
} // routeChanged

function routeUnchanged() {
  setUrl(routeUuid);
} // routeUnchanged

function addRemoveRoute() {
  createDraw();
  if (!kuriamMarsruta) {
    controlRoute();
    setCreatingRoute(true);
    marsrutoId = 0;
    i_prideti_marsruta.innerHTML = 'Išjungti maršrutą';
    i_prideti_taska.style.display = 'none';
    i_irasyti_marsruta.style.display = 'none';
    i_marsrutas.style.display = 'block';
    i_url.innerHTML = '';
    marsrutas = [];
    offroad = [];
    i_marsruto_pavadinimas.value = '';
  } else {
    controlInitial();
    setCreatingRoute(false);
    map.off('click', pridetiPozicija);
    i_prideti_marsruta.innerHTML = 'Pridėti maršrutą';
    i_prideti_taska.style.display = 'block';
    removeAllMarkers();
    marsrutas = [];
    marsrutasGeojson.features = [];
    addGeoJson();
    draw.deleteAll();
    map.getCanvas().style.cursor = '';
  }
} // addRemoveRoute

function controlRoute() {
  var route = document.createElement('div');
  route.id = 'i_marsrutas';
  route.innerHTML =
    '<p style="margin-top: 1px; margin-bottom: 1px;">Pavadinimas: <input type="text" id="i_marsruto_pavadinimas"></p>'+
    '<p><small><span id="i_url"></small></span> <span class="mygt mygtm" id="i_copy_url">Kopijuoti</span></p>' +
    '<p><a id="i_download_geojson" class="mygt mygtm" href="geojson.php?id=5" download="test.geojson" target="other">Atsisiųsti maršruto geojson <span class="material-icons">download</a></p>'+
    '<div id="i_marsruto_taskai">'+
    '<i>Maršrutas tuščias. Parinkite lankytinas veitas arba spauskite ant žemėlapio, kad sukurtumėte tarpinius taškus</i>'+
    '<p>Arba: <span id="i_ikelti_marsruta" class="mygt">Įkelti maršrutą</span></p>'+
    '</div>'+
    '<div><span id="i_prideti_tarpini_taska" class="mygt">Pridėti tarpinį tašką</span>'+
    '<span id="i_irasyti_marsruta" class="mygt">Įrašyti</span>'+
    '</div>';
  i_control.appendChild(route);
  i_ikelti_marsruta.onclick = marsrutuSarasas;
  i_irasyti_marsruta.onclick = saveRoute;
  i_prideti_tarpini_taska.onclick = pridetiTarpiniTaska;
  i_copy_url.onclick = actionCopyUrl;
  i_copy_url.style.display = 'none';
  i_download_geojson.style.display = 'none';
} // controlRoute()
  
function actionCopyUrl() {
  navigator.clipboard.writeText(i_url.innerHTML);
  showTempMessage('Maršruto nuoroda nukopijuota į iškarpinę');
} // actionCopyUrl

function createDraw() {
  if (typeof draw === 'undefined') {
    draw = new MapboxDraw({
      displayControlsDefault: false,
      clickBuffer: 5,
      styles: [
      {
        "id": "line-inactive",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["==", "active", "false"]],
        "layout": {
          "line-join": "round",
          "line-cap": "butt"
        },
        "paint": {
          "line-color": "#4444dd",
          "line-dasharray": [1, 1],
          "line-width": 6
        }
      },
      {
        "id": "line-active",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
        "layout": {
          "line-cap": "round",
          "line-join": "round"
        },
        "paint": {
          "line-color": "#ff8000",
          "line-width": 6
        }
      },
      {
        "id": "line-vertex",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["==", "active", "false"]],
        "paint": {
          "circle-radius": 7,
          "circle-color": "#000",
        }
      },
      {
        "id": "line-vertex-active",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["==", "active", "true"]],
        "paint": {
          "circle-radius": 7,
          "circle-color": "#ff0",
        }
      },
      {
        "id": "line-midpoint",
        "type": "circle",
        "filter": ["all", ["==", "meta", "midpoint"], ["==", "$type", "Point"]],
        "paint": {
          "circle-radius": 7,
          "circle-color": "#fff",
        }
      },
      {
        "id": "line-inactive-symbol",
        "type": "symbol",
        "filter": ["all", ["==", "$type", "LineString"], ["==", "active", "false"]],
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
      },
      ]
    });
    map.addControl(draw);
    map.on('draw.selectionchange', drawSelectionchange);
  }
} // createDraw

function drawSelectionchange(e) {
  setMarkersMovable(e.features.length == 0);
} // drawSelectionchange

function pridetiTarpiniTaska() {
  map.on('click', pridetiPozicija);
  map.getCanvas().style.cursor = 'crosshair';
  setCreatingPoint(true);
} // pridetiTarpiniTaska

var lastLat=0, lastLon=0;
function pridetiPozicija(e) {
  map.off('click', pridetiPozicija);
  map.getCanvas().style.cursor = '';
  setCreatingPoint(false);
  if ((lastLat != e.lngLat.lat) && (lastLon != e.lngLat.lng)) {
    var poz = { pavadinimas: "Pozicija",
                tipas: 1,
                lat: e.lngLat.lat,
                lon: e.lngLat.lng,
                transportas: 'foot',
                icon: 0,
                colour: defaultColour,
                displayed: true,
                shadow: -1
              }
    marsrutas.push(poz);
    updateRoute();
    recreateMarkers(map, marsrutas);
    i_irasyti_marsruta.style.display = 'inline';
    map.getCanvas().style.cursor = '';
    routeChanged();
  }
} // pridetiPozicija

function pointClicked(e) {
  var poz = { pavadinimas: e.features[0].properties.pavadinimas,
    tipas: 2,
    lat: e.lngLat.lat,
    lon: e.lngLat.lng,
    transportas: 'foot',
    icon: 0,
    colour: defaultColour,
    displayed: true,
    shadow: -1
  }
  marsrutas.push(poz);
  recreateMarkers(map, marsrutas);
  updateRoute();
  lastLat = e.lngLat.lat;
  lastLon = e.lngLat.lng;
  i_irasyti_marsruta.style.display = 'inline';
  routeChanged();
} // pointClicked

function marsrutuSarasas() {
  i_marsrutu_sarasas.innerHTML = '';
  i_marsrutu_sarasas.style.display = 'block';
  fetch(phpBase + 'route_list.php')
    .then(response => response.json())
    .then(data => {
      var elem = document.createElement('div');
      elem.innerHTML = '<b>Parinkite maršrutą</b>';
      i_marsrutu_sarasas.appendChild(elem);
      data.forEach(el => {
        elem = document.createElement('div');
        elem.classList.add('marsrutuSarasoElementas');
        var elem_p = document.createElement('span');
        elem_p.setAttribute('id', el.id);
        elem_p.classList.add('sarasoElementas');
        elem_p.innerHTML = el.pavadinimas;
        elem_p.onclick = loadRoute;
        elem.appendChild(elem_p);
        var elem_t = document.createElement('span');
        elem_t.setAttribute('id', el.id);
        elem_t.setAttribute('name', el.pavadinimas);
        elem_t.classList.add('sarasoElementas');
        elem_t.innerHTML = '[Trinti]';
        elem_t.onclick = arTrintiMarsruta;
        elem.appendChild(elem_t);
        i_marsrutu_sarasas.appendChild(elem);
      });
      elem = document.createElement('div');
      elem.setAttribute('id', 0);
      elem.classList.add('sarasoElementas');
      elem.innerHTML = '<i>Uždaryti</i>';
      elem.onclick = loadRoute;
      i_marsrutu_sarasas.appendChild(elem);
    });
} // marsrutuSarasas

var trintiMarsrutaId;
function arTrintiMarsruta(e) {
  i_marsrutu_sarasas.style.display = 'none';
  trintiMarsrutaId = e.srcElement.getAttribute('id');
  console.log('Ar trinti marsruta: ' + trintiMarsrutaId);
  i_dialogo_tekstas.innerHTML = 'Ar tikrai norite ištrinti maršrutą „' + e.srcElement.getAttribute('name') + '“?';
  i_dialogo_mygtukas1.innerHTML = 'Taip';
  i_dialogo_mygtukas2.innerHTML = 'Ne';
  i_dialogo_mygtukas1.onclick = trintiMarsruta;
  i_dialogo_mygtukas2.onclick = netrintiMarsruto;
  i_dialogas.style.display = 'block';
} // arTrintiMarsruta

function netrintiMarsruto() {
  i_dialogas.style.display = 'none';
} // netrintiMarsruto

function trintiMarsruta() {
  netrintiMarsruto();
  console.log('Trinti marsruta ' + trintiMarsrutaId);
  fetch(phpBase + 'delete_route.php?id=' + trintiMarsrutaId);
} // trintiMarsruta

var issiustaUzklausu;
function updateRoute() {
  var poz = '';
  var count = 0;
  totalDistance = 0;
  showMessage(cMsgLoading);
  i_marsruto_taskai.innerHTML = '';
  var marsrutoLentele = document.createElement('div');
  //marsrutoLentele.classList.add('marsrutoLentele');
  marsrutas.forEach((el, idx) => {
    var marsrutoTaskas = document.createElement('div');
    marsrutoTaskas.classList.add('marsrutoTaskas');
    marsrutoTaskas.setAttribute('draggable', true);
    marsrutoTaskas.setAttribute('targetId', idx);
    marsrutoTaskas.ondragstart = eventDragStart;
    marsrutoTaskas.ondrop = eventDrop;
    marsrutoTaskas.ondragover = eventDragOver;

    var firstLine = document.createElement('div');

    // add button to zoom to point position on the map
    var bGoTo = document.createElement('span');
    bGoTo.innerHTML = 'launch';
    bGoTo.classList.add('material-icons');
    bGoTo.classList.add('mygt');
    bGoTo.classList.add('mygtm');
    bGoTo.setAttribute('idx', idx);
    bGoTo.onclick = actionGoToPoint;
    firstLine.appendChild(bGoTo);

    // add point name
    var name = document.createElement('span');
    if (el.shadow == -1) {
      name.innerHTML = el.pavadinimas;
    } else {
      name.innerHTML = marsrutas[el.shadow].pavadinimas + '*';
    }
    firstLine.appendChild(name);

    if (el.tipas == 1) {
      var myg = document.createElement('span');
      myg.innerHTML = 'border_color';
      myg.classList.add('material-icons');
      myg.classList.add('mygt');
      myg.classList.add('mygtm');
      myg.setAttribute('idx', idx);
      myg.onclick = keistiMarsrutoTaskoPavadinima;
      firstLine.appendChild(myg);
    }
    marsrutoTaskas.appendChild(firstLine);

    var secondLine = document.createElement('div');
    var transportoTipas = document.createElement('span');
    if (idx < marsrutas.length - 1) {
      var mygtukas = document.createElement('span');
      mygtukas.id = 'transportas' + idx + 'pesciomis';
      mygtukas.innerHTML = 'directions_walk';
      mygtukas.classList.add('material-icons');
      mygtukas.classList.add('mygt');
      mygtukas.classList.add('mygtm');
      if (el.transportas != 'foot') {
        mygtukas.classList.add('mygtisj');
      } else {
        mygtukas.classList.add('mygtfoot');
      }
      mygtukas.setAttribute('idx', idx);
      mygtukas.setAttribute('tr', 'foot');
      mygtukas.onclick = marsrutoTransportas;
      transportoTipas.appendChild(mygtukas);

      mygtukas = document.createElement('span');
      mygtukas.id = 'transportas' + idx + 'dviraciu';
      mygtukas.innerHTML = 'directions_bike';
      mygtukas.classList.add('material-icons');
      mygtukas.classList.add('mygt');
      mygtukas.classList.add('mygtm');
      if (el.transportas != 'bike') {
        mygtukas.classList.add('mygtisj');
      } else {
        mygtukas.classList.add('mygtbike');
      }
      mygtukas.setAttribute('idx', idx);
      mygtukas.setAttribute('tr', 'bike');
      mygtukas.onclick = marsrutoTransportas;
      transportoTipas.appendChild(mygtukas);

      mygtukas = document.createElement('span');
      mygtukas.id = 'transportas' + idx + 'masina';
      mygtukas.innerHTML = 'directions_car';
      mygtukas.classList.add('material-icons');
      mygtukas.classList.add('mygt');
      mygtukas.classList.add('mygtm');
      if (el.transportas != 'car') {
        mygtukas.classList.add('mygtisj');
      } else {
        mygtukas.classList.add('mygtcar');
      }
      mygtukas.setAttribute('idx', idx);
      mygtukas.setAttribute('tr', 'car');
      mygtukas.onclick = marsrutoTransportas;
      transportoTipas.appendChild(mygtukas);

      mygtukas = document.createElement('span');
      mygtukas.id = 'transportas' + idx + 'bekele';
      mygtukas.innerHTML = 'edit_road';
      mygtukas.classList.add('material-icons');
      mygtukas.classList.add('mygt');
      mygtukas.classList.add('mygtm');
      if (el.transportas != 'offroad') {
        mygtukas.classList.add('mygtisj');
      } else {
        mygtukas.classList.add('mygtoffroad');
      }
      mygtukas.setAttribute('idx', idx);
      mygtukas.setAttribute('tr', 'offroad');
      mygtukas.onclick = marsrutoTransportas;
      transportoTipas.appendChild(mygtukas);
    }
    secondLine.appendChild(transportoTipas);

    var buttonDelete = document.createElement('span');
    buttonDelete.onclick = actionDeleteRoutePoint;
    buttonDelete.innerHTML = 'delete';
    buttonDelete.classList.add('material-icons');
    buttonDelete.classList.add('mygt');
    buttonDelete.classList.add('mygtm');
    buttonDelete.setAttribute('idx', idx);
    secondLine.appendChild(buttonDelete);

    if (marsrutas[idx].shadow == -1) {
      // only original (non shadow) points can have shadows
      // shadow point markers are never displayed
      var buttonShadow = document.createElement('span');
      buttonShadow.onclick = actionCreateShadow;
      buttonShadow.innerHTML = 'copy_all';
      buttonShadow.classList.add('material-icons');
      buttonShadow.classList.add('mygt');
      buttonShadow.classList.add('mygtm');
      buttonShadow.setAttribute('idx', idx);
      secondLine.appendChild(buttonShadow);

      var buttonDisplay = document.createElement('span');
      buttonDisplay.onclick = actionToggleDisplay;
      buttonDisplay.innerHTML = 'room';
      buttonDisplay.classList.add('material-icons');
      buttonDisplay.classList.add('mygt');
      buttonDisplay.classList.add('mygtm');
      if (!marsrutas[idx].displayed) {
        buttonDisplay.classList.add('mygtisj');
      }
      buttonDisplay.setAttribute('idx', idx);
      secondLine.appendChild(buttonDisplay);
    }

    var buttonSettings = document.createElement('span');
    buttonSettings.onclick = actionPointSettings;
    buttonSettings.innerHTML = 'settings';
    buttonSettings.classList.add('material-icons');
    buttonSettings.classList.add('mygt');
    buttonSettings.classList.add('mygtm');
    buttonSettings.setAttribute('idx', idx);
    secondLine.appendChild(buttonSettings);

    var distance = document.createElement('span');
    distance.id = 'distance' + idx;

    secondLine.appendChild(distance);
    marsrutoTaskas.appendChild(secondLine);

    var dropPosition = document.createElement('div');
    dropPosition.id = 'drop' + idx;
    marsrutoLentele.appendChild(dropPosition);

    marsrutoLentele.appendChild(marsrutoTaskas);
    poz += '&point=' + round5(el.lat) + ',' + round5(el.lon);
    count++;
  });
  var dropPosition = document.createElement('div');
  dropPosition.id = 'drop' + marsrutas.length;
  marsrutoLentele.appendChild(dropPosition);

  var emptySlot = document.createElement('div');
  emptySlot.classList.add('emptySlot');
  emptySlot.setAttribute('targetId', marsrutas.length);
  emptySlot.ondrop = eventDrop;
  emptySlot.ondragover = eventDragOver;
  marsrutoLentele.appendChild(emptySlot);

  i_marsruto_taskai.appendChild(marsrutoLentele);
  marsrutasGeojson.features = [];
  if (count > 1) {
    var atkarpa;
    var atkarpaPoints = [];
    draw.getAll().features.forEach(el => {
      offroad[el.id] = el;
    });
    draw.deleteAll();
    var einamasisTransportas;
    issiustaUzklausu = 0;
    marsrutas.forEach((el, idx) => {
      if (idx == 0) {
        einamasisTransportas = el.transportas;
        atkarpa = '&point=' + round5(el.lat) + ',' + round5(el.lon);
        atkarpaPoints.push([el.lon, el.lat]);
      } else {
        atkarpa += '&point=' + round5(el.lat) + ',' + round5(el.lon);
        atkarpaPoints.push([el.lon, el.lat]);
        skaiciuotiAtkarpa(atkarpa.substring(1), atkarpaPoints, einamasisTransportas, idx);
        atkarpa = '&point=' + round5(el.lat) + ',' + round5(el.lon);
        atkarpaPoints = [];
        atkarpaPoints.push([el.lon, el.lat]);
        einamasisTransportas = el.transportas;
      }
    });
    if (issiustaUzklausu == 0) {
      addGeoJson();
      hideMessage();
    }
  } else {
    addGeoJson();
    hideMessage();
  }
} // upadteRoute

function round5(f) {
  return Math.round(f * 100000) / 100000;
} // round5

function actionPointSettings(e) {
  var idx = Number(e.srcElement.getAttribute('idx'));
  i_settings_dialog.style.display = 'block';
  settingsIdx = idx;
  settingsIcon = marsrutas[idx].icon;
  settingsColour = marsrutas[idx].colour;
  placeIconsSettings();
} // actionPointSettings

function actionGoToPoint(e) {
  var idx = Number(e.srcElement.getAttribute('idx'));
  map.flyTo({ center: [marsrutas[idx].lon, marsrutas[idx].lat], zoom: 16 });
} // actionGoToPoint

function actionDeleteRoutePoint(e) {
  var idx = Number(e.srcElement.getAttribute('idx'));
  var shadowsExist = false;
  marsrutas.forEach(el => {
    if (el.shadow == idx) {
      shadowsExist = true;
    }
  });
  if (shadowsExist) {
    showTempMessage(cMsgPointHasShadows);
  } else {
    marsrutas.splice(idx, 1);
    fetchDrawnPaths();
    offroad.splice(idx+1, 1);
    marsrutas.forEach((el, i) => {
      if (el.shadow >= 0) {
        if (el.shadow > idx) {
          marsrutas[i].shadow--;
        }
      }
    });
    reassignOffroadIds();
    offroad.splice(marsrutas.length); // remove last offroad element (and any surplus)
    recreateMarkers(map, marsrutas);
    routeChanged();
    updateRoute();
  }
} // actionDeleteRoutePoint

var idxt;
function keistiMarsrutoTaskoPavadinima(e) {
  idxt = Number(e.srcElement.getAttribute('idx'));
  i_keisti_pavadinima.style.display = 'block';
  i_keisti_pavadinima_tekstas.value = marsrutas[idxt].pavadinimas;
  i_keisti_pavadinima_tekstas.onkeypress = actionRenameKeyPress;
} // keistiMarsrutoTaskoPavadinima

function actionRenameKeyPress(e) {
  if (e.key == 'Enter') {
    actionChangeRoutePointName();
  }
} // actionRenameKeyPress

function actionChangeRoutePointName() {
  marsrutas[idxt].pavadinimas = i_keisti_pavadinima_tekstas.value;
  i_keisti_pavadinima.style.display = 'none';
  recreateMarkers(map, marsrutas);
  routeChanged();
  updateRoute();
} // actionChangeRoutePointName

function skaiciuotiAtkarpa(taskai, taskaiPoints, transportas, idx) {
  map.getCanvas().style.cursor = '';
  if (transportas != 'offroad') {
    issiustaUzklausu++;
    fetch('https://openmap.lt/route?' + taskai + '&type=json&instructions=false&vehicle=' + transportas)
      .then(response => response.json())
      .then(data => {
        var way = decodePath(data.paths[0].points);
        var coords = [];
        way.forEach(el => {
          coords.push(el);
        });
        var distance = Math.round(calculateDistance(coords)*10)/10;
        totalDistance += distance;
        distance += ' km';
        var naujaAtkarpa = {
          id: idx,
          type:"Feature",
          properties: { "id": idx, "transport": transportas, "distance":  distance },
          geometry:{
            type:"LineString",
            coordinates: coords
          }
        }
        document.getElementById('distance'+(idx-1)).innerHTML = distance;
        //console.log(naujaAtkarpa);
        marsrutasGeojson.features.push(naujaAtkarpa);
        issiustaUzklausu--;
        if (issiustaUzklausu == 0) {
          addGeoJson();
          document.getElementById('distance' + (marsrutas.length - 1)).innerHTML = Math.round(totalDistance*10)/10 + ' km';
          hideMessage();
        }
      });
  } else {
    if (!offroad[idx]) {
      offroad[idx] = {
        id: idx,
        type:"Feature",
        properties: { "id": idx, "transport": transportas },
        geometry:{
          type:"LineString",
          coordinates: taskaiPoints
        }
      };
    }
    offroad[idx].properties.id = idx;
    var offroadAtkarpa = offroad[idx];
    var distance = Math.round(calculateDistance(offroadAtkarpa.geometry.coordinates)*10)/10;
    totalDistance += distance;
    distance += ' km';
    document.getElementById('distance'+(idx-1)).innerHTML = distance;
    offroadAtkarpa.properties.distance = distance;
    draw.add(offroadAtkarpa);
  }
} // skaiciuotiAtkarpa

function calculateDistance(c) {
  var distance = 0;
  var prev = [];
  var first = true;
  c.forEach(curr => {
    if (first) {
      first = false;
    } else {
      var radlat1 = Math.PI * prev[1]/180;
      var radlat2 = Math.PI * curr[1]/180;
      var theta = curr[0]-prev[0];
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      distance += Math.acos(dist) * 6371;
    }
    prev = curr;
  });
  return distance;
} // calculateDistance
  
var switchIdx;
var switchTransportas;
function marsrutoTransportas(e) {
  var idx = Number(e.srcElement.getAttribute('idx'));
  var tr = e.srcElement.getAttribute('tr');
  if ((marsrutas[idx].transportas == 'offroad') && (tr != 'offroad')) {
    switchIdx = idx;
    switchTransportas = tr;
    switchToNonOffroad();
    routeChanged();
} else {
    marsrutas[idx].transportas = tr;
    updateRoute();
    i_irasyti_marsruta.style.display = 'inline';
  }
} // marsrutoTransportas
  
function switchToNonOffroad() {
  console.log('Switch ' + marsrutas[switchIdx].transportas + '->' + switchTransportas);
  i_dialogo_tekstas.innerHTML = 'Ar tikrai išjungti bekelę? T.y. keisti transportą iš ' + marsrutas[switchIdx].transportas + ' į ' + switchTransportas + '. Jūsų įvestas bekelės maršrutas bus ištrintas!';
  i_dialogo_mygtukas1.innerHTML = 'Taip';
  i_dialogo_mygtukas2.innerHTML = 'Ne';
  i_dialogo_mygtukas1.onclick = switchToNonOffroadYes;
  i_dialogo_mygtukas2.onclick = switchToNonOffroadNo;
  i_dialogas.style.display = 'block';
} // switchToNonOffroad

function switchToNonOffroadNo() {
  i_dialogas.style.display = 'none';
} // switchToNonOffroadNo

function switchToNonOffroadYes() {
  switchToNonOffroadNo();
  marsrutas[switchIdx].transportas = switchTransportas;
  console.log(offroad);
  console.log(switchIdx);
  offroad[switchIdx + 1] = undefined;
  draw.delete(switchIdx + 1);
  console.log(offroad);
  routeChanged();
  updateRoute();
  i_irasyti_marsruta.style.display = 'inline';
} // switchToNonOffroadYes

function moveRoutePoint(fromPos, toPos) {
  console.log('move ' + fromPos + ' to ' + toPos);
  fetchDrawnPaths();
  var tmp;
  var tmp_offroad;
      
  tmp = marsrutas[fromPos];
  tmp_offroad = offroad[i+1];
  if (fromPos < toPos) {
    for (var i=fromPos; i<toPos; i++) {
      marsrutas[i] = marsrutas[i+1];
      offroad[i+1] = offroad[i+2]; // offroad paths are one index up
    }
  } else {
    for (var i=fromPos; i>toPos; i--) {
      marsrutas[i] = marsrutas[i-1];
      offroad[i+1] = offroad[i]; // offroad paths are one index up
    }
  }
  marsrutas[toPos] = tmp;
  offroad[toPos+1] = tmp_offroad;
      
  marsrutas.forEach((el, idx) => {
    var currShadow = marsrutas[idx].shadow;
    if (currShadow > 0) {
      if (currShadow == fromPos) {
        marsrutas[idx].shadow = toPos;
      } else if (fromPos < toPos) {
        // moved down
        if (currShadow > fromPos && currShadow <= toPos) {
          marsrutas[idx].shadow--;
        }
      } else if (fromPos > toPos) {
        // moved up
        if (currShadow > toPos && currShadow <= fromPos) {
          marsrutas[idx].shadow++;
        }
      }
    }
  });
  reassignOffroadIds();
  recreateMarkers(map, marsrutas);
  routeChanged();
  updateRoute();
} // moveRoutePoint
      
var draggedId = -1;
var draggedOntoId = -1;
var dragOverId = -1;
      
function eventDrop(e) {
  e.preventDefault();
  if (e.target.getAttribute('targetId')) {
    draggedOntoId = Number(e.target.getAttribute('targetId'));
  } else if (e.target.parentElement.getAttribute('targetId')) {
    draggedOntoId = Number(e.target.parentElement.getAttribute('targetId'));
  } else {
    draggedOntoId = Number(e.target.parentElement.parentElement.getAttribute('targetId'));
  }
  var e = document.getElementById('drop'+dragOverId);
  e.classList.remove('dropPosition');
  if (draggedId != draggedOntoId) {
    if (draggedId < draggedOntoId) {
      if (draggedOntoId - draggedId > 1) {
        moveRoutePoint(draggedId, draggedOntoId - 1);
      }
    } else {
      moveRoutePoint(draggedId, draggedOntoId);
    }
  }
} // eventDrop

function eventDragStart(e) {
  draggedId = Number(e.target.getAttribute('targetId'));
  dragOverId = 0;
} // eventDragStart

function eventDragOver(e) {
  e.preventDefault();
  var currentDragOverId;
  if (e.target.getAttribute('targetId')) {
    currentDragOverId = Number(e.target.getAttribute('targetId'));
  } else if (e.target.parentElement.getAttribute('targetId')) {
    currentDragOverId = Number(e.target.parentElement.getAttribute('targetId'));
  } else {
    currentDragOverId = Number(e.target.parentElement.parentElement.getAttribute('targetId'));
  }
  if (currentDragOverId != dragOverId) {
    var e = document.getElementById('drop'+dragOverId);
    e.classList.remove('dropPosition');
    dragOverId = currentDragOverId;
    e = document.getElementById('drop'+dragOverId);
    e.classList.add('dropPosition');
  }
} // eventDragOver
      
function actionCreateShadow(e) {
  var idx = Number(e.srcElement.getAttribute('idx'));
  fetchDrawnPaths();
  marsrutas.push({});
  for (var i=marsrutas.length-1; i>idx+1; i--) {
    Object.assign(marsrutas[i], marsrutas[i-1]);
    if (offroad[i]) {
      offroad[i+1] = {};
      Object.assign(offroad[i+1], offroad[i]);
    }
  }
  Object.assign(marsrutas[idx+1], marsrutas[idx]);
  marsrutas[idx+1].shadow = idx;
  reassignOffroadIds();
  recreateMarkers(map, marsrutas);
  routeChanged();
  updateRoute();
} // actionCreateShadow
      
function actionToggleDisplay(e) {
  var idx = Number(e.srcElement.getAttribute('idx'));
  marsrutas[idx].displayed = !marsrutas[idx].displayed;
  recreateMarkers(map, marsrutas);
  if (marsrutas[idx].displayed) {
    e.srcElement.classList.remove('mygtisj');
  } else {
    e.srcElement.classList.add('mygtisj');
  }
  routeChanged();
} // actionToggleDisplay

function decodePath(encoded) {
  var len = encoded.length;
  var index = 0;
  var array = [];
  var lat = 0;
  var lng = 0;
  var ele = 0;
  
  while (index < len) {
    var b;
    var shift = 0;
    var result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;
  
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var deltaLon = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLon;
  
    array.push([lng / 100000, lat / 100000]);
  }
  return array;
} // decodePath

var settingsIdx;
var settingsIcon;
var settingsColour;
function placeIconsSettings() {
  i_settings_icons.innerHTML = '';
  markers.forEach((el, idx) => {
    var icon = document.createElement('span');
    icon.innerHTML = el.replaceAll('#colour', settingsColour);
    icon.classList.add('hover');
    icon.style.paddingTop = '40px';
    icon.setAttribute('icon', idx);
    icon.onclick = actionSettingsIconChange;
    icon.childNodes[0].style.pointerEvents = 'none';
    icon.childNodes[0].style.display = 'inline';
    icon.childNodes[0].classList.add('hover');
    if (idx == settingsIcon) {
      icon.style.background = 'green';
    }
    i_settings_icons.appendChild(icon);
  });
} // placeIconsSettings

function actionSettingsCancel(e) {
  i_settings_dialog.style.display = 'none';
} // actionSettingsCancel

function actionSettingsAccept(e) {
  actionSettingsCancel();
  marsrutas[settingsIdx].icon = settingsIcon;
  marsrutas[settingsIdx].colour = settingsColour;
  recreateMarkers(map, marsrutas);
} // actionSettingsAccept

function actionSettingsIconChange(e) {
  settingsIcon = Number(e.srcElement.getAttribute('icon'));
  console.log('change icon to - ' + settingsIcon);
  placeIconsSettings();
}

function actionSettingsColourChange(e) {
  settingsColour = e.srcElement.getAttribute('colour');
  placeIconsSettings();
}

function fetchDrawnPaths() {
  draw.getAll().features.forEach(el => {
    offroad[el.id] = el;
  });
  draw.deleteAll();
}

function reassignOffroadIds() {
  offroad.forEach((el, idx) => {
    if (offroad[idx]) {
      offroad[idx].id = idx;
    }
  });
}

var marsrutasGeojson = {"type":"FeatureCollection",
"features":[
  {"type":"Feature",
   "properties":
     {"transport":"foot",},
   "geometry":{
     "type":"LineString",
     "coordinates":[]
   }
 }
]
}
function addGeoJson() {
   var mapLayer = map.getLayer('route');
   if (typeof mapLayer !== 'undefined') {
     map.removeLayer('route').removeSource('route');
   }
   var mapLayer = map.getLayer('route-distance');
   if (typeof mapLayer !== 'undefined') {
     map.removeLayer('route-distance').removeSource('route-distance');
   }
   map.addLayer({
     "id": "route",
     "type": "line",
     "source": {
       "type": "geojson",
       "data": marsrutasGeojson
     }, // source
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

function perkeltas(e) {
  var i = Number(e.target._element.getAttribute('id'));
  marsrutas[i].lat = e.target._lngLat.lat;
  marsrutas[i].lon = e.target._lngLat.lng;
  marsrutas.forEach((el, idx) => {
    if (el.shadow == i) {
      marsrutas[idx].lat = e.target._lngLat.lat;
      marsrutas[idx].lon = e.target._lngLat.lng;
    }
  });
  updateRoute();
} // perkeltas

// TODO: actionSettingsColourChange should not be exported
export { pointClicked, addRemoveRoute, actionSettingsColourChange, addGeoJson, perkeltas }
