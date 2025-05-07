const map = L.map('map', {
    center: listingData.coordinates,
    zoom: 13,
    layers: []
  });
  
  // Define both layers
  const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  });
  
  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  });
  
  // Set default to street
  streetLayer.addTo(map);
  let currentLayer = 'street';
  
  // Add marker
  L.marker(listingData.coordinates).addTo(map)
    .bindPopup(`${listingData.title}<br><p>Exact location will be provided after booking</p>`)
    .openPopup();
  
  // Custom control for layer toggle
  const toggleControl = L.Control.extend({
    options: { position: 'topright' },
  
    onAdd: function () {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
      container.innerHTML = '🛰️'; // initial icon is for switching to satellite
      container.style.backgroundColor = 'transparent';
      container.style.width = '30px';
      container.style.height = '30px';
      container.style.lineHeight = '30px';
      container.style.textAlign = 'center';
      container.style.cursor = 'pointer';
      container.style.fontSize = '18px';
      container.style.color = 'white';
      container.style.background = 'rgb(255, 255, 255)';
      container.style.borderRadius = '5px';
  
      container.onclick = function () {
        if (currentLayer === 'street') {
          map.removeLayer(streetLayer);
          satelliteLayer.addTo(map);
          map.setZoom(14);
          container.innerHTML = '🗺️';
          currentLayer = 'satellite';
        } else {
          map.removeLayer(satelliteLayer);
          streetLayer.addTo(map);
          map.setZoom(13);
          container.innerHTML = '🛰️';
          currentLayer = 'street';
        }
      };
  
      return container;
    }
  });
  
  map.addControl(new toggleControl());  