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


// ////////////////////
// Create water affect
// ////////////////////

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
			height: 1000,
			width: 1000
		},
    rotation: '-90 0 0',
		material: {
			shader: 'standard',
			color: '#A3D3D5',
			metalness: 1,
			roughness: 0.1,
			normalMap: 'url(./waternormals.jpg)',
			normalTextureRepeat: '50 50',
			normalTextureOffset: '0 0',
			normalScale: '0.5 0.5',
			opacity: 0.8
		},
		'wobble-normal': {}
	},
});

// /**
//  * Flat-shaded ocean primitive.
//  *
//  * Based on a Codrops tutorial:
//  * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
//  */
// AFRAME.registerPrimitive('a-ocean', {
//   defaultComponents: {
//     ocean: {},
//     rotation: {x: -90, y: 0, z: 0},
//   },
//   mappings: {
//     width: 'ocean.width',
//     depth: 'ocean.depth',
//     density: 'ocean.density',
//     amplitude: 'ocean.amplitude',
//     amplitudeVariance: 'ocean.amplitudeVariance',
//     speed: 'ocean.speed',
//     speedVariance: 'ocean.speedVariance',
//     color: 'ocean.color',
//     opacity: 'ocean.opacity'
//   }
// });

// AFRAME.registerComponent('ocean', {
//   schema: {
//     // Dimensions of the ocean area.
//     width: {default: 1000, min: 0},
//     depth: {default: 1000, min: 0},

//     // Density of waves.
//     density: {default: 10},

//     // Wave amplitude and variance.
//     amplitude: {default: 0},
//     amplitudeVariance: {default: 0.1},

//     // Wave speed and variance.
//     speed: {default: 1},
//     speedVariance: {default: 2},

//     // Material.
//     color: {default: '#7AD2F7', type: 'color'},
//     opacity: {default: 0.8}
//   },

//   /**
//    * Use play() instead of init(), because component mappings – unavailable as dependencies – are
//    * not guaranteed to have parsed when this component is initialized.
//    */
//   play: function () {
//     const el = this.el,
//         data = this.data;
//     let material = el.components.material;

//     const geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
//     geometry.mergeVertices();
//     this.waves = [];
//     for (let v, i = 0, l = geometry.vertices.length; i < l; i++) {
//       v = geometry.vertices[i];
//       this.waves.push({
//         z: v.z,
//         ang: Math.random() * Math.PI * 2,
//         amp: data.amplitude + Math.random() * data.amplitudeVariance,
//         speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
//       });
//     }

//     if (!material) {
//       material = {};
//       material.material = new THREE.MeshPhongMaterial({
//         color: data.color,
//         transparent: data.opacity < 1,
//         opacity: data.opacity,
//         shading: THREE.FlatShading,
//       });
//     }

//     this.mesh = new THREE.Mesh(geometry, material.material);
//     el.setObject3D('mesh', this.mesh);
//   },

//   remove: function () {
//     this.el.removeObject3D('mesh');
//   },

//   tick: function (t, dt) {
//     if (!dt) return;

//     const verts = this.mesh.geometry.vertices;
//     for (let v, vprops, i = 0; (v = verts[i]); i++){
//       vprops = this.waves[i];
//       v.z = vprops.z + Math.sin(vprops.ang) * vprops.amp;
//       vprops.ang += vprops.speed * dt;
//     }
//     this.mesh.geometry.verticesNeedUpdate = true;
//   }
// });

////////////////////////////////////////
// Loading screen before model is loaded
////////////////////////////////////////

// AFRAME.registerComponent('box-loader', {
//   init: function () {
//       this.el.addEventListener('model-loaded', e => {
//           console.log('Model loaded!');
//           const loader = document.querySelector(".js-loader")
//           const enter = document.querySelector(".js-enter")
//           const controls = document.querySelector(".js-controls")
//           setTimeout(
//               function () {
//                   loader.classList.remove('is-visible');
//                   enter.classList.add('is-visible')
//                   controls.classList.add('is-visible')
//               }, 1000
//           );
//       })
//   }
// })




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
  var btnMute = document.querySelector('.js-mute__button');
  var btnPlay = document.querySelector('.js-play__button');
  var btnTranscript = document.querySelector('.js-transcript__button');
  var transcript = document.querySelector('.js-transcript');

  var overlay = document.querySelector('.js-overlay');
  var btnClose = document.querySelector('.js-close__button');

  var btnStart = document.querySelector('.js-start__button');
  var landing = document.querySelector('.js-landing');

  btnMute.addEventListener('click', function () {
    this.classList.toggle('is-muted');
    if (this.classList.contains('is-muted')) {
      // soundRiver.volume(0)
      // soundVoiceover.volume(0)
      soundRiver.mute(true)
      soundVoiceover.mute(true)
    } else {
      soundRiver.mute(false)
      soundVoiceover.mute(false)
    }
  });

  btnPlay.addEventListener('click', function () {
    this.classList.toggle('is-playing');
    if (this.classList.contains('is-playing')) {
      soundRiver.play();
      soundVoiceover.play();

    } else {
      soundRiver.pause();
      soundVoiceover.pause();
    }
  });

  btnTranscript.addEventListener('click', function () {
    transcript.classList.toggle('is-open');
    this.classList.toggle('is-active');
  });

  btnClose.addEventListener('click', function () {
    overlay.classList.toggle('is-visible');
    //soundRiver.sound.fade(.1, 1, 1000);
  });
  

  btnStart.addEventListener('click', function () {
    landing.classList.remove('is-visible'); 
    btnPlay.classList.add('is-playing');
    
    loadinganime = false; // intro animation until scene starts

    function playSound () {
      soundRiver.play();
      soundVoiceover.play();
    }

    setTimeout(
      function () {
        if (scene.hasLoaded) {
          playSound();
        } else {
          scene.addEventListener('loaded', playSound);
        }
      }, 3000
    );

  });


    /////////////////
    // Logo animation
    /////////////////

    function timer(ms) {
      return new Promise(res => setTimeout(res, ms));
    }
    
    const logoSvgCircles = document.querySelectorAll(".js-logo circle");
    let loadinganime = true;

    async function introAnimation () {
    while (loadinganime) {
        var el = Math.floor(Math.random() * logoSvgCircles.length);
        logoSvgCircles[el].classList.toggle("is-visible");
        await timer(5);
      }
    }
    introAnimation();


    ///////////////////////
    // Loading screen
    //////////////////////

    var scene = document.querySelector('a-scene');

    if (scene.hasLoaded) {
      startScene();
    } else {
      scene.addEventListener('loaded', startScene);
    }

    function startScene () {
      console.log('Models loaded!');
      const loader = document.querySelector(".js-loader");
      const enter = document.querySelector(".js-enter");
      const controls = document.querySelector(".js-controls");
      setTimeout(
        function () {
          loader.classList.remove('is-visible');
          enter.classList.add('is-visible');
          controls.classList.add('is-visible');
        }, 3000
      );
    }

}

// AFRAME.registerComponent('sound-ended', {
//   init: function () {
//       this.el.addEventListener('sound-ended', e => {
//           console.log('Sound ended!');
//           var sceneEl = document.querySelector('a-scene');
//           var btnPlay = document.querySelector('.js-play__button');
//           var overlay = document.querySelector('.js-overlay');
//           btnPlay.classList.remove('is-playing');
//           overlay.classList.toggle('is-visible');
          
//       })
//   }
// })


//////////////////////////
// Init Howler audio files
/////////////////////////


var soundVoiceover = new Howl({
  src: ['./audio/voiceover-male.mp3'],
  loop: false,
  volume: 1,
  html5: true, // Force to HTML5 so that the audio can stream in. Plays on IOS.
  onend: function() {
    console.log('Sound Finished!');
    var btnPlay = document.querySelector('.js-play__button');
    var overlay = document.querySelector('.js-overlay');
    btnPlay.classList.remove('is-playing');
    overlay.classList.toggle('is-visible');
  }
});

var soundRiver = new Howl({
  src: ['./audio/river-audio.mp3'],
  html5: true, // Force to HTML5 so that the audio can stream in. Plays on IOS.
  loop: true,
  volume: .2
});



// AFRAME.registerComponent("rotate-compass", {
//   init: function() {
//       var compassdir // however you get the compass reading
//       var pos = this.el.getAttribute('position')
//       pos.y = THREE.Math.degToRad(-compassdir);
//       this.el.setAttribute('position', pos)
//   }
// })



