import mapboxgl from '!mapbox-gl';
import './styles.css';
import { initMap, switchTo, map } from './map.js';
import { loginScreen } from './login.js';
import { recreateMarkers, setOnMove, removeAllMarkers, setMarkersMovable, migrateOldData, defaultColour } from './markers.js';
import { showMessage, hideMessage, showTempMessage }  from './message.js';
import packagej from '../package.json';
import { addRemoveRoute, pointClicked, actionSettingsColourChange, addGeoJson, perkeltas } from './route.js';
const { version } = packagej;

loginScreen(init);

i_version.innerHTML = version;
var phpBase = 'php/';
var urlTaskai = phpBase + 'points.php';
var kuriamMarsruta = false;
var creatingPoint = false;
var orto = false;
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

i_irasyti.onclick  = irasytiTaska;
i_istrinti.onclick = istrintiTaska;
i_perkelti.onclick = perkeltiTaska;
i_uzdaryti.onclick = uzdarytiTaska;
i_koordinates_prideti.onclick = addCoordinates;
i_koordinates_nutraukti.onclick = koordinatesNutraukti;
i_base_img.onclick = switchBase;

function init() {
  console.log('initialising map');
  if (!mapboxgl.supported()) {
    alert('Jūsų naršyklė nepalaiko Mapbox GL. Prašome atsinaujinti naršyklę.');
  } else {
    initMap(runApp);
    controlInitial();
  }
} // init

function controlInitial() {
  var buttonAddPoint = document.createElement('div');
  buttonAddPoint.id = 'i_prideti_taska';
  buttonAddPoint.classList.add('mygt');
  buttonAddPoint.onclick = pridetiTaska;
  buttonAddPoint.innerHTML = 'Pridėti tašką';
  var buttonAddRoute = document.createElement('div');
  buttonAddRoute.id = 'i_prideti_marsruta';
  buttonAddRoute.classList.add('mygt');
  buttonAddRoute.onclick = addRemoveRoute;
  buttonAddRoute.innerHTML = 'Pridėti maršrutą';
  i_control.innerHTML = '';
  i_control.appendChild(buttonAddPoint);
  i_control.appendChild(buttonAddRoute);
} // controlInitial

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

function runApp() {
  setTimeout(function() {
    fillClassifier(i_tipas, 'tipas');
    fillClassifier(i_gentis, 'gentis');
    fillClassifier(i_krastas, 'krastas');
    fillClassifier(i_vaizdingumas, 'reiksme');
    fillClassifier(i_arch_reiksme, 'reiksme');
    fillClassifier(i_mito_reiksme, 'reiksme');
    fillClassifier(i_ist_reiksme, 'reiksme2');
    fillClassifier(i_vis_reiksme, 'vis_reiksme');
    fillClassifier(i_tyrimu_duomenys, 'tyrimu_duomenys');
    fillClassifier(i_pritaikymas_lankymui, 'pritaikymas');
    addPointLayer();
    setOnMove(perkeltas);
  }, 1000);
} // runApp

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
} // switchBase

  var crc;
  function pridetiTaska() {
    map.on('click', pelePaspausta);
    map.getCanvas().style.cursor = 'crosshair';
    i_tasko_koordinates.style.display = 'block';
    crc = '4326';
  }

function addCoordinates() {
  if (!i_lat.value || !i_lon.value) {
    showTempMessage('Reikia įvesti ir platumą, ir ilgumą!');
    koordinatesNutraukti();
  } else {
    var e = { lngLat: { lat: i_lat.value, lng: i_lon.value }}
    crc = i_koordinaciu_tipas.value;
    if (
        ((crc == 4326) && (Number(i_lat.value) > 56.5 ||
                           Number(i_lat.value) < 53.5 ||
                           Number(i_lon.value) > 27.0 ||
                           Number(i_lon.value) < 20.5 ))
        ||
        ((crc == 3346) && (Number(i_lat.value) > 6263000 ||
                           Number(i_lat.value) < 5968000 ||
                           Number(i_lon.value) > 683000 ||
                           Number(i_lon.value) < 285000 ))
       ) {
      showTempMessage('Netinkamos koordinatės!');
      koordinatesNutraukti();
    } else {
      pelePaspausta(e);
    }
  }
} // addCoordinates

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
  function paspaustasTaskas(e) {
    if (kuriamMarsruta) {
      pointClicked(e);
    } else {
      elementoId = e.features[0].id;
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

function fillClassifier(p_elementas, p_tipas) {
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
} // fillClassifier

function setCreatingRoute(state) {
  kuriamMarsruta = state;
}

function setCreatingPoint(state) {
  creatingPoint = state;
}
export { controlInitial, kuriamMarsruta, setCreatingRoute, setCreatingPoint, phpBase, orto }
