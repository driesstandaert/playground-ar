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
			opacity: 0.6
		},
		'wobble-normal': {}
	},
});

/**
 * Flat-shaded ocean primitive.
 *
 * Based on a Codrops tutorial:
 * http://tympanus.net/codrops/2016/04/26/the-aviator-animating-basic-3d-scene-threejs/
 */
AFRAME.registerPrimitive('a-ocean', {
  defaultComponents: {
    ocean: {},
    rotation: {x: -90, y: 0, z: 0},
  },
  mappings: {
    width: 'ocean.width',
    depth: 'ocean.depth',
    density: 'ocean.density',
    amplitude: 'ocean.amplitude',
    amplitudeVariance: 'ocean.amplitudeVariance',
    speed: 'ocean.speed',
    speedVariance: 'ocean.speedVariance',
    color: 'ocean.color',
    opacity: 'ocean.opacity'
  }
});

AFRAME.registerComponent('ocean', {
  schema: {
    // Dimensions of the ocean area.
    width: {default: 1000, min: 0},
    depth: {default: 1000, min: 0},

    // Density of waves.
    density: {default: 10},

    // Wave amplitude and variance.
    amplitude: {default: 0},
    amplitudeVariance: {default: 0.1},

    // Wave speed and variance.
    speed: {default: 1},
    speedVariance: {default: 2},

    // Material.
    color: {default: '#7AD2F7', type: 'color'},
    opacity: {default: 0.8}
  },

  /**
   * Use play() instead of init(), because component mappings – unavailable as dependencies – are
   * not guaranteed to have parsed when this component is initialized.
   */
  play: function () {
    const el = this.el,
        data = this.data;
    let material = el.components.material;

    const geometry = new THREE.PlaneGeometry(data.width, data.depth, data.density, data.density);
    geometry.mergeVertices();
    this.waves = [];
    for (let v, i = 0, l = geometry.vertices.length; i < l; i++) {
      v = geometry.vertices[i];
      this.waves.push({
        z: v.z,
        ang: Math.random() * Math.PI * 2,
        amp: data.amplitude + Math.random() * data.amplitudeVariance,
        speed: (data.speed + Math.random() * data.speedVariance) / 1000 // radians / frame
      });
    }

    if (!material) {
      material = {};
      material.material = new THREE.MeshPhongMaterial({
        color: data.color,
        transparent: data.opacity < 1,
        opacity: data.opacity,
        shading: THREE.FlatShading,
      });
    }

    this.mesh = new THREE.Mesh(geometry, material.material);
    el.setObject3D('mesh', this.mesh);
  },

  remove: function () {
    this.el.removeObject3D('mesh');
  },

  tick: function (t, dt) {
    if (!dt) return;

    const verts = this.mesh.geometry.vertices;
    for (let v, vprops, i = 0; (v = verts[i]); i++){
      vprops = this.waves[i];
      v.z = vprops.z + Math.sin(vprops.ang) * vprops.amp;
      vprops.ang += vprops.speed * dt;
    }
    this.mesh.geometry.verticesNeedUpdate = true;
  }
});

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

AFRAME.registerShader('glow', {
  schema: {
    color: {type: 'color', is: 'uniform'},
    timeMsec: {type: 'time', is: 'uniform'}
  },

  vertexShader: `
  precision highp float;
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat3 normalMatrix;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec3 fNormal;
  varying vec3 fPosition;
  
  void main()
  {
    fNormal = normalize(normalMatrix * normal);
    vec4 pos = modelViewMatrix * vec4(position, 1.0);
    fPosition = pos.xyz;
    gl_Position = projectionMatrix * pos;
  }
  `,
  fragmentShader: `
  #extension GL_OES_standard_derivatives : enable

  precision highp float;
  
  uniform vec3 color;
  uniform float start;
  uniform float end;
  uniform float alpha;
  
  varying vec3 fPosition;
  varying vec3 fNormal;
  
  void main()
  {
    vec3 normal = normalize(fNormal);
    vec3 eye = normalize(-fPosition.xyz);
    float rim = 1.0 - smoothstep(start, end, 1.0 - dot(normal, eye));
    float value = clamp( rim, 0.0, 1.0 ) * alpha;
    gl_FragColor = vec4( value * color, length( value ) );
  }
  `
});


//////////////////////////////
// Change material on gltf model
//////////////////////////////

AFRAME.registerComponent('tree-manager', {         
  init: function () {
    let el = this.el;
    let comp = this;
    let data = this.data;
    comp.scene = el.sceneEl.object3D;  
    comp.counter = 0;   
    comp.treeModels = [];
    comp.modelLoaded = false;
    

    // After gltf model has loaded, modify it materials.
    el.addEventListener('model-loaded', function(ev){
      let mesh = el.getObject3D('mesh'); 
      
      if (!mesh){return;}
      //console.log(mesh);
      mesh.traverse(function(node){
         if (node.isMesh){  
           let mat = new THREE.MeshStandardMaterial;
           let color = new THREE.Color(0xffffff);
           // var texture = new THREE.TextureLoader().load( "textures/test-realistic.jpg" )
           // var mat = new THREE.MeshBasicMaterial( { map: texture } );
           mat.color = color;
           mat.metalness = 0.1;
           // mat.map = texture;
           mat.normalTextureRepeat = '0 0';
           mat.normalTextureOffset = '0 0';
           mat.normalScale = '0.5 0.5';
           mat.color = color;
           node.material = mat;                  
         }
      });
      comp.modelLoaded = true;
    });   
  }
});

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
  var scene = document.querySelector('a-scene');
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
        (scene.hasLoaded) ? playSound() : scene.addEventListener('loaded', playSound);
      }, 1000
    );
  });

  ////////////////////////////
  // Start scene after loading
  ////////////////////////////

  (scene.hasLoaded) ? startScene() : scene.addEventListener('loaded', startScene);

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
      }, 1000
    );
  }


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
  src: ['./audio/voiceover.mp3'],
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
  volume: .1
});



// AFRAME.registerComponent("rotate-compass", {
//   init: function() {
//       var compassdir // however you get the compass reading
//       var pos = this.el.getAttribute('position')
//       pos.y = THREE.Math.degToRad(-compassdir);
//       this.el.setAttribute('position', pos)
//   }
// })










AFRAME.registerComponent('material-displacement', {
  /**
   * Creates a new THREE.ShaderMaterial using the two shaders defined
   * in vertex.glsl and fragment.glsl.
   */
  init: function () {
    this.material  = new THREE.ShaderMaterial({
      uniforms: {time: { value: 0.0 }},
      vertexShader: `
      precision highp float;

      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
      attribute vec2 uv2;
      
      uniform mat3 normalMatrix;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      
      varying vec3 fNormal;
      varying vec3 fPosition;
      varying vec2 fUv;
      
      void main()
      {
        fNormal = normalize(normalMatrix * normal);
        vec4 pos = modelViewMatrix * vec4(position, 1.0);
        fPosition = pos.xyz;
        fUv = uv;
        gl_Position = projectionMatrix * pos;
      }
  `,
  fragmentShader: `
  precision highp float;

uniform vec3 color;
uniform float start;
uniform float end;
uniform float alpha;

varying vec3 fPosition;
varying vec3 fNormal;

void main()
{
  vec3 normal = normalize(fNormal);
  vec3 eye = normalize(-fPosition.xyz);
  float rim = smoothstep(start, end, 1.0 - dot(normal, eye));
  gl_FragColor = vec4( clamp(rim, 0.0, 1.0) * alpha * color, 1.0 );
}
  `
    });
    this.el.addEventListener('model-loaded', () => this.update());
  },

  /**
   * Apply the material to the current entity.
   */
  update: function () {
    const mesh = this.el.getObject3D('mesh');
    if (mesh) {
      mesh.material = this.material;
    }
  },

  /**
   * On each frame, update the 'time' uniform in the shaders.
   */
  tick: function (t) {
    this.material.uniforms.time.value = t / 1000;
  }
  
})



AFRAME.registerShader('grid-glitch', {
  schema: {
    color: {type: 'color', is: 'uniform'},
    timeMsec: {type: 'time', is: 'uniform'}
  },

  vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`,
  fragmentShader: `
varying vec2 vUv;
uniform vec3 color;
uniform float timeMsec; // A-Frame time in milliseconds.

void main() {
  float time = timeMsec / 1000.0; // Convert from A-Frame milliseconds to typical time in seconds.
  // Use sin(time), which curves between 0 and 1 over time,
  // to determine the mix of two colors:
  //    (a) Dynamic color where 'R' and 'B' channels come
  //        from a modulus of the UV coordinates.
  //    (b) Base color.
  // 
  // The color itself is a vec4 containing RGBA values 0-1.
  gl_FragColor = mix(
    vec4(mod(vUv , 0.05) * 20.0, 1.0, 1.0),
    vec4(color, 1.0),
    sin(time)
  );
}
`
});





const pnoise3 = `

//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise, periodic variant
float pnoise3(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

`;
