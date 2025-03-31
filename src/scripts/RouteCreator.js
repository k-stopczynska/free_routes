let latitude;
let longitude;

const calculateDestination = (lat1, lon1, distance, bearing) => {
            const R = 6371000;
            const rad = Math.PI / 180;
            const lat1Rad = lat1 * rad;
            const lon1Rad = lon1 * rad;
            const bearingRad = bearing * rad;

            const lat2 = Math.asin(Math.sin(lat1Rad) * Math.cos(distance / R) + Math.cos(lat1Rad) * Math.sin(distance / R) * Math.cos(bearingRad));
    const lon2 = lon1Rad + Math.atan2(Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1Rad), Math.cos(distance / R) - Math.sin(lat1Rad) * Math.sin(lat2));
    console.log(lat2 * (180 / Math.PI), lon2 * (180 / Math.PI));

            return {
                latitude: lat2 * (180 / Math.PI),
                longitude: lon2 * (180 / Math.PI)
            };
        }

export const generateRoute = async (latitude, longitude, map) => {
    const targetDistance = 10000;

    let pointB = calculateDestination(latitude, longitude, 2000, 90);
    
    let foundRoute = false;
    let data = null;
            

    while (!foundRoute) {
        const coordinates = [
            [longitude, latitude],
            [pointB.longitude, pointB.latitude]
        ];

        const data = {
            coordinates: coordinates,
            alternative_routes: { target_count: 2, weight_factor: 5, share_factor: 0.2 },
            preference: 'recommended',
            profileName: 'driving-car',
            geometry: true,
            instructions: true,
            language: 'en',
            units: 'm'
        };

        const baseUrl = import.meta.env.VITE_BASE_URL;
        const mode = 'driving-car';
        const format = 'geojson';
        const request = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
            method: 'POST',
            headers: {
                'Authorization': import.meta.env.VITE_ORS_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        const response = await request.json();
        let routeData;
        const dist = response.features[0].properties.summary.distance;
        if (dist && dist > 0) {
            const routeLength = dist;
            console.log(`Route length: ${routeLength} meters`);

            if (Math.abs(routeLength - targetDistance) <= 500) {
                foundRoute = true;
                routeData = response.features;
                console.log(response.features);
            } else {
                // there should be used the distance between the user geolocation and point B instead of dist
                pointB = calculateDestination(latitude, longitude, dist + 800, 90);
                console.log(`Trying new Point B: ${pointB.latitude}, ${pointB.longitude}`);
            }
        } else {
            console.error('No route found in response.');
            break;
        }
            
        if (routeData && routeData[0].geometry) {
            const isochroneGeoJsonThere = routeData[0].geometry;
            const isochroneGeoJsonBack = routeData[1].geometry;

            L.geoJSON(isochroneGeoJsonThere, {
                style: {
                    color: 'green',
                    weight: 2,
                    opacity: 0.7
                }
            }).addTo(map);
            L.geoJSON(isochroneGeoJsonBack, {
                style: {
                    color: 'red',
                    weight: 2,
                    opacity: 0.7
                }
            }).addTo(map);
        }
    }
}