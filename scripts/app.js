import { Map } from './Map.js';

const map = new Map();
map.init();

// let latitude;
// let longitude;

// const calculateDestination = (lat1, lon1, distance, bearing) => {
//             const R = 6371000;
//             const rad = Math.PI / 180;
//             const lat1Rad = lat1 * rad;
//             const lon1Rad = lon1 * rad;
//             const bearingRad = bearing * rad;

//             const lat2 = Math.asin(Math.sin(lat1Rad) * Math.cos(distance / R) + Math.cos(lat1Rad) * Math.sin(distance / R) * Math.cos(bearingRad));
//     const lon2 = lon1Rad + Math.atan2(Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1Rad), Math.cos(distance / R) - Math.sin(lat1Rad) * Math.sin(lat2));
//     console.log(lat2 * (180 / Math.PI), lon2 * (180 / Math.PI));

//             return {
//                 latitude: lat2 * (180 / Math.PI),
//                 longitude: lon2 * (180 / Math.PI)
//             };
//         }

// const generateRoute = async () => {
//     const targetDistance = 10000;

//     let pointB = calculateDestination(latitude, longitude, 2000, 90);
    
//     let foundRoute = false;
//     let data = null;
            

//     while (!foundRoute) {
//         const coordinates = [
//             [longitude, latitude],
//             [pointB.longitude, pointB.latitude]
//         ];


//         const data = {
//         coordinates: coordinates,
//         alternative_routes:{target_count:2,weight_factor:5,share_factor:0.2},
//         preference: 'recommended',
//         profileName: 'driving-car',
//         geometry: true,
//         instructions: true,
//         language: 'en',
//         units: 'm'
//     };
//     console.log(data);
//     const request = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
//     method: 'POST',
//         headers: {
//         'Authorization': 'api_key',
//         'Content-Type': 'application/json',
//         'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
//     },
//     body: JSON.stringify(data)
// });
//     const response = await request.json();
//         console.log(response);
//         const dist = response.features[0].properties.summary.distance;
//         console.log(dist)
//                 // there is no property routes in the response
//                  if (dist && dist > 0) {
//                         const routeLength = dist;
//                         console.log(`Route length: ${routeLength} meters`);

//                         if (Math.abs(routeLength - targetDistance) <= 500) {
//                             foundRoute = true;
//                             data = response.routes[0];
//                             console.log(data);
//                         } else {
//                             pointB = calculateDestination(latitude, longitude, pointBDistance + 8000, 90);
//                             console.log(`Trying new Point B: ${pointB.latitude}, ${pointB.longitude}`);
//                         }
//                     } else {
//                         console.error('No route found in response.');
//                         break;
//                     }
//             }

//                 if (response.features && response.features[0].geometry) {
//                     const isochroneGeoJsonThere = response.features[0].geometry;
//                     const isochroneGeoJsonBack = response.features[1].geometry;

//                 L.geoJSON(isochroneGeoJsonThere, {
//                     style: {
//                         color: 'green',
//                         weight: 2,
//                         opacity: 0.7
//                     }
//                 }).addTo(map);
//                 L.geoJSON(isochroneGeoJsonBack, {
//                     style: {
//                         color: 'red',
//                         weight: 2,
//                         opacity: 0.7
//                     }
//                 }).addTo(map);
//             }
// }