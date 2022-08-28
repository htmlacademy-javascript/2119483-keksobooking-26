import { generateSimilarAdvertisement } from './generating-similars.js';
import { setActiveAdvertisementForm, setActiveMapFilters } from './form.js';
import { CENTER_LAT, CENTER_LNG, RENDER_DELAY } from './constants.js';
import { getData } from './api.js';
import { debounce } from './utils.js';

const mapElement = document.querySelector('#map-canvas');
const coordinateElement = document.querySelector('#address');
const housingTypeElement = document.querySelector('#housing-type');
const housingPriceElement = document.querySelector('#housing-price');
const housingRoomsElement = document.querySelector('#housing-rooms');
const housingGuestsElement = document.querySelector('#housing-guests');
const housingFeaturesContainerElement = document.querySelector('#housing-features');
const housingWiFiElement = document.querySelector('#filter-wifi');
const housingDishwasherElement = document.querySelector('#filter-dishwasher');
const housingParkingElement = document.querySelector('#filter-parking');
const housingWasherElement = document.querySelector('#filter-washer');
const housingElevatorElement = document.querySelector('#filter-elevator');
const housingConditionerElement = document.querySelector('#filter-conditioner');
let advData;

const mainMarker = setMainMarkerSettings();
const map = initMap();
const markerGroup = L.layerGroup().addTo(map);

mainMarker.addTo(map);
mainMarker.on('moveend', (evt) => {
  const coordinate = evt.target.getLatLng();
  coordinateElement.value = `${(coordinate.lat).toFixed(5)}; ${coordinate.lng.toFixed(5)}`;
});
renderMapElemens();

housingTypeElement.addEventListener('change', debounce(changeFilterHandler, RENDER_DELAY));
housingPriceElement.addEventListener('change', debounce(changeFilterHandler, RENDER_DELAY));
housingRoomsElement.addEventListener('change', debounce(changeFilterHandler, RENDER_DELAY));
housingGuestsElement.addEventListener('change', debounce(changeFilterHandler, RENDER_DELAY));
housingFeaturesContainerElement.addEventListener('change', debounce(changeFilterHandler, RENDER_DELAY));

function renderMapElemens() {
  getData().then((data) => {
    if (data) {
      advData = data;
      initMapState();
    }
  });
}

function getFilteredData(items) {
  return items.slice(0, 10);
}

function changeFilterHandler() {
  let resultData = [];
  markerGroup.clearLayers();
  const typeVal = housingTypeElement.value;
  const priceVal = housingPriceElement.value;
  const roomVal = housingRoomsElement.value;
  const guestVal = housingGuestsElement.value;
  const isWifi = housingWiFiElement.checked;
  const isDishwasher = housingDishwasherElement.checked;
  const isParking = housingParkingElement.checked;
  const isWasher = housingWasherElement.checked;
  const isElevator = housingElevatorElement.checked;
  const isConditioner = housingConditionerElement.checked;
  if (advData) {
    resultData = filterSelector(advData, typeVal, 'type');
    resultData = filterSelector(resultData, roomVal, 'rooms');
    resultData = filterSelector(resultData, guestVal, 'guests');
    resultData = filterPriceSelector(resultData, priceVal, 'price');
    resultData = filterFeatureSelector(resultData, isWifi, 'wifi');
    resultData = filterFeatureSelector(resultData, isDishwasher, 'dishwasher');
    resultData = filterFeatureSelector(resultData, isParking, 'parking');
    resultData = filterFeatureSelector(resultData, isWasher, 'washer');
    resultData = filterFeatureSelector(resultData, isElevator, 'elevator');
    resultData = filterFeatureSelector(resultData, isConditioner, 'conditioner');
    resultData = getFilteredData(resultData);
    addOrdinaryMarkersToMap(resultData);
  }
}

function filterPriceSelector(data, value) {
  if (value === 'middle') {
    return data.filter((item) => Number(item.offer.price) > 10000 && Number(item.offer.price) <= 50000);
  }
  if (value === 'low') {
    return data.filter((item) => Number(item.offer.price) <= 10000);
  }
  if (value === 'high') {
    return data.filter((item) => Number(item.offer.price) > 50000);
  }
  return data;
}

function filterSelector(data, value, fieldName) {
  if (value !== 'any') {
    return data.filter((item) => item.offer[fieldName].toString() === value);
  }
  return data;
}

function filterFeatureSelector(data, value, fieldName) {
  if (value) {
    return data.filter((item) => {
      if (item.offer.features) {
        return item.offer.features.includes(fieldName);
      }
    });
  }
  return data;
}

function setMainMarkerSettings() {
  const markerIcon = L.icon({
    iconUrl: './img/main-pin.svg',
    iconSize: [52, 52],
    iconAnchor: [26, 52],
  });
  const marker = L.marker({
    lng: CENTER_LNG,
    lat: CENTER_LAT
  },
  {
    draggable: true,
    icon: markerIcon
  },);
  return marker;
}

function initMap() {
  const card = L.map(mapElement)
    .on('load', () => {
      setActiveAdvertisementForm();
      coordinateElement.value = `${CENTER_LAT}; ${CENTER_LNG}`;
    })
    .setView({
      lng: CENTER_LNG,
      lat: CENTER_LAT,
    },
    10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(card);
  return card;
}

function addOrdinaryMarkersToMap(data) {
  const advertisementItems = data;
  const ordinaryIcon = L.icon({
    iconUrl: './img/pin.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  markerGroup.clearLayers();

  advertisementItems.forEach((advertisement) => {
    const lat = advertisement.location.lat;
    const lng = advertisement.location.lng;
    const ordinaryMarker = L.marker({
      lat,
      lng
    }, {
      ordinaryIcon
    });
    ordinaryMarker
      .addTo(markerGroup)
      .bindPopup(generateSimilarAdvertisement(advertisement));
  });
}

export function initMapState() {
  const filteredData = getFilteredData(advData);
  addOrdinaryMarkersToMap(filteredData);
  setActiveMapFilters();
}

export function setMarker() {
  mainMarker.setLatLng({
    lat: CENTER_LAT,
    lng: CENTER_LNG,
  });
}

export function setMapView() {
  map.setView({
    lng: CENTER_LNG,
    lat: CENTER_LAT,
  },
  10);
}

export function closeMapPopup() {
  map.closePopup();
}
