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
let polyline = L.polyline([], { color: 'blue', weight: 4 }).addTo(map);

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
    distanceElement.textContent = `Długość trasy: ${distance/1000} kilometrów`;
}

map.on("click", drawRoute);