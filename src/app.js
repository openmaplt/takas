import mapboxgl from '!mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import './styles.css';
import {version} from '../package.json';
import { initMap, switchTo, map } from './map.js';
import { loginScreen } from './login.js';
import { getIcon } from './markers.js';

loginScreen(addPointLayer);

i_version.innerHTML = version;
var phpBase = 'php/';
var urlTaskai = phpBase + 'points.php';
var kuriamMarsruta = false;
var creatingPoint = false;
var marsrutas = [];
var offroad = [];
var draw;
var lastLat = 0;
var lastLon = 0;
var orto = false;
var defaultColour = '#55ff55';
var colours = [defaultColour, '#5555ff', '#222222'];
colours.forEach(el => {
  var colour = document.createElement('span');
  colour.innerHTML = 'ROKENROLL';
  colour.style.background = el;
  colour.style.border = '1px solid gray';
  colour.classList.add('hover');
  colour.setAttribute('colour', el);
  colour.onclick = actionSettingsColourChange;
  i_settings_colours.appendChild(colour);
});

if (!mapboxgl.supported()) {
  alert('Jūsų naršyklė nepalaiko Mapbox GL. Prašome atsinaujinti naršyklę.');
} else {
  initMap(runApp);
}

i_prideti_taska.onclick = pridetiTaska;
i_prideti_marsruta.onclick = pridetiMarsruta;
i_irasyti.onclick  = irasytiTaska;
i_istrinti.onclick = istrintiTaska;
i_perkelti.onclick = perkeltiTaska;
i_uzdaryti.onclick = uzdarytiTaska;
i_koordinates_prideti.onclick = koordinatesPrideti;
i_koordinates_nutraukti.onclick = koordinatesNutraukti;
i_irasyti_marsruta.onclick = irasytiMarsruta;
i_ikelti_marsruta.onclick = marsrutuSarasas;
i_prideti_tarpini_taska.onclick = pridetiTarpiniTaska;
i_settings_accept.onclick = actionSettingsAccept;
i_settings_cancel.onclick = actionSettingsCancel;
i_change_route_point_name.onclick = actionChangeRoutePointName;
i_base_img.onclick = switchBase;

function setUrl(uuid) {
  i_url.innerHTML = '<small>' + window.location.protocol + '//' +
    window.location.host.toString() + '/route.html?uuid=' + uuid + '</small>';
} // setUrl

var pointListeners = false; // have point listeneres already been created?
function addPointLayer() {
  var dummySource = map.getSource('taskai-src');
  if (typeof dummySource == 'undefined') {
    map.addSource('taskai-src', { 'type': 'geojson', 'data': urlTaskai });
  }
  map.addLayer({
    'id': 'taskai',
    'type': 'circle',
    'source': 'taskai-src',
    'paint': {
      'circle-color': '#22dd22',
      'circle-radius': {
        'stops': [[11, 1], [16, 5]]
      },
      'circle-stroke-color': '#222222',
      'circle-stroke-width': {
        'stops': [[11, 0], [16, 1]]
      }
    }
  });
  map.addLayer({
    'id': 'taskai-label',
    'type': 'symbol',
    'source': 'taskai-src',
    'layout': {
      'text-field': '{pavadinimas}',
      'text-font': ['Roboto Condensed Italic'],
      'text-size': 12,
      'text-variable-anchor': ['left','top','bottom','right'],
      'text-radial-offset': 0.7,
      'text-justify': 'auto',
      'text-padding': 1
    },
    'paint': {
      'text-color': '#333333',
      'text-halo-width': 1,
      'text-halo-color': "rgba(255, 255, 255, 0.9)"
    }
  });
  if (!pointListeners) {
    map.on('click', 'taskai', paspaustasTaskas);
    map.on('mouseenter', 'taskai', mouseEnterPoints);
    map.on('mouseleave', 'taskai', mouseLeavePoints);
    pointListeners = true;
  }
} // addPointLayer

function mouseEnterPoints() {
  map.getCanvas().style.cursor = 'pointer';
} // mouseEnterPoints()

function mouseLeavePoints() {
  if (creatingPoint) {
    map.getCanvas().style.cursor = 'crosshair';
  } else {
    map.getCanvas().style.cursor = '';
  }
} // mouseLeavePoints

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
  function runApp() {
    setTimeout(function() {
      uzpildytiKlasifikatoriu(i_tipas, 'tipas');
      uzpildytiKlasifikatoriu(i_gentis, 'gentis');
      uzpildytiKlasifikatoriu(i_krastas, 'krastas');
      uzpildytiKlasifikatoriu(i_vaizdingumas, 'reiksme');
      uzpildytiKlasifikatoriu(i_arch_reiksme, 'reiksme');
      uzpildytiKlasifikatoriu(i_mito_reiksme, 'reiksme');
      uzpildytiKlasifikatoriu(i_ist_reiksme, 'reiksme2');
      uzpildytiKlasifikatoriu(i_vis_reiksme, 'vis_reiksme');
      uzpildytiKlasifikatoriu(i_tyrimu_duomenys, 'tyrimu_duomenys');
      uzpildytiKlasifikatoriu(i_pritaikymas_lankymui, 'pritaikymas');
    }, 1000);
  }
  function drawSelectionchange(e) {
    setMarkersMovable(e.features.length == 0);
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
    if (kuriamMarsruta) {
      var dummy = setTimeout(addGeoJson, 500);
    }
    var dummy = setTimeout(addPointLayer, 600);
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
  var crc;
  function pridetiTaska() {
    map.on('click', pelePaspausta);
    map.getCanvas().style.cursor = 'crosshair';
    i_tasko_koordinates.style.display = 'block';
    crc = '4326';
  }
  function pridetiTarpiniTaska() {
    map.on('click', pridetiPozicija);
    map.getCanvas().style.cursor = 'crosshair';
    creatingPoint = true;
  }
  function koordinatesPrideti() {
    var e = { lngLat: { lat: i_lat.value, lng: i_lon.value }}
    crc = i_koordinaciu_tipas.value
    pelePaspausta(e);
  } // koordinatesPrideti
  function koordinatesNutraukti() {
    i_tasko_koordinates.style.display = 'none';
    map.getCanvas().style.cursor = '';
    map.off('click', pelePaspausta);
  } // koordinatesNutraukti
  function pelePaspausta(e) {
    koordinatesNutraukti();
    fetch(phpBase + 'new_point.php?lat=' + e.lngLat.lat + '&lon=' + e.lngLat.lng + '&crc=' + crc)
      .then(response => response.json())
      .then(data => {
        console.log('Taškas nusiųstas');
        console.log(data);
        map.getSource('taskai-src').setData(urlTaskai);
        var z = 14;
        if (map.getZoom() > 14) {
          z = map.getZoom();
        }
        map.flyTo({center: [data.lon, data.lat], zoom: z});
      });
    crc = 4326;
  }
  var elementoId;
  var lastLat, lastLon;
  function paspaustasTaskas(e) {
    if (kuriamMarsruta) {
      var poz = { pavadinimas: e.features[0].properties.pavadinimas,
                  tipas: 2,
                  lat: e.lngLat.lat,
                  lon: e.lngLat.lng,
                  transportas: 'foot',
                  icon: 0,
                  colour: defaultColour }
      marsrutas.push(poz);
      zymekliai.push(mZymeklis(poz.pavadinimas, marsrutas.length - 1, poz.lon, poz.lat));
      updateRoute();
      lastLat = e.lngLat.lat;
      lastLon = e.lngLat.lng;
      i_irasyti_marsruta.style.display = 'inline';
    } else {
      elementoId = e.features[0].id;
      console.log('id='+elementoId);
      i_elementas.innerHTML = elementoId;
      i_savybes.style.display = 'block';
      i_pavadinimas.value = e.features[0].properties.pavadinimas;
      i_tipas.value = e.features[0].properties.tipas;
      i_gentis.value = e.features[0].properties.gentis;
      i_krastas.value = e.features[0].properties.krastas;
      i_vaizdingumas.value = e.features[0].properties.vaizdingumas;
      i_arch_reiksme.value = e.features[0].properties.arch_reiksme;
      i_mito_reiksme.value = e.features[0].properties.mito_reiksme;
      i_ist_reiksme.value = e.features[0].properties.ist_reiksme;
      i_vis_reiksme.value = e.features[0].properties.vis_reiksme;
      i_tyrimu_duomenys.value = e.features[0].properties.tyrimu_duomenys;
      i_pritaikymas_lankymui.value = e.features[0].properties.pritaikymas_lankymui;
      if (e.features[0].properties.kvr_numeris) {
        i_kvr_numeris.value = e.features[0].properties.kvr_numeris;
      } else {
        i_kvr_numeris.value = '';
      }
      i_pastabos.value = e.features[0].properties.pastabos;
    }
  }
  function irasytiTaska() {
    uzdarytiTaska();
    const postData = new FormData();
    postData.append('id', elementoId);
    postData.append('pavadinimas', i_pavadinimas.value);
    postData.append('tipas', i_tipas.value);
    postData.append('gentis', i_gentis.value);
    postData.append('krastas', i_krastas.value);
    postData.append('vaizdingumas', i_vaizdingumas.value);
    postData.append('arch_reiksme', i_arch_reiksme.value);
    postData.append('mito_reiksme', i_mito_reiksme.value);
    postData.append('ist_reiksme', i_ist_reiksme.value);
    postData.append('vis_reiksme', i_vis_reiksme.value);
    postData.append('tyrimu_duomenys', i_tyrimu_duomenys.value);
    postData.append('pritaikymas_lankymui', i_pritaikymas_lankymui.value);
    if (i_kvr_numeris.value == '') {
      postData.append('kvr_numeris', 0);
    } else {
      postData.append('kvr_numeris', i_kvr_numeris.value);
    }
    postData.append('pastabos', i_pastabos.value);
    fetch(phpBase + 'edit_point.php', { method: 'POST', body: postData })
      .then(data => {
        console.log('Taško pakeitimas nusiųstas');
        map.getSource('taskai-src').setData(urlTaskai);
      });
  }
  function istrintiTaska() {
    if (confirm('Ar tikrai norite panaikinti šitą tašką?')) {
      uzdarytiTaska();
      fetch(phpBase + 'delete_point.php?id=' + elementoId)
        .then(data => {
          console.log('Taško pakeitimas nusiųstas');
          map.getSource('taskai-src').setData(urlTaskai);
        });
    }
  } // istrintiTaska
  function perkeltiTaska() {
    map.on('click', naujaPozicija);
    map.getCanvas().style.cursor = 'crosshair';
    i_savybes.style.display = 'none';
  }
  function naujaPozicija(e) {
    map.off('click', naujaPozicija);
    map.getCanvas().style.cursor = '';
    fetch(phpBase + 'move_point.php?id=' + elementoId + '&lat=' + e.lngLat.lat + '&lon=' + e.lngLat.lng)
      .then(data => {
        console.log('Taško pozicijos pakeitimas nusiųstas');
        map.getSource('taskai-src').setData(urlTaskai);
      });
  }
  function uzdarytiTaska() {
    i_savybes.style.display = 'none';
  }
  function pridetiMarsruta() {
    createDraw();
    if (!kuriamMarsruta) {
      marsrutoId = 0;
      kuriamMarsruta = true;
      i_prideti_marsruta.innerHTML = 'Išjungti maršrutą';
      i_prideti_taska.style.display = 'none';
      i_irasyti_marsruta.style.display = 'none';
      i_marsrutas.style.display = 'block';
      i_url.innerHTML = '';
      marsrutas = [];
      offroad = [];
      i_marsruto_pavadinimas.value = '';
    } else {
      map.off('click', pridetiPozicija);
      i_marsrutas.style.display = 'none';
      kuriamMarsruta = false;
      i_prideti_marsruta.innerHTML = 'Pridėti maršrutą';
      i_prideti_taska.style.display = 'block';
      zymekliai.forEach(el => { el.remove(); });
      zymekliai = [];
      marsrutas = [];
      marsrutasGeojson.features = [];
      addGeoJson();
      draw.deleteAll();
      map.getCanvas().style.cursor = '';
      i_marsruto_taskai.innerHTML = '<i>Maršrutas tuščias. Parinkite lankytinas veitas arba spauskite ant žemėlapio, kad sukurtumėte tarpinius taškus</i><p>Arba: <span id="i_ikelti_marsruta" class="mygt">Įkelti maršrutą</span></p>';
      i_ikelti_marsruta.onclick = marsrutuSarasas;
    }
  }
  var zymekliai = [];
  function mZymeklis(p_pavadinimas, p_idx, p_lon, p_lat) {
    var markerElement = document.createElement('div');
    var markerText = document.createElement('div');
    markerText.innerHTML = getIcon(marsrutas[p_idx].icon, marsrutas[p_idx].colour);
    markerText.className = 'marker';
    markerText.classList.add('taskuZymeklis');
    markerElement.appendChild(markerText);
    if (marsrutas[p_idx].tipas == 1) {
      var z_tekstas = document.createElement('div');
      z_tekstas.className = 'taskuEtiketes';
      z_tekstas.innerHTML = p_pavadinimas;
      markerElement.appendChild(z_tekstas);
    }
    markerElement.setAttribute('id', p_idx);
    var zymeklis = new mapboxgl.Marker({ element: markerElement,
                                         draggable: marsrutas[p_idx].tipas == 1,
                                         offset: [0, -5]})
      .setLngLat([p_lon, p_lat])
      .addTo(map);
    zymeklis.on('dragend', perkeltas);
    return zymeklis;
  } // mZymeklis
  function pridetiPozicija(e) {
    map.off('click', pridetiPozicija);
    map.getCanvas().style.cursor = '';
    creatingPoint = false;
    if ((lastLat != e.lngLat.lat) && (lastLon != e.lngLat.lng)) {
      var poz = { pavadinimas: "Pozicija",
                  tipas: 1,
                  lat: e.lngLat.lat,
                  lon: e.lngLat.lng,
                  transportas: 'foot',
                  icon: 0,
                  colour: defaultColour }
      marsrutas.push(poz);
      updateRoute();
      var elem = document.createElement('div');
      elem.setAttribute('kuku', 'abc');
      var zymeklis = mZymeklis(poz.pavadinimas, marsrutas.length - 1, poz.lon, poz.lat);
      zymekliai.push(zymeklis);
      i_irasyti_marsruta.style.display = 'inline';
      map.getCanvas().style.cursor = '';
    }
  }
  function perkeltas(e) {
    var i = Number(e.target._element.getAttribute('id'));
    marsrutas[i].lat = e.target._lngLat.lat;
    marsrutas[i].lon = e.target._lngLat.lng;
    updateRoute();
  }
  function setMarkersMovable(p_movable) {
    zymekliai.forEach(el => {
      el.setDraggable(p_movable);
    });
  } // setMarkersMovable
  function round5(f) {
    return Math.round(f * 100000) / 100000;
  }
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
  
      array.push([lng * 1e-5, lat * 1e-5]);
    }
    return array;
  }
  var issiustaUzklausu;
  function updateRoute() {
    var poz = '';
    var count = 0;
    i_marsruto_taskai.innerHTML = '';
    var marsrutoLentele = document.createElement('table');
    marsrutoLentele.classList.add('marsrutoLentele');
    marsrutas.forEach((el, idx) => {
      var marsrutoTaskas = document.createElement('tr');
      var tekstas = document.createElement('td');
  
      // add button to zoom to point position on the map
      var bGoTo = document.createElement('span');
      bGoTo.innerHTML = 'launch';
      bGoTo.classList.add('material-icons');
      bGoTo.classList.add('mygt');
      bGoTo.classList.add('mygtm');
      bGoTo.setAttribute('idx', idx);
      bGoTo.onclick = actionGoToPoint;
      tekstas.appendChild(bGoTo);
  
      // add point name
      var name = document.createElement('span');
      name.innerHTML = el.pavadinimas;
      tekstas.appendChild(name);
  
      if (el.tipas == 1) {
        var myg = document.createElement('span');
        myg.innerHTML = 'border_color';
        myg.classList.add('material-icons');
        myg.classList.add('mygt');
        myg.classList.add('mygtm');
        myg.setAttribute('idx', idx);
        myg.onclick = keistiMarsrutoTaskoPavadinima;
        tekstas.appendChild(myg);
      }
      marsrutoTaskas.appendChild(tekstas);
  
      var aukstynZemyn = document.createElement('td');
      aukstynZemyn.setAttribute('style', 'text-align: center');
      var trinti = document.createElement('td');
      var transportoTipas = document.createElement('td');
      if (idx > 0) {
        var mygtukas = document.createElement('span');
        //mygtukas.innerHTML = 'Aukštyn';
        mygtukas.innerHTML = 'keyboard_arrow_up';
        mygtukas.classList.add('material-icons');
        mygtukas.classList.add('mygt');
        mygtukas.classList.add('mygtm');
        mygtukas.setAttribute('idx', idx);
        mygtukas.onclick = marsrutoMygtukasAukstyn;
        aukstynZemyn.appendChild(mygtukas);
      }
      if (idx < marsrutas.length - 1) {
        var mygtukas = document.createElement('span');
        //mygtukas.innerHTML = 'Žemyn';
        mygtukas.innerHTML = 'keyboard_arrow_down';
        mygtukas.classList.add('material-icons');
        mygtukas.classList.add('mygt');
        mygtukas.classList.add('mygtm');
        mygtukas.setAttribute('idx', idx);
        mygtukas.onclick = marsrutoMygtukasZemyn;
        aukstynZemyn.appendChild(mygtukas);
  
        mygtukas = document.createElement('span');
        mygtukas.id = 'transportas' + idx + 'pesciomis';
        mygtukas.innerHTML = 'Pėsčiomis';
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
        mygtukas.innerHTML = 'Dviračiu';
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
        mygtukas.innerHTML = 'Mašina';
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
        mygtukas.innerHTML = 'Bekele';
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
      var mygtukasTrinti = document.createElement('span');
      mygtukasTrinti.onclick = trintiMarsrutoTaska;
      mygtukasTrinti.innerHTML = 'delete';
      mygtukasTrinti.classList.add('material-icons');
      mygtukasTrinti.classList.add('mygt');
      mygtukasTrinti.classList.add('mygtm');
      mygtukasTrinti.setAttribute('idx', idx);
      trinti.appendChild(mygtukasTrinti);
  
      var buttonSettings = document.createElement('span');
      buttonSettings.onclick = actionPointSettings;
      buttonSettings.innerHTML = 'settings';
      buttonSettings.classList.add('material-icons');
      buttonSettings.classList.add('mygt');
      buttonSettings.classList.add('mygtm');
      buttonSettings.setAttribute('idx', idx);
      trinti.appendChild(buttonSettings);
  
      var distance = document.createElement('span');
      distance.id = 'distance' + idx;
  
      marsrutoTaskas.appendChild(aukstynZemyn);
      marsrutoTaskas.appendChild(trinti);
      marsrutoTaskas.appendChild(transportoTipas);
      marsrutoTaskas.appendChild(distance);
      marsrutoLentele.appendChild(marsrutoTaskas);
      poz += '&point=' + round5(el.lat) + ',' + round5(el.lon);
      count++;
    });
    i_marsruto_taskai.appendChild(marsrutoLentele);
    if (count > 1) {
      marsrutasGeojson.features = [];
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
      }
    }
  }
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
  function actionPointSettings(e) {
    var idx = Number(e.srcElement.getAttribute('idx'));
    i_settings_dialog.style.display = 'block';
    settingsIdx = idx;
    settingsIcon = marsrutas[idx].icon;
    settingsColour = marsrutas[idx].colour;
    placeIconsSettings();
  } // actionPointSettings
  function actionSettingsCancel(e) {
    i_settings_dialog.style.display = 'none';
  } // actionSettingsCancel
  function actionSettingsAccept(e) {
    actionSettingsCancel();
    marsrutas[settingsIdx].icon = settingsIcon;
    marsrutas[settingsIdx].colour = settingsColour;
    perkurtiZymeklius();
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
  function actionGoToPoint(e) {
    var idx = Number(e.srcElement.getAttribute('idx'));
    map.flyTo({ center: [marsrutas[idx].lon, marsrutas[idx].lat], zoom: 16 });
  } // actionGoToPoint
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
  function trintiMarsrutoTaska(e) {
    var idx = Number(e.srcElement.getAttribute('idx'));
    marsrutas.splice(idx, 1);
    fetchDrawnPaths();
    offroad.splice(idx+1, 1);
    reassignOffroadIds();
    perkurtiZymeklius();
    updateRoute();
  }
  var idxt;
  function keistiMarsrutoTaskoPavadinima(e) {
    idxt = Number(e.srcElement.getAttribute('idx'));
    i_keisti_pavadinima.style.display = 'block';
    i_keisti_pavadinima_tekstas.value = marsrutas[idxt].pavadinimas;
  } // keistiMarsrutoTaskoPavadinima
  function actionChangeRoutePointName() {
    marsrutas[idxt].pavadinimas = i_keisti_pavadinima_tekstas.value;
    i_keisti_pavadinima.style.display = 'none';
    zymekliai[idxt].remove();
    zymekliai[idxt] = mZymeklis(marsrutas[idxt].pavadinimas, idxt, marsrutas[idxt].lon, marsrutas[idxt].lat);
    updateRoute();
  }
  function calculateDistance(c) {
    var distance = 0;
    var prev = [];
    var first = true;
    c.forEach(curr => {
      if (first) {
        first = false;
      } else {
  //function distance(lat1, lon1, lat2, lon2) {
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
  var totalDistance;
  function skaiciuotiAtkarpa(taskai, taskaiPoints, transportas, idx) {
    map.getCanvas().style.cursor = '';
    totalDistance = 0;
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
          var naujaAtkarpa = { "type":"Feature",
            "properties": { "transport": transportas, "distance":  distance },
            "geometry":{
              "type":"LineString",
              "coordinates": coords
            }
          }
          document.getElementById('distance'+(idx-1)).innerHTML = distance;
          //console.log(naujaAtkarpa);
          marsrutasGeojson.features.push(naujaAtkarpa);
          issiustaUzklausu--;
          if (issiustaUzklausu == 0) {
            addGeoJson();
            document.getElementById('distance' + (marsrutas.length - 1)).innerHTML = Math.round(totalDistance*10)/10 + ' km';
          }
        });
    } else {
      if (!offroad[idx]) {
        offroad[idx] = {
          id: idx,
          type:"Feature",
          properties: { "transport": transportas },
          geometry:{
            "type":"LineString",
            "coordinates": taskaiPoints
          }
        };
      }
      var offroadAtkarpa = offroad[idx];
      var distance = Math.round(calculateDistance(offroadAtkarpa.geometry.coordinates)*10)/10;
      totalDistance += distance;
      distance += ' km';
      document.getElementById('distance'+(idx-1)).innerHTML = distance;
      console.log('manual=' + distance);
      offroadAtkarpa.properties.distance = distance;
      draw.add(offroadAtkarpa);
    }
  }
  function perkurtiZymeklius() {
    zymekliai.forEach(el => {
      el.remove();
    });
    zymekliai = [];
    marsrutas.forEach((el, idx) => {
      var zymeklis = mZymeklis(el.pavadinimas, idx, el.lon, el.lat);
      zymekliai.push(zymeklis);
    });
  }
  function marsrutoMygtukasAukstyn(e) {
    var idx = Number(e.srcElement.getAttribute('idx'));
  
    var tmp = marsrutas[idx];
    marsrutas[idx] = marsrutas[idx-1];
    marsrutas[idx-1] = tmp;
  
    fetchDrawnPaths();
    idx = idx + 1; // offroad paths are one index up
    var tmp_offroad = offroad[idx];
    offroad[idx] = offroad[idx-1];
    offroad[idx-1] = tmp_offroad;
    reassignOffroadIds();
  
    perkurtiZymeklius();
    updateRoute();
  }
  function marsrutoMygtukasZemyn(e) {
    var idx = Number(e.srcElement.getAttribute('idx'));
  
    var tmp = marsrutas[idx];
    marsrutas[idx] = marsrutas[idx+1];
    marsrutas[idx+1] = tmp;
  
    fetchDrawnPaths();
    idx = idx + 1; // offroad paths are one index up
    var tmp_offroad = offroad[idx];
    offroad[idx] = offroad[idx-1];
    offroad[idx-1] = tmp_offroad;
    reassignOffroadIds();
  
    perkurtiZymeklius();
    updateRoute();
  }
  var switchIdx;
  var switchTransportas;
  function marsrutoTransportas(e) {
    var idx = Number(e.srcElement.getAttribute('idx'));
    var tr = e.srcElement.getAttribute('tr');
    if ((marsrutas[idx].transportas == 'offroad') && (tr != 'offroad')) {
      switchIdx = idx;
      switchTransportas = tr;
      switchToNonOffroad();
    } else {
      marsrutas[idx].transportas = tr;
      updateRoute();
      i_irasyti_marsruta.style.display = 'inline';
    }
  }
  var marsrutoId;
  function irasytiMarsruta() {
    /* TODO: Šitą reikėtų daryti tik tada, kai baigiama KEISTI kokią nors bekelę */
    draw.getAll().features.forEach(el => {
      offroad[el.id] = el;
    });
    const postData = new FormData();
    postData.append('pavadinimas', i_marsruto_pavadinimas.value);
    postData.append('marsrutas', JSON.stringify(marsrutasGeojson));
    postData.append('taskai', JSON.stringify(marsrutas));
    postData.append('offroad', JSON.stringify(offroad));
    postData.append('id', marsrutoId);
    fetch(phpBase + 'save_route.php', { method: 'POST', body: postData })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (marsrutoId == 0) {
          setUrl(data.uuid);
        }
        marsrutoId = data.id;
      });
  } // irasytiMarsruta
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
          elem_p.onclick = ikeltiMarsruta;
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
        elem.onclick = ikeltiMarsruta;
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
  }
  function netrintiMarsruto() {
    i_dialogas.style.display = 'none';
  }
  function trintiMarsruta() {
    netrintiMarsruto();
    console.log('Trinti marsruta ' + trintiMarsrutaId);
    fetch(phpBase + 'delete_route.php?id=' + trintiMarsrutaId);
  }
  function switchToNonOffroad() {
    console.log('Switch ' + marsrutas[switchIdx].transportas + '->' + switchTransportas);
    i_dialogo_tekstas.innerHTML = 'Ar tikrai išjungti bekelę? T.y. keisti transportą iš ' + marsrutas[switchIdx].transportas + ' į ' + switchTransportas + '. Jūsų įvestas bekelės maršrutas bus ištrintas!';
    i_dialogo_mygtukas1.innerHTML = 'Taip';
    i_dialogo_mygtukas2.innerHTML = 'Ne';
    i_dialogo_mygtukas1.onclick = switchToNonOffroadYes;
    i_dialogo_mygtukas2.onclick = switchToNonOffroadNo;
    i_dialogas.style.display = 'block';
  }
  function switchToNonOffroadNo() {
    i_dialogas.style.display = 'none';
  }
  function switchToNonOffroadYes() {
    switchToNonOffroadNo();
    marsrutas[switchIdx].transportas = switchTransportas;
    console.log(offroad);
    console.log(switchIdx);
    offroad[switchIdx + 1] = undefined;
    draw.delete(switchIdx + 1);
    console.log(offroad);
    updateRoute();
    i_irasyti_marsruta.style.display = 'inline';
  }
  function ikeltiMarsruta(e) {
    i_marsrutu_sarasas.style.display = 'none';
    console.log(e);
    marsrutoId = e.srcElement.getAttribute('id');
    console.log(marsrutoId);
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
          // Duomenų migracija
          marsrutas.forEach((el, idx) => {
            if (!el.tipas) {
              if (el.pavadinimas == 'Pozicija') {
                marsrutas[idx].tipas = 1;
              } else {
                marsrutas[idx].tipas = 2;
              }
            }
          });
          i_marsruto_pavadinimas.value = data.pavadinimas;
          marsrutas.forEach((el, idx) => {
            if (!el.icon) {
              marsrutas[idx].icon = 0;
            }
            if (!el.colour) {
              marsrutas[idx].colour = defaultColour;
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
          i_irasyti_marsruta.style.display = 'inline';
  
          updateRoute();
        });
    }
  }
  function uzpildytiKlasifikatoriu(p_elementas, p_tipas) {
    fetch(phpBase + 'class.php?klase=' + p_tipas)
      .then(response => response.json())
      .then(data => {
        var o = document.createElement('option');
        o.setAttribute('value', '0');
        o.innerHTML = '-- nenurodyta --';
        p_elementas.appendChild(o);
        data.forEach(el => {
          var o = document.createElement('option');
          o.setAttribute('value', el.raktas);
          o.innerHTML = el.reiksme;
          p_elementas.appendChild(o);
        });
      });
  } // uzpildytiKlasifikatorius
  