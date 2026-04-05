const map = L.map('map', {
    center: listingData.coordinates,
    zoom: 13,
    scrollWheelZoom: false,
    attributionControl: false
});

// Using Standard OSM with NO FILTERS for stability
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Simplified Custom Marker (Removed "Extra Text")
const brutalIcon = L.divIcon({
    className: 'brutal-marker',
    html: `
        <div class="brutal-marker-tag">
            ₹ ${listingData.price.toLocaleString("en-IN")}
        </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
});

// Add Marker
const marker = L.marker(listingData.coordinates, { icon: brutalIcon }).addTo(map);

// Pop-up for the rest of the info
marker.bindPopup(`
    <div style="text-align: center; font-family: 'Space Grotesk', sans-serif;">
        <h5 style="font-weight: 900; margin-bottom: 5px; text-transform: uppercase;">${listingData.title}</h5>
        <p style="margin: 0; font-weight: 600;">${listingData.location}</p>
        <hr style="margin: 10px 0; border-top: 3px solid black;">
        <small style="font-weight: 800; color: #FF5722;">EXACT LOCATION PROVIDED AT BOOKING</small>
    </div>
`, {
    offset: [0, -40]
});

// Auto-open
marker.openPopup();

// Critical Fix for Alignment/Blank space
map.whenReady(() => {
    setTimeout(() => {
        map.invalidateSize();
        map.setView(listingData.coordinates, 13, { animate: true });
    }, 800);
});