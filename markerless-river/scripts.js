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

//////////////////////////////////////
// Show element transparent in AR mode
//////////////////////////////////////

AFRAME.registerComponent('hide-in-ar-mode', {
  // Set this object invisible while in AR mode.
  init: function () {
      this.el.sceneEl.addEventListener('enter-vr', (ev) => {
          this.wasVisible = this.el.getAttribute('visible');
          if (this.el.sceneEl.is('ar-mode')) {
              this.el.setAttribute('material', 'opacity: 0.2; transparent: true');
          }
      });
      this.el.sceneEl.addEventListener('exit-vr', (ev) => {
          if (this.wasVisible) this.el.setAttribute('visible', true);
          this.el.setAttribute('material', 'opacity: 1; transparent: false');          
      });
  }
});


//////////////////////
// Create water affect
//////////////////////

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

////////////////////////////////////////
// Loading screen before model is loaded
////////////////////////////////////////

AFRAME.registerComponent('box-loader', {
  init: function () {
      this.el.addEventListener('model-loaded', e => {
          console.log('Model loaded!');
          const loader = document.querySelector(".js-loader")
          const enter = document.querySelector(".js-enter")
          const controls = document.querySelector(".js-controls")
          setTimeout(
              function () {
                  loader.classList.remove('is-visible');
                  enter.classList.add('is-visible')
                  controls.classList.add('is-visible')
              }, 1000
          );
      })
  }
})




////////////////////////////////
// Change material on gltf model
////////////////////////////////

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

// var vector = camera.getWorldDirection();
// angle = THREE.Math.radToDeg( Math.atan2(vector.x,vector.z) );  

// console.log(angle);

//////////////////////
// Log camera movement
//////////////////////

// AFRAME.registerComponent('camera-logger', {

//   schema: {
//     timestamp: {type: 'int'},
//     seconds: {type: 'int'} // default 0
//   },

//   log : function () {
//     var cameraEl = this.el.sceneEl.camera.el;
//     var rotation = cameraEl.getAttribute('rotation');
//     var worldPos = new THREE.Vector3();
//     worldPos.setFromMatrixPosition(cameraEl.object3D.matrixWorld);
//     console.log("Time: " + this.data.seconds 
//                 + "; Camera Position: (" + worldPos.x.toFixed(2) + ", " + worldPos.y.toFixed(2) + ", " + worldPos.z.toFixed(2) 
//                 + "); Camera Rotation: (" + rotation.x.toFixed(2) + ", " + rotation.y.toFixed(2) + ", " + rotation.z.toFixed(2) + ")");        
//   },

//   play: function () {
//     this.data.timestamp = Date.now();
//     this.log();
//   },

//   tick: function () {  
//     if (Date.now() - this.data.timestamp > 1000) {
//       this.data.timestamp += 1000;
//       this.data.seconds += 1;
//       this.log();
//     }
//   },
// });






window.onload = function () {
  var sceneEl = document.querySelector('a-scene');
  var audioElRiver = sceneEl.querySelector('#sound-river');
  var audioElVoiceover = sceneEl.querySelector('#sound-voiceover');
  var btnMute = document.querySelector('.js-mute__button');
  var btnPlay = document.querySelector('.js-play__button');
  var btnTranscript = document.querySelector('.js-transcript__button');
  var transcript = document.querySelector('.js-transcript');
  var overlay = document.querySelector('.js-overlay');
  var btnClose = document.querySelector('.js-close__button');

  btnMute.addEventListener('click', function () {
    this.classList.toggle('is-muted');
    if (this.classList.contains('is-muted')) {
      audioElRiver.setAttribute('sound', 'volume', 0)
      audioElVoiceover.setAttribute('sound', 'volume', 0)
    } else {
      audioElRiver.setAttribute('sound', 'volume', .5)
      audioElVoiceover.setAttribute('sound', 'volume', 1)
    }
  });

  btnPlay.addEventListener('click', function () {
    this.classList.toggle('is-playing');
    if (this.classList.contains('is-playing')) {
      audioElRiver.components.sound.playSound();
      audioElVoiceover.components.sound.playSound();
    } else {
      audioElRiver.components.sound.pauseSound();
      audioElVoiceover.components.sound.pauseSound();
    }
  });

  btnTranscript.addEventListener('click', function () {
    transcript.classList.toggle('is-open');
    this.classList.toggle('is-active');
  });

  AFRAME.registerComponent('sound-ended', {
    init: function () {
        this.el.addEventListener('sound-ended', e => {
            console.log('Sound ended!');
            btnPlay.classList.remove('is-playing');
            overlay.classList.toggle('is-visible');
            audioElRiver.components.sound.stopSound();
        })
    }
  })

  btnClose.addEventListener('click', function () {
    overlay.classList.toggle('is-visible');
  });
}




