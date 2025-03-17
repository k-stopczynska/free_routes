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

