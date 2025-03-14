// utils.js
export const renderDistance = (distance) => { 
    const distanceElement = document.getElementById('distance');
    distanceElement.textContent = `Długość trasy: ${(distance / 1000).toFixed(2)} kilometrów`;
};

export const calculateDistance = (points) => {
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
        distance += points[i - 1].distanceTo(points[i]);
    }
    renderDistance(distance);
    return distance;
};

export const exportToGPX = (routePoints) => {
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

    routePoints.forEach(pt => {
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
