// route.js
import { calculateDistance, renderDistance } from './utils.js';

let routePoints = [];
let circleMarkers = [];
let distance = 0;
const savedRoutes = JSON.parse(localStorage.getItem('routes')) || {};
const polyline = L.polyline([], { color: '#f74d19', weight: 4 }).addTo(map);

export const updateRouteList = () => {
    const select = document.getElementById('savedRoutes');
    select.innerHTML = '<option value="">Wybierz trasę</option>';
    Object.entries(savedRoutes).forEach(([name, data]) => {
        const option = document.createElement('option');
        option.value = name;
        if (data.distance) {
            option.innerText = name + ' ' + (data.distance / 1000).toFixed(2) + 'km';
        } else {
            option.innerText = name;
        }
        select.appendChild(option);
    });
};

export const drawRoute = (e) => {
    let latlng = e.latlng;
    routePoints.push(latlng);
    const circleMarker = L.circleMarker(latlng, { color: '#f74d19', fillColor: '#f74d19', fillOpacity: 0.7, radius: 4 }).addTo(map);
    circleMarkers.push(circleMarker);
    polyline.setLatLngs(routePoints);
    calculateDistance(routePoints);
};

export const undoLastSegment = () => {
    if (routePoints.length === 0) return;
    routePoints.pop();
    const lastMarker = circleMarkers.pop();
    map.removeLayer(lastMarker);
    polyline.setLatLngs(routePoints);
    calculateDistance(routePoints);
};

export const saveRoute = () => {
    const nameInput = document.getElementById('routeName');
    let name = nameInput.value.trim();
    if (!name) {
        alert("Podaj nazwę trasy!");
        return;
    }
    savedRoutes[name] = { route: [...routePoints], distance: calculateDistance(routePoints) };
    localStorage.setItem('routes', JSON.stringify(savedRoutes));
    updateRouteList();
    alert(`Trasa "${name}" zapisana!`);
    nameInput.value = '';
    resetMap();
};

export const loadRoute = (name) => {
    if (!name) {
        resetMap();
        return;
    }
    if (!savedRoutes[name]) return;
    routePoints = savedRoutes[name].route || savedRoutes[name];
    polyline.setLatLngs(routePoints);
    renderDistance(savedRoutes[name].distance);
    map.fitBounds(polyline.getBounds());
};

export const resetMap = () => {
    routePoints = [];
    circleMarkers.forEach(marker => map.removeLayer(marker));
    circleMarkers = [];
    polyline.setLatLngs([]);
    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.circleMarker) {
            map.removeLayer(layer);
        }
    });
    calculateDistance(routePoints);
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
};
