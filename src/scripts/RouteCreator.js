export class RouteCreator { 

    map;
    geolocation;
    targetDistance;
    direction;
    routeType;
    foundRoute = false;

    constructor(map, geolocation) { 
        this.map = map;
        this.geolocation = geolocation;
        this.addEventListeners();
    }

    calculateDestination(lat1, lon1, distance, bearing) {
            const R = 6371000;
            const rad = Math.PI / 180;
            const lat1Rad = lat1 * rad;
            const lon1Rad = lon1 * rad;
            const bearingRad = bearing * rad;

            const lat2 = Math.asin(Math.sin(lat1Rad) * Math.cos(distance / R) + Math.cos(lat1Rad) * Math.sin(distance / R) * Math.cos(bearingRad));
            const lon2 = lon1Rad + Math.atan2(Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1Rad), Math.cos(distance / R) - Math.sin(lat1Rad) * Math.sin(lat2));

            return {
                latitude: lat2 * (180 / Math.PI),
                longitude: lon2 * (180 / Math.PI)
            };
    }

    getUsersParameters() { 
        this.targetDistance = +document.getElementById('routeDistance').value;
        this.direction = +document.getElementById('routeDirection').value;   
        this.routeType = document.getElementById('routeType').value;
    }

    async fetchData(coordinates) {
        console.log(coordinates)
        const data = {
            coordinates: coordinates,
            alternative_routes: { target_count: 3, weight_factor: 5, share_factor: 0.5 },
            preference: 'recommended',
            profileName: this.routeType,
            geometry: true,
            instructions: true,
            language: 'en',
            units: 'm'
        };
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const mode = this.routeType;
        const format = 'geojson';
        try { 
        const request = await fetch(`${baseUrl}${mode}/${format}`, {
            method: 'POST',
            headers: {
                'Authorization': import.meta.env.VITE_ORS_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            body: JSON.stringify(data)
        });
            const response = await request.json();
            return response;
        } catch(error) {
            console.error('No route found in response.', error);
        }
    }

    recalculatePointB() { 
        //if the distance is not within bounds, recalculate new point B
        //if the distance is less then target distance, just add to dist
        //if the distance is 2km greater than target distance, change bearing
    }

    drawRoute(routeData) { 
        const isochroneGeoJsonThere = routeData[0].geometry;
        const isochroneGeoJsonBack = routeData[1].geometry;

            L.geoJSON(isochroneGeoJsonThere, {
                style: {
                    color: 'green',
                    weight: 2,
                    opacity: 0.7
                }
            }).addTo(this.map);
            L.geoJSON(isochroneGeoJsonBack, {
                style: {
                    color: 'red',
                    weight: 2,
                    opacity: 0.7
                }
            }).addTo(this.map);
    }
    
    async generateRoute() {

        const position = await this.geolocation.getCurrentPosition();
        const { latitude, longitude } = position.coords;
        let pointB = this.calculateDestination(latitude, longitude, 2000, this.direction);
            
        while (!this.foundRoute) {
            const coordinates = [
                [longitude, latitude],
                [pointB.longitude, pointB.latitude]
            ];
            const response = await this.fetchData(coordinates);
            let routeData;
            if (response.features.length > 1) {
                const dist = response.features[0].properties.summary.distance + response.features[1].properties.summary.distance;
                if (dist && dist > 0) {
                    const routeLength = dist;
                    console.log(`Route length: ${routeLength} meters`);
                    console.log(Math.abs(routeLength - this.targetDistance))
                    if (Math.abs(routeLength - this.targetDistance) <= 1000) {
                        this.foundRoute = true;
                        routeData = response.features;
                        console.log('Valid route found:', response.features);
                    }
                    else if (routeLength < this.targetDistance) {
                        pointB = this.calculateDestination(latitude, longitude, dist + 100, this.direction);
                        console.log(`Route too short. Trying new Point B: ${pointB.latitude}, ${pointB.longitude}`);
                    }
                    else if (Math.abs(routeLength - this.targetDistance) >= 1500) {
                        this.direction += 20;
                        console.log(this.direction);
                        pointB = this.calculateDestination(latitude, longitude, 2000, this.direction);
                        console.log(pointB.latitude, pointB.longitude);
                        console.log(`Route too long. Trying new Point B with a different bearing: ${pointB.latitude}, ${pointB.longitude}`);
                    }
                }
                else {
                    console.error('No route found in response.');
                    break;
                }
        
            } else { 
                this.direction += 20;
                console.log(this.direction);
                pointB = this.calculateDestination(latitude, longitude, 2100, this.direction);
                console.log(pointB.latitude, pointB.longitude);
                console.log(`insufficient data length. Trying new Point B with a different bearing and dist: ${pointB.latitude}, ${pointB.longitude}`);
            }
            if (routeData && routeData[0].geometry && routeData[1].geometry) {
                this.drawRoute(routeData);
            }
    }
    }
    
    addEventListeners() { 
    document.getElementById('generateRoute').addEventListener('click', () => {
    document.getElementById('routeModal').style.display = "block";
});

    document.getElementsByClassName('close')[0].addEventListener('click', () => {
    document.getElementById('routeModal').style.display = "none";
});

    document.getElementById('generateRouteInModalButton').addEventListener('click', async (e) => {
        e.preventDefault();
        this.getUsersParameters(e);
        await this.generateRoute();
        document.getElementById('routeModal').style.display = "none";
    });
    }
}

