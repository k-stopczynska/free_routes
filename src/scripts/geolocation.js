import L from 'leaflet';
import 'leaflet-gpx';

export class Geolocation { 
    constructor(map) {
        this.map = map;
        navigator.geolocation.getCurrentPosition(this.onSuccess.bind(this), this.onError.bind(this));
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

onSuccess(position) {
    const { latitude, longitude } = position.coords;
    const marker = L.marker([latitude, longitude]).addTo(this.map);
    const accuracy = position.coords.accuracy;
    const circle = L.circle([latitude, longitude], { radius: accuracy, fillOpacity: 0, color: "#f74d19" }).addTo(this.map);
    circle.color = "transparent";
    this.map.fitBounds(circle.getBounds());
    return [latitude, longitude];
};

onError(error) {
    if (error.code === 1) {
        alert("You have to enable geolocation in order to customize your map");
    } else { 
        alert("Something went wrong, we cannot establish your location");
    } 
    };
}
