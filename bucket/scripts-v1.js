window.onload = () => {
  const button = document.querySelector('button[data-action="change"]');
  button.innerText = '';

  let places = staticLoadPlaces();
  renderPlaces(places);
};

function staticLoadPlaces() {
  return [
      {
          name: 'creatures',
          location: {
              lat: 51.4779701, // Paul Lat
              lng: -0.0849297, // Paul Lng
          },
      },
  ];
}

var models = [
  {
    url: './assets/beaver/beaver.gltf',
    scale: '0.02 0.02 0.02',
    rotation: '0 250 0',
    position: '3 -1 0',
    info: 'Beaver'
  },
  {
    url: './assets/trout/scene.gltf',
    scale: '0.5 0.5 0.5',
    rotation: '0 180 0',
    position: '2 -1 0',
    info: 'Trout'
  },
  {
    url: './assets/magnemite/scene.gltf',
    scale: '0.4 0.4 0.4',
    rotation: '0 180 0',
    position: '2 1 0',
    info: 'Look up'
  }
];

var modelIndex = 0;
var setModel = function (model, entity) {
  if (model.scale) {
      entity.setAttribute('scale', model.scale);
  }

  if (model.rotation) {
      entity.setAttribute('rotation', model.rotation);
  }

  if (model.position) {
      entity.setAttribute('position', model.position);
  }

  entity.setAttribute('gltf-model', model.url);

  const div = document.querySelector('.instructions');
  div.innerText = model.info;
};

function renderPlaces(places) {
  let scene = document.querySelector('a-scene');

  places.forEach((place) => {
      let latitude = place.location.lat;
      let longitude = place.location.lng;

      let model = document.createElement('a-entity');
      model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);

      setModel(models[modelIndex], model);

      model.setAttribute('animation-mixer', '');

      document.querySelector('button[data-action="change"]').addEventListener('click', function () {
          const entity = document.querySelector('[gps-entity-place]');
          modelIndex++;
          const newIndex = modelIndex % models.length;
          setModel(models[newIndex], entity);
      });

      scene.appendChild(model);
  });
}