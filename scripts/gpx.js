export class Gpx { 
    constructor(map, routePoints) {
        this.map = map;
        this.routePoints = routePoints;
        this.addEventListeners();
    }

loadGpxRoute(event) {
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
                this.map.fitBounds(bounds);

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
                    calculateDistance(this.routePoints);
                }
            }).addTo(this.map);
        };
        reader.readAsText(file);
    } else {
        console.error("No file selected.");
    }
    };
    
    
exportToGPX(routePoints) {
    if (!Array.isArray(routePoints)) {
        console.error("Expected an array of route points.");
        alert("Trasa jest niepoprawna. Spróbuj ponownie.");
        return;
    }
    if (routePoints.length < 2) {
        alert("Trasa jest za krótka do eksportu!");
        return;
    }

    let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1" creator="LeafletJS">
        <trk>
        <name>Eksportowana Trasa</name>
        <trkseg>`;

    this.routePoints.forEach(pt => {
        if (pt && pt.lat && pt.lng) {
            gpxData += `<trkpt lat="${pt.lat}" lon="${pt.lng}"></trkpt>\n`;
        }
    });

    gpxData += `</trkseg></trk></gpx>`;

    let blob = new Blob([gpxData], { type: "application/gpx+xml" });

    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "route.gpx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    };
    
    addEventListeners() {
        const gpxUploadButton = document.getElementById("gpxUpload");
        gpxUploadButton.addEventListener("change", (event) => this.loadGpxRoute(event));

        const exportButton = document.getElementById("exportButton");
        exportButton.addEventListener("click", () => this.exportToGPX(this.routePoints));
    }
}

