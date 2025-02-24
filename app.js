const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);



const onSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    const marker = L.marker([latitude, longitude]).addTo(map); 
    const accuracy = position.coords.accuracy;
    const circle = L.circle([latitude, longitude], { radius: accuracy, fillOpacity: 0 }).addTo(map);
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

navigator.geolocation.watchPosition(onSuccess, onError);

let routePoints = [];
const savedRoutes = JSON.parse(localStorage.getItem('routes')) || {};
const polyline = L.polyline([], { color: 'blue', weight: 4 }).addTo(map);


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

const calculateDistance = (points) => {
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
    distance += points[i - 1].distanceTo(points[i]); 
    }
    return distance;
}

const drawRoute = (e) => {
    let latlng = e.latlng;
    routePoints.push(latlng);
    L.marker(latlng).addTo(map);
    polyline.setLatLngs(routePoints);
    const distance = calculateDistance(routePoints);
    const distanceElement = document.getElementById('distance');
    distanceElement.textContent = `Długość trasy: ${(distance/1000).toFixed(2)} kilometrów`;

}

map.on("click", drawRoute);

const saveRoute = () => {
    const name = document.getElementById('routeName').value;
    if (!name) {
        alert("Podaj nazwę trasy!");
        return;
    }
    savedRoutes[name] = {route: [...routePoints], distance: calculateDistance(routePoints)};
    localStorage.setItem('routes', JSON.stringify(savedRoutes));
    updateRouteList();
    alert(`Trasa "${name}" zapisana!`);
    resetMap();
}

const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', saveRoute);

function resetMap() {
    routePoints = [];
    polyline.setLatLngs([]); 
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    navigator.geolocation.watchPosition(onSuccess, onError);
}

const loadRoute = (name) => {
    if (!name) {
        resetMap();
        return;
    }
    if (!savedRoutes[name]) return;

    routePoints = savedRoutes[name].route;
    polyline.setLatLngs(routePoints);
    map.fitBounds(polyline.getBounds());
}

const loadedRoutes = document.getElementById("savedRoutes");
loadedRoutes.addEventListener("change", (e) => loadRoute(e.target.value));

const exportToGPX = () => {
    if (routePoints.length < 2) {
        alert("Trasa jest za krótka do eksportu!");
        return;
    }
    
    let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="LeafletJS">
<trk><name>Eksportowana Trasa</name><trkseg>`;

    routePoints.forEach(pt => {
        gpxData += `<trkpt lat="${pt.lat}" lon="${pt.lng}"></trkpt>\n`;
    });

    gpxData += `</trkseg></trk></gpx>`;

    let blob = new Blob([gpxData], { type: "application/gpx+xml" });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "route.gpx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

const exportButton = document.getElementById("exportButton");
exportButton.addEventListener("click", exportToGPX);

const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", resetMap);