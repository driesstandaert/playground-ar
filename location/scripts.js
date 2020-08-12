window.onload = () => {
  let places = staticLoadPlaces();
  renderPlaces(places);
  console.log(places);
  console.log('test');
  console.log(document.getElementById('trout'));
};

function staticLoadPlaces() {
  return [
    {
      name: 'beaver',
      url: '../assets/animals/beaver/beaver.gltf',
      scale: '0.02 0.02 0.02',
      textscale: '3 3 3',
      location: {
        // lat: 51.622540,
        // lng: -0.177321,
        lat: 51.622246,
        lng: -0.178072
      },
    },
    {
      name: 'trout',
      url: '../assets/animals/trout/scene.gltf',
      scale: '0.5 0.5 0.5',
      textscale: '3 3 3',
      location: {
        lat: 51.621880,
        lng: -0.177922,
      },
    },
    {
      name: 'mouse',
      url: '../assets/animals/mouse/scene.gltf',
      scale: '0.01 0.01 0.01',
      textscale: '3 3 3',
      location: {
        lat: 51.6220518,
        lng: -0.1779886,
      },
    },
    {
      name: 'bridge',
      url: '../assets/animals/bridge/scene.gltf',
      scale: '1 1 1',
      textscale: '3 3 3',
      location: {
        lat: 51.621914,
        lng: -0.178035,
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
    model.setAttribute('id', place.name);
    model.setAttribute('gps-entity-place', `latitude: ${place.location.lat}; longitude: ${place.location.lng};`);
    model.setAttribute('gltf-model', `${place.url}`);
    model.setAttribute('rotation', '0 0 0');
    model.setAttribute('animation-mixer', '');
    model.setAttribute('scale', place.scale);
    model.setAttribute('clickhandler', '');

    let modelText = document.createElement('a-text');
    modelText.setAttribute('gps-entity-place', `latitude: ${place.location.lat}; longitude: ${place.location.lng};`);
    modelText.setAttribute('value', `${place.name}`);
    modelText.setAttribute('scale', place.textscale);

    model.addEventListener('loaded', () => {
      window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
    });

    

    scene.appendChild(model);
    scene.appendChild(modelText);



    // const distanceMsg = document.querySelector('[gps-entity-place]').getAttribute('distanceMsg');
    // console.log(model);   // "890 meters"
  });
}
