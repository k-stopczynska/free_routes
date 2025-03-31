export const renderDistance = (distance) => { 
    const distanceElement = document.getElementById('distance');
    distanceElement.innerHTML = `${(distance / 1000).toFixed(2)} km`;
};

export const calculateDistance = (points) => {
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
        distance += points[i - 1].distanceTo(points[i]);
    }
    renderDistance(distance);
    return distance;
};