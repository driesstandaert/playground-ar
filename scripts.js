window.onload = () => {
  let places = staticLoadPlaces();
  renderPlaces(places);
  console.log(places);
};

function staticLoadPlaces() {
  return [
    {
      name: 'beaver',
      url: './assets/beaver/beaver.gltf',
      scale: '0.02 0.02 0.02',
      location: {
        // lat: 51.622540,
        // lng: -0.177321,
        lat: 51.482651,
        lng: -0.082687
      },
    },
    {
      name: 'trout',
      url: './assets/trout/scene.gltf',
      scale: '0.5 0.5 0.5',
      location: {
        // lat: 51.4779701, // Paul Lat
        // lng: -0.0849297, // Paul Lng
        lat: 51.485086, 
        lng: -0.080385, 
      },
    },
    {
      name: 'mouse',
      url: './assets/mouse/scene.gltf',
      scale: '0.01 0.01 0.01',
      location: {
        lat: 51.483229,
        lng: -0.078287,
      },
    },
  ];
}

function renderPlaces(places) {
  let scene = document.querySelector('a-scene');

  places.forEach((place) => {
    console.log(place.name);
    console.log(place.location.lat);
    console.log(place.location.lng);

    let model = document.createElement('a-entity');
    model.setAttribute('gps-entity-place', `latitude: ${place.location.lat}; longitude: ${place.location.lng};`);
    model.setAttribute('gltf-model', `${place.url}`);
    model.setAttribute('rotation', '0 0 0');
    model.setAttribute('animation-mixer', '');
    model.setAttribute('scale', place.scale);

    model.addEventListener('loaded', () => {
      window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
      console.log(model);
    });

    scene.appendChild(model);

    // const distanceMsg = document.querySelector('[gps-entity-place]').getAttribute('distanceMsg');
    // console.log(model);   // "890 meters"
  });
}