/* eslint-disable */
export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // interactive: false
    });

    //alternative

    const locations = JSON.parse(
        document.getElementById('map').dataset.locations
    );

    var map = L.map('map', { zoomControl: false }); //to disable + - zoom
    // var map = L.map('map', { zoomControl: false }).setView([31.111745, -118.113491], );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        crossOrigin: ''
    }).addTo(map);

    const points = [];
    locations.forEach((loc) => {
        points.push([loc.coordinates[1], loc.coordinates[0]]);
        L.marker([loc.coordinates[1], loc.coordinates[0]])
            .addTo(map)
            .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
                autoClose: false
            })
            .openPopup();
    });

    const bounds = L.latLngBounds(points).pad(0.5);
    map.fitBounds(bounds);

    map.scrollWheelZoom.disable(); //to disable zoom by mouse wheel
    //alternative

    locations.forEach((loc) => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
