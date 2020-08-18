/**
 * Player for animation clips. Intended to be compatible with any model format that supports
 * skeletal or morph animations.
 */
AFRAME.registerComponent('play-all-model-animations', {
  init: function () {
    this.model = null;
    this.mixer = null;

    var model = this.el.getObject3D('mesh');
    if (model) {
      this.load(model);
    } else {
      this.el.addEventListener('model-loaded', function (e) {
        this.load(e.detail.model);
      }.bind(this));
    }
  },

  load: function (model) {
    this.model = model;
    this.mixer = new THREE.AnimationMixer(model);
    this.model.animations.forEach(animation => {
      this.mixer.clipAction(animation, model).play();
    });
  },

  tick: function (t, dt) {
    if (this.mixer && !isNaN(dt)) {
      this.mixer.update(dt / 1000);
    }
  }
});

// Sky background + shader 
AFRAME.registerComponent('sun-position-setter', {
  init: function () {
    var skyEl = this.el;
    var orbitEl = this.el.sceneEl.querySelector('#orbit');

    orbitEl.addEventListener('componentchanged', function changeSun (evt) {
      var sunPosition;
      var phi;
      var theta;

      if (evt.detail.name !== 'rotation') { return; }

      sunPosition = orbitEl.getAttribute('rotation');

      if(sunPosition === null) { return; }

      theta = Math.PI * (- 0.5);
      phi = 2 * Math.PI * (sunPosition.y / 360 - 0.5);
      skyEl.setAttribute('material', 'sunPosition', {
        x: Math.cos(phi),
        y: Math.sin(phi) * Math.sin(theta),
        z: -1
      });
    });
  }
});


// Hide element in AR (for example background)
AFRAME.registerComponent('hide-in-ar-mode', {
  // Set this object invisible while in AR mode.
  init: function () {
      this.el.sceneEl.addEventListener('enter-vr', (ev) => {
          this.wasVisible = this.el.getAttribute('visible');
          if (this.el.sceneEl.is('ar-mode')) {
              this.el.setAttribute('visible', false);
          }
      });
      this.el.sceneEl.addEventListener('exit-vr', (ev) => {
          if (this.wasVisible) this.el.setAttribute('visible', true);
      });
  }
});

// 
// Requires a build from the latest a-frame master (August 2016, v0.3)
AFRAME.registerComponent('wobble-normal', {
	schema: {},
	tick: function (t) {
    if (!this.el.components.material.material.normalMap) return;
		this.el.components.material.material.normalMap.offset.x += 0.0001 * Math.sin(t/10000);
		this.el.components.material.material.normalMap.offset.y += 0.0001 * Math.cos(t/8000);
		this.el.components.material.material.normalScale.x = 0.5 + 0.5 * Math.cos(t/1000);
		this.el.components.material.material.normalScale.x = 0.5 + 0.5 * Math.sin(t/1200);
	}
})

// Create water 
AFRAME.registerPrimitive('a-ocean-plane', {
	defaultComponents: {
		geometry: {
			primitive: 'plane',
			height: 10000,
			width: 10000
		},
    rotation: '-90 0 0',
		material: {
			shader: 'standard',
			color: '#8ab39f',
			metalness: 1,
			roughness: 0.2,
			normalMap: 'url(./waternormals.jpg)',
			normalTextureRepeat: '50 50',
			normalTextureOffset: '0 0',
			normalScale: '0.5 0.5',
			opacity: 0.8
		},
		'wobble-normal': {}
	},
});


// Show loading screen before model is loaded
AFRAME.registerComponent('box-loader', {
  init: function () {
      this.el.addEventListener('model-loaded', e => {
          console.log('Model loaded!');
          const loader = document.querySelector(".js-loader")
          const enter = document.querySelector(".js-enter")
          // const videosphere = document.querySelector(".js-videosphere")
          // const marker = document.querySelector("a-marker")
          // const label = document.querySelector(".js-label")
          // const controls = document.querySelector(".js-controls")
          setTimeout(
              function () {
                  loader.classList.remove('is-visible');
                  enter.classList.add('is-visible')
                  // videosphere.play();
                  
                  // if(marker.object3D.visible == true){
                  //     controls.classList.add('is-visible')
                  // } else {
                  //     label.classList.add('is-visible');
                  // }

                  // marker.addEventListener("markerFound", (e)=>{
                  //     label.classList.remove('is-visible')
                  //     controls.classList.add('is-visible')
                  // })
                  // marker.addEventListener("markerLost", (e)=>{
                  //     label.classList.add('is-visible')
                  //     controls.classList.remove('is-visible')
                  // });
              }, 1000
          );
      })
  }
})


// AFRAME.registerComponent('tree-manager', {         
//   init: function () {
//     let el = this.el;
//     let comp = this;
//     let data = this.data;
//     comp.scene = el.sceneEl.object3D;  
//     comp.counter = 0;   
//     comp.treeModels = [];
//     comp.modelLoaded = false;
    

//     // After gltf model has loaded, modify it materials.
//     el.addEventListener('model-loaded', function(ev){
//       let mesh = el.getObject3D('mesh'); 
      
//       if (!mesh){return;}
//       //console.log(mesh);
//       mesh.traverse(function(node){
//          if (node.isMesh){  
//            let mat = new THREE.MeshStandardMaterial;
//            let color = new THREE.Color(0x8ab39f);
//            var texture = new THREE.TextureLoader().load( "textures/waternormals.jpg" )
//           // var mat = new THREE.MeshBasicMaterial( { map: texture } );
//            mat.color = color;
//            mat.metalness = 1;
//            mat.map = texture;
//            mat.normalTextureRepeat = '50 50';
//            mat.normalTextureOffset = '0 0';
//            mat.normalScale = '0.5 0.5';
//            mat.color = color;

//            node.material = mat;                  
//          }
//       });
//       comp.modelLoaded = true;
//     });   
//   }
// });





