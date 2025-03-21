
import { Geolocation } from './geolocation.js';
import { Route } from './route.js';


export class Map {
    map;
    geolocation;
    route;
    init() {
        this.map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        this.geolocation = new Geolocation(this.map);
        this.route = new Route(this.map);
    }
}

