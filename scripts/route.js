// route.js
import { calculateDistance, renderDistance } from './utils.js';
import { Gpx } from './Gpx.js';


export class Route {
    map;
    routePoints;
    circleMarkers;
    distance;
    savedRoutes;
    polyline;
    gpx;

    constructor(map) {
        this.map = map;
        this.routePoints = [];
        this.circleMarkers = [];
        this.distance = 0;
        this.savedRoutes = JSON.parse(localStorage.getItem('routes')) || {};
        this.polyline = L.polyline([], { color: '#f74d19', weight: 4 }).addTo(this.map);
        this.addEventListeners();  
        this.updateRouteList();
        this.gpx = new Gpx(this.map, this.routePoints);
    }

updateRouteList() {
    const select = document.getElementById('savedRoutes');
    select.innerHTML = '<option value="">Wybierz trasę</option>';
    Object.entries(this.savedRoutes).forEach(([name, data]) => {
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
    
drawRoute(e) {
    let latlng = e.latlng;
    this.routePoints.push(latlng);
    const circleMarker = L.circleMarker(latlng, { color: '#f74d19', fillColor: '#f74d19', fillOpacity: 0.7, radius: 4 }).addTo(this.map);
    this.circleMarkers.push(circleMarker);
    this.polyline.setLatLngs(this.routePoints);
    calculateDistance(this.routePoints);
    };
    
undoLastSegment() {
    if (this.routePoints.length === 0) return;
    this.routePoints.pop();
    const lastMarker = this.circleMarkers.pop();
    this.map.removeLayer(lastMarker);
    this.polyline.setLatLngs(this.routePoints);
    calculateDistance(this.routePoints);
    };
    
 saveRoute() {
    const nameInput = document.getElementById('routeName');
    let name = nameInput.value.trim();
    if (!name) {
        alert("Podaj nazwę trasy!");
        return;
    }
    this.savedRoutes[name] = { route: [...this.routePoints], distance: calculateDistance(this.routePoints) };
    localStorage.setItem('routes', JSON.stringify(this.savedRoutes));
    this.updateRouteList();
    alert(`Trasa "${name}" zapisana!`);
    nameInput.value = '';
    this.resetMap();
    };
    
loadRoute(name) {
    if (!name) {
        this.resetMap();
        return;
    }
    if (!this.savedRoutes[name]) return;
    this.routePoints = this.savedRoutes[name].route || this.savedRoutes[name];
    this.polyline.setLatLngs(this.routePoints);
    renderDistance(this.savedRoutes[name].distance);
    this.map.fitBounds(this.polyline.getBounds());
    };
    
    resetMap() {
    this.routePoints = [];
    this.circleMarkers.forEach(marker => this.map.removeLayer(marker));
    this.circleMarkers = [];
    this.polyline.setLatLngs([]);
    this.map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.circleMarker) {
            this.map.removeLayer(layer);
        }
    });
        
        calculateDistance(this.routePoints);
        //TODO: figure out how to pass onSuccess and onError
    //navigator.geolocation.getCurrentPosition(onSuccess, onError);
    };
    
    addEventListeners() {
        const saveButton = document.getElementById('saveButton');
        saveButton.addEventListener('click', this.saveRoute.bind(this));

        const loadedRoutes = document.getElementById("savedRoutes");
        loadedRoutes.addEventListener("change", (e) => this.loadRoute(e.target.value));

        const resetButton = document.getElementById("resetButton");
        resetButton.addEventListener("click", this.resetMap.bind(this));

        const undoButton = document.getElementById("undoButton");
        undoButton.addEventListener("click", this.undoLastSegment.bind(this));

        this.map.on("click",(e) => this.drawRoute(e));
    }
}
