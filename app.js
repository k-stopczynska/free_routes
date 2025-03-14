const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



const onSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    const marker = L.marker([latitude, longitude]).addTo(map); 
    const accuracy = position.coords.accuracy;
    const circle = L.circle([latitude, longitude], { radius: accuracy, fillOpacity: 0, color: "#f74d19" }).addTo(map);
    circle.color = "transparent";
    
    map.fitBounds(circle.getBounds());
}

const onError = (error) => {
    if (error.code === 1) {
        alert("You have to enable geolocation in order to customize your map");
    } else { 
        alert("Something went wrong, we cannot establish your location");
    } 
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

let routePoints = [];
let circleMarkers = [];
let distance = 0;
const savedRoutes = JSON.parse(localStorage.getItem('routes')) || {};
const polyline = L.polyline([], { color: '#f74d19', weight: 4 }).addTo(map);


const updateRouteList = () => {
    const select = document.getElementById('savedRoutes');
    select.innerHTML = '<option value="">Wybierz trasę</option>';
    Object.entries(savedRoutes).forEach(([name, data]) => {
        const option = document.createElement('option');
        option.value = name;
        if (data.distance) {
            option.innerText = name + ' ' + (data.distance/1000).toFixed(2) + 'km';
        } else { option.innerText = name}
        
        select.appendChild(option);
    });
}

updateRouteList();

const renderDistance = (distance) => { 
    const distanceElement = document.getElementById('distance');
    distanceElement.textContent = `Długość trasy: ${(distance/1000).toFixed(2)} kilometrów`;
}

const calculateDistance = (points) => {
    distance = 0;
    for (let i = 1; i < points.length; i++) {
    distance += points[i - 1].distanceTo(points[i]); 
    }
    renderDistance(distance);
    return distance;
}

const drawRoute = (e) => {
    let latlng = e.latlng;
    routePoints.push(latlng);
    const circleMarker = L.circleMarker(latlng, { color: '#f74d19', fillColor: '#f74d19', fillOpacity: 0.7, radius: 4 }).addTo(map);
    circleMarkers.push(circleMarker);
    polyline.setLatLngs(routePoints);
    calculateDistance(routePoints);
}

const undoLastSegment = () => {
    if (routePoints.length === 0) return;
    routePoints.pop();
    const lastMarker = circleMarkers.pop();
    map.removeLayer(lastMarker);
    polyline.setLatLngs(routePoints);
    calculateDistance(routePoints);
}

map.on("click", drawRoute);

const saveRoute = () => {
    const nameInput = document.getElementById('routeName');
    let name = nameInput.value.trim();
    if (!name) {
        alert("Podaj nazwę trasy!");
        return;
    }
    savedRoutes[name] = {route: [...routePoints], distance: calculateDistance(routePoints)};
    localStorage.setItem('routes', JSON.stringify(savedRoutes));
    updateRouteList();
    alert(`Trasa "${name}" zapisana!`);
    nameInput.value = '';
    resetMap();
}

const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', saveRoute);

function resetMap() {
    routePoints = [];
    circleMarkers.forEach(marker => {
        map.removeLayer(marker);
    });
    circleMarkers = [];
    polyline.setLatLngs([]); 
    map.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.circleMarker) {
            map.removeLayer(layer);
        }
    });
    calculateDistance(routePoints);
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

const loadRoute = (name) => {
    if (!name) {
        resetMap();
        return;
    }
    if (!savedRoutes[name]) return;
    if (savedRoutes[name].route) {
        routePoints = savedRoutes[name].route;
    } else {routePoints = savedRoutes[name]; }
    
    polyline.setLatLngs(routePoints);
    renderDistance(savedRoutes[name].distance);
    map.fitBounds(polyline.getBounds());
}

const loadedRoutes = document.getElementById("savedRoutes");
loadedRoutes.addEventListener("change", (e) => loadRoute(e.target.value));

const loadGpxRoute = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const gpxData = e.target.result;

            const gpxLayer = new L.GPX(gpxData, {
                async: true,
                marker_options: {
                    startIconUrl: "",
                    endIconUrl: "",
                    shadowUrl: ""
                },
                    polyline_options: {
                    color: '#f74d19',        
                    weight: 4,           
                    opacity: 0.7        
                }
            }).on("loaded", function (event) {

                const bounds = event.target.getBounds();
                map.fitBounds(bounds);

                routePoints = [];

                const gpxData = event.target._gpx;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(gpxData, "application/xml");
                const trackPoints = xmlDoc.getElementsByTagName("trkpt");

                Array.from(trackPoints).forEach((point) => {
                    const lat = parseFloat(point.getAttribute("lat"));
                    const lon = parseFloat(point.getAttribute("lon"));
                    routePoints.push(new L.LatLng(lat, lon));
                });
                if (routePoints.length === 0) {
                    console.error("No route points found in the GPX file.");
                } else {
                    console.log("Loaded Route Points: ", routePoints);
                    routePoints.forEach((latLng) => {
                        L.circleMarker(latLng, {
                            color: '#f74d19',
                            radius: 4,
                            fillOpacity: 0.7
                        }).addTo(map);
                });
                    calculateDistance(routePoints);
                }

            }).addTo(map);
        };
        reader.readAsText(file);
    } else {
        console.error("No file selected.");
    }
};

const gpxUploadButton = document.getElementById("gpxUpload");
gpxUploadButton.addEventListener("change", (event) => loadGpxRoute(event));


const exportToGPX = (routePoints) => {
        if (!Array.isArray(routePoints)) {
        console.error("Expected an array of route points.");
        alert("Trasa jest niepoprawna. Spróbuj ponownie.");
        return;
    }
    if (routePoints.length < 2) {
        alert("Trasa jest za krótka do eksportu!");
        return;
    }

    let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="LeafletJS">
  <trk>
    <name>Eksportowana Trasa</name>
    <trkseg>`;

    routePoints.forEach(pt => {
        if (pt && pt.lat && pt.lng) {
            gpxData += `<trkpt lat="${pt.lat}" lon="${pt.lng}"></trkpt>\n`;
        }
    });

    gpxData += `</trkseg></trk></gpx>`;

    let blob = new Blob([gpxData], { type: "application/gpx+xml" });

    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "route.gpx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    resetMap();
};


const exportButton = document.getElementById("exportButton");
exportButton.addEventListener("click", () => exportToGPX(routePoints));

const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", resetMap);

const undoButton = document.getElementById("undoButton");
undoButton.addEventListener("click", undoLastSegment);