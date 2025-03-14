// gpx.js
export const loadGpxRoute = (event) => {
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

                let routePoints = [];

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
