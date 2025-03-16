
import { onSuccess, onError } from './geolocation.js';
import { updateRouteList, drawRoute, undoLastSegment, saveRoute, loadRoute, resetMap } from './route.js';
import { exportToGPX } from './utils.js';
import { loadGpxRoute } from './gpx.js';


const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

navigator.geolocation.getCurrentPosition(onSuccess, onError);

map.on("click", drawRoute);

const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', saveRoute);

const loadedRoutes = document.getElementById("savedRoutes");
loadedRoutes.addEventListener("change", (e) => loadRoute(e.target.value));

const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", resetMap);

const undoButton = document.getElementById("undoButton");
undoButton.addEventListener("click", undoLastSegment);

const gpxUploadButton = document.getElementById("gpxUpload");
gpxUploadButton.addEventListener("change", (event) => loadGpxRoute(event));

const exportButton = document.getElementById("exportButton");
exportButton.addEventListener("click", () => exportToGPX(routePoints));