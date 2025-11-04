// route.js

const map = L.map('map').setView([14.5995, 120.9842], 12);

// ✅ Replace with your actual Geoapify key (safe for tiles)
const tileApiKey = "b7e5e6167d1643dfaf4f31e8ebd72599";

L.tileLayer(`https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${tileApiKey}`, {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, © Geoapify',
  maxZoom: 20
}).addTo(map);

let routeLayer;

document.getElementById('getRoute').addEventListener('click', async () => {
  const startInput = document.getElementById('start').value.trim();
  const endInput = document.getElementById('end').value.trim();

  if (!startInput || !endInput) {
    alert("Please enter both Start and End coordinates!");
    return;
  }

  const [startLat, startLng] = startInput.split(',').map(Number);
  const [endLat, endLng] = endInput.split(',').map(Number);

  if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
    alert("Invalid coordinates. Use format: latitude,longitude");
    return;
  }

  try {
    // ✅ Call PHP backend to hide API key
    const response = await fetch(`route.php?start=${startLat},${startLng}&end=${endLat},${endLng}`);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      alert("No route found!");
      return;
    }

    // Clear old route
    if (routeLayer) map.removeLayer(routeLayer);

    // Draw route
    const coords = data.features[0].geometry.coordinates[0].map(c => [c[1], c[0]]);
    routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);

    map.fitBounds(routeLayer.getBounds());
  } catch (err) {
    console.error(err);
    alert("Failed to fetch route. Check console for details.");
  }
});
