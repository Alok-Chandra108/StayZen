const map = L.map('map', {
    center: [26.7606, 83.3732],
    zoom: 12,
}).addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));