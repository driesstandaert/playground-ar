window.onload = () => {
  const button = document.querySelector('button[data-action="change"]');
  button.innerText = '';

  let places = staticLoadPlaces();
  renderPlaces(places);

  // const distanceMsg = document.querySelector('[gps-entity-place]').getAttribute('distanceMsg');
  // console.log(distanceMsg);   // "890 meters"

  // const distance = document.querySelector('.distance');
  // distance.innerText = distanceMsg;
};

function staticLoadPlaces() {
  return [
      {
          name: 'creatures',
          location: {
              lat: 51.6220518,
              lng: -0.1779886,
          },
      },
  ];
}

// CORS Proxy to avoid CORS problems
const corsProxy = 'https://cors-anywhere.herokuapp.com/';

var models = [
  {
    url: '../assets/animals/beaver/beaver.gltf',
    scale: '0.02 0.02 0.02',
    rotation: '0 250 0',
    position: '3 -1 0',
    info: 'Beaver',
  },
  {
    url: '../assets/animals/trout/scene.gltf',
    scale: '0.5 0.5 0.5',
    rotation: '0 180 0',
    position: '2 -1 0',
    info: 'Trout',
  },
  {
      url: '../assets/animals/magnemite/scene.gltf',
      scale: '0.4 0.4 0.4',
      info: 'Look up',
      rotation: '0 180 0',
      position: '2 1 0',
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

// AFRAME.registerComponent('listener', {
//   tick: function () {
//     console.log(this.el.getAttribute('position'));
//   }
// });