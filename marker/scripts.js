console.log('Test 7')

// Create shadow on transparent <a-plane>
AFRAME.registerComponent('shadow-material', {
  init() {
      this.material = new THREE.ShadowMaterial();
      this.el.getOrCreateObject3D('mesh').material = this.material;
      this.material.opacity = 0.3;
  }
  });

  // Show loading box before model is loaded
  // AFRAME.registerComponent('box-loader', {
  //     init: function() {
  //         this.el.addEventListener('model-loaded', e => {
  //             document.querySelector("#loadingEl").remove()
  //         })
  //     }
  // })

  // Show loading screen before model is loaded
  AFRAME.registerComponent('box-loader', {
      init: function() {
          this.el.addEventListener('model-loaded', e => {
              document.querySelector(".js-loader").style.display = "none";
          })
      }
  })

  // Console log text if element is loaded
  AFRAME.registerComponent('log', {
      schema: {type: 'string'},
      init: function () {
          var stringToLog = this.data;
          console.log(stringToLog);
      }
  });

  // OnClick element
  // AFRAME.registerComponent('clickhandler', {
  // init: function() {
  //     this.el.addEventListener('click', () => {
  //         const modelName = this.el.getAttribute('name');
  //         const div = document.querySelector('.js-label');
  //         div.innerHTML += `${modelName}`;

  //         this.el.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 10000');
          
  //         console.log(modelName);
  //         console.log(this.el.getAttribute('distance'))
  //         console.log(this.el.getAttribute('scale'))
  //     });
  // }});

  window.onload=function(){
      var sceneEl = document.querySelector('a-scene');
      var entity = sceneEl.querySelector('a-entity');
     
      document.querySelector('.js-button').addEventListener('click', function () {
          console.log('click');

          if (entity.hasAttribute('animation')) {
              entity.emit('rotate');
              console.log('has animation');
          } else {
              entity.setAttribute('animation', 'property: rotation; from: 0 0 0; to: 0 360 0; loop: 1; dur: 2000; easing:linear; startEvents: rotate;')
              entity.emit('rotate');
              console.log('add animation and rotate');
          }
      });

      entity.addEventListener('animationcomplete', function(){ 
          this.removeAttribute('animation');
          this.flushToDOM() // Update the DOM
          console.log('remove animation'); 
      });
  }