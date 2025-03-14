// geolocation.js
export const onSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    const marker = L.marker([latitude, longitude]).addTo(map); 
    const accuracy = position.coords.accuracy;
    const circle = L.circle([latitude, longitude], { radius: accuracy, fillOpacity: 0, color: "#f74d19" }).addTo(map);
    circle.color = "transparent";
    map.fitBounds(circle.getBounds());
};

export const onError = (error) => {
    if (error.code === 1) {
        alert("You have to enable geolocation in order to customize your map");
    } else { 
        alert("Something went wrong, we cannot establish your location");
    } 
};
