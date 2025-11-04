const map = L.map('map').setView([0, 0], 2); // temporary view until GPS found

// Replace with your Geoapify API key for tiles (safe to expose)
const tileApiKey = "b7e5e6167d1643dfaf4f31e8ebd72599";

L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${tileApiKey}`, {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, © Geoapify',
  maxZoom: 20
}).addTo(map);

let startCoords = null; // will store user's current location
let routeLayer = null;

// Get user's current location on page load
navigator.geolocation.getCurrentPosition(
  pos => {
    startCoords = [pos.coords.latitude, pos.coords.longitude];
    map.setView(startCoords, 13);
    L.marker(startCoords).addTo(map).bindPopup("📍 You are here").openPopup();
  },
  err => {
    alert("Unable to get your location. Please enable GPS.");
    console.error(err);
  }
);

document.getElementById('getRoute').addEventListener('click', async () => {
  const endInput = document.getElementById('end').value.trim();
  if (!endInput) {
    alert("Please enter destination coordinates!");
    return;
  }

  if (!startCoords) {
    alert("Waiting for your location...");
    return;
  }

  const [endLat, endLng] = endInput.split(',').map(Number);
  if (isNaN(endLat) || isNaN(endLng)) {
    alert("Invalid destination coordinates. Use format: latitude,longitude");
    return;
  }

  try {
    // Call PHP backend
    const response = await fetch(`route.php?start=${startCoords[0]},${startCoords[1]}&end=${endLat},${endLng}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      alert("No route found!");
      return;
    }

    // Remove previous route if exists
    if (routeLayer) map.removeLayer(routeLayer);

    // Draw new route
    const coords = data.features[0].geometry.coordinates[0].map(c => [c[1], c[0]]);
    routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
    map.fitBounds(routeLayer.getBounds());
  } catch (err) {
    console.error(err);
    alert("Failed to fetch route. Check console for details.");
  }
});
