import L from 'leaflet';
import 'leaflet-gpx';
import { generateRoute } from './RouteCreator.js';
export class Geolocation { 
    constructor(map) {
        this.map = map;
        navigator.geolocation.getCurrentPosition(this.onSuccess.bind(this), this.onError.bind(this));
    }

onSuccess(position) {
    const { latitude, longitude } = position.coords;
    generateRoute(latitude, longitude, this.map);
    const marker = L.marker([latitude, longitude]).addTo(this.map);
    const accuracy = position.coords.accuracy;
    const circle = L.circle([latitude, longitude], { radius: accuracy, fillOpacity: 0, color: "#f74d19" }).addTo(this.map);
    circle.color = "transparent";
    this.map.fitBounds(circle.getBounds());
};

onError(error) {
    if (error.code === 1) {
        alert("You have to enable geolocation in order to customize your map");
    } else { 
        alert("Something went wrong, we cannot establish your location");
    } 
    };
}
