import L from 'leaflet';
import 'leaflet-gpx';
import { Geolocation } from './geolocation.js';
import { Route } from './route.js';
import { RouteCreator } from './RouteCreator.js';


export class Map {
    map;
    geolocation;
    route;
    cretedRoute;
    init() {
        this.map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        this.geolocation = new Geolocation(this.map);
        this.route = new Route(this.map);
        this.createdRoute = new RouteCreator(this.map, this.geolocation);
    }
}

