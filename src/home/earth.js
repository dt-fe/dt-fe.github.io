var Shader = {
  scan: {
    vertexShader: 
      ['attribute vec3 customColor;',
      'attribute float level;',
      'varying vec3 v_color;',
      'varying float v_level;',
      'void main() {',
        'v_color = customColor;',
        'v_level = level;',
        'vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        'gl_Position = projectionMatrix * mvPosition;',
      '}'].join('\n')
    ,
    fragmentShader: 
      ['uniform float totLevel;',
      'uniform float percent;',
      'varying vec3 v_color;',
      'varying float v_level;',
      'void main() {',
        'float opacity = (0.8 - percent) * (1.0 - v_level / totLevel);',
        'gl_FragColor = vec4(v_color, opacity);',
      '}'].join('\n')
    ,
  },
  atmosphere: {
    uniforms: {},
    vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
        'vNormal = normalize( normalMatrix * normal );',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}',
    ].join('\n'),
    fragmentShader: [
      'varying vec3 vNormal;',
      'void main() {',
        'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
        'gl_FragColor = vec4( 1.0, 1.0, 1.0, 0.3 ) * intensity;',
      '}',
    ].join('\n'),
  },
};
var mScene, mContainer, mRenderer, mCamera, mControls, mFlightsPathLines, mPlane, mCloud, mData, mPoints, mEarth;
var earth;
var mLoader = new THREE.TextureLoader();
mLoader.crossOrigin = true;




function webgl_detect(return_context)
{
    if (!!window.WebGLRenderingContext) {
        var canvas = document.createElement("canvas"),
             names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
           context = false;

        for(var i=0;i<4;i++) {
            try {
                context = canvas.getContext(names[i]);
                if (context && typeof context.getParameter == "function") {
                    // WebGL is enabled
                    if (return_context) {
                        // return WebGL object if the function's argument is present
                        return {name:names[i], gl:context};
                    }
                    // else, return just true
                    return true;
                }
            } catch(e) {}
        }

        // WebGL is supported, but disabled
        return false;
    }

    // WebGL not supported
    return false;
}




window.onload = function onload () {

  if(webgl_detect()){
      init();
      $('.3d-earth-img').hide();
  }
}


function init() {
  initTHREE();
  addEarth();
  addAtmosphere();
  // addScan();
  addSun();
  addBars();
  animate();
}

function initTHREE() {
  mContainer = document.getElementById('three-container');
  mRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  mRenderer.setSize(mContainer.offsetWidth, mContainer.offsetHeight);
  mRenderer.setClearColor('#000000', 0);
  mRenderer.shadowMap.enabled = true;
	mRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mContainer.appendChild(mRenderer.domElement);

  mCamera = new THREE.PerspectiveCamera(60, mContainer.offsetWidth / mContainer.offsetHeight, 0.1, 5000);
  mCamera.position.z = 2;
  mCamera.position.y = 2;
  mCamera.position.x = 2;
  mCamera.lookAt({ x: 0, y: 0, z: 0 });

  mScene = new THREE.Scene();

  var axisHelper = new THREE.AxisHelper(1500);
  // mScene.add(axisHelper);

  // mControls = new THREE.OrbitControls(mCamera, mRenderer.domElement);
  // mControls.enableZoom = false;
  // mControls.autoRotate = true;
  // mControls.autoRotateSpeed = 1.0;
}

function addBars() {
  // var xhr = new XMLHttpRequest();
  // xhr.open('GET', './data.json', true);
  // xhr.onreadystatechange = function(e) {
  //   if (xhr.readyState === 4 && xhr.status === 200) {
      // mData = JSON.parse(xhr.responseText);
      createBars();
  //   }
  // };
  // xhr.send(null);
}

function createBars() {
  var radius = 1.05;
  var latitude, longitude, altitude, phi, theta;
  var totGeometry = new THREE.Geometry();
  var color = new THREE.Color();


  for (var i = 0; i < mData.length / 3; i++) {
    latitude = mData[i * 3 + 0];
    longitude = mData[i * 3 + 1];
    altitude = mData[i * 3 + 2];

    if(altitude>0.3){
      altitude = altitude/4;
    }

    var pointGeometry = new THREE.BoxGeometry(0.01, 0.01, 0.6);
    pointGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -0.3));
    var point = new THREE.Mesh(pointGeometry);

    phi = (90 - latitude) * Math.PI / 180;
    theta = (180 - longitude) * Math.PI / 180;
    point.position.x = radius * Math.sin(phi) * Math.cos(theta);
    point.position.y = radius * Math.cos(phi);
    point.position.z = radius * Math.sin(phi) * Math.sin(theta);
    point.lookAt(mEarth.position.normalize());
    point.scale.z = Math.max(altitude, 0.01); // avoid non-invertible matrix
    point.scale.y = 0.3;
    point.scale.x = 0.3;

    point.updateMatrix();
    //
    // color.setHSL(
    //   (longitude + 180) % 360 / 360,
    //   1,
    //   Math.min(0.3 + altitude, 1)
    // );


    color.set(0x166fff);

    // color.setRGB(
    //   0,
    //   0,
    //   (longitude + 180) % 360 / 360
    // );
    //
    for (var j = 0; j < point.geometry.faces.length; j++) {
      point.geometry.faces[j].color = color;
    }

    // if (point.matrixAutoUpdate) {
    //   point.updateMatrix();
    // }
    totGeometry.merge(point.geometry, point.matrix);

  }
  mPoints = new THREE.Mesh(totGeometry, new THREE.MeshLambertMaterial({
    opacity: 0.8,
    transparent: true,
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
    // blending: THREE.AdditiveBlending,
  }));
  mScene.add(mPoints);
}

function addSun() {
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  var sun = new THREE.DirectionalLight(0xffffff, 0.3);

  // var spotLight = new THREE.SpotLight(0xffffff, 1);
  // mScene.add(spotLight);
  // var sun = new THREE.DirectionalLight(0xffffff, 0.3);

  sun.name = 'sun';
  sun.position.set(-4, 0, 0);
  sun.castShadow = true;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 5;
  sun.shadow.camera.fov = 30;
  sun.shadow.camera.left = -1;
  sun.shadow.camera.right = 1;
  sun.shadow.camera.top = 1;
  sun.shadow.camera.bottom = -1;
  // sun.revolutionAngle = Math.PI / 2;

  sun.shadowCameraHelper = new THREE.CameraHelper( sun.shadow.camera );
  // mScene.add(sun.shadowCameraHelper);

  mScene.add(ambientLight);
  mScene.add(sun);
}

function addAtmosphere() {
  var geometry = mEarth.geometry.clone();
  var shader = Shader['atmosphere'];
  var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  var mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set( 1.12, 1.12, 1.12 );
  mScene.add(mesh);
}

function addEarth() {
  var earthGeom = new THREE.SphereGeometry(1, 64, 32);
  var earthMat = new THREE.MeshPhongMaterial({
    map: mLoader.load('https://img.alicdn.com/tps/TB1IdZwNXXXXXcFaXXXXXXXXXXX-2048-1024.jpg'),
    // normalMap: mLoader.load('https://img.alicdn.com/tps/TB1B9APNXXXXXaKXFXXXXXXXXXX-2048-1024.jpg'),
    bumpScale: 0.02,
    specular: new THREE.Color(0xffffff),
    shininess: 4,
  });

  earth = new THREE.Mesh(earthGeom, earthMat);
  earth.name = 'earth';
  earth.castShadow = true;
  earth.receiveShadow = false;
  mEarth = earth;
  mEarth.rotation.y = Math.PI;
  mScene.add(earth);
}

function addScan() {
  addWave(1.08, 0);
  var tweenObj = {
    percent: 0,
  };
  var tween = TweenMax.to(tweenObj, 5, {
    percent: 1,
    repeat: Infinity,
    onRepeat: onRepeat,
    onUpdate: onUpdate,
    repeatDelay: 0.5,
    ease: Linear.easeOut,
  });
  function onUpdate() {
    var theta = tweenObj.percent * Math.PI;
    changeWave(1.08, theta, tweenObj.percent);
  }
  function onRepeat() {
    mCloud.rotation.y = Math.PI * Math.random();
  }
}

function addWave(radius, theta) {
  var level = 20;
  var size = 50;
  var totSize = size * level;
  var geometry = new THREE.BufferGeometry();
  var positions = new Float32Array(totSize * 3);
  var colors = new Float32Array(totSize * 3);
  var levels = new Float32Array(totSize);
  var indices = new Uint32Array(size * 6 * (level - 1));
  var count = 0;
  for (var l = 0; l < level - 1; l++) {
    for (var i = 0; i < size; i++) {
      indices[count++] = l * size + i;
      indices[count++] = l * size + (i + 1) % size;
      indices[count++] = (l + 1) * size + i;
      indices[count++] = l * size + (i + 1) % size;
      indices[count++] = (l + 1) * size + (i + 1) % size;
      indices[count++] = (l + 1) * size + i;
    }
  }
  var color = new THREE.Color(0xa2d1ff);
  for (var l = 0; l < level; l++) {
    for (var i = 0; i < size; i++) {
      colors[(l * size + i) * 3 + 0] = color.r;
      colors[(l * size + i) * 3 + 1] = color.g;
      colors[(l * size + i) * 3 + 2] = color.b;
      levels[l * size + i] = l + 1;
    }
  }
  geometry.setIndex(new THREE.BufferAttribute(indices, 1 ));
  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  geometry.addAttribute('level', new THREE.BufferAttribute(levels, 1));
  var material = new THREE.ShaderMaterial({
    uniforms: {
      totLevel: { type: 'f', value: level },
      percent: { type: 'f', value: 0 },
    },
    transparent: true,
    vertexShader: Shader['scan'].vertexShader,
    fragmentShader: Shader['scan'].fragmentShader,
  });
  var cloud = new THREE.Mesh(geometry, material);
  mCloud = cloud;
  mScene.add(cloud);
}

function changeWave(radius, theta, percent) {
  var level = 20;
  var size = 50;
  var waveLen = Math.PI / 6;
  var geometry = mCloud.geometry;
  var material = mCloud.material;
  var positions = geometry.attributes.position.array;
  var totSize = level * size;
  var R = 1.05 * radius;

  for (var l = 0; l < level; l++) {
    var curTheta = Math.max(0, theta - waveLen * l / level);
    var w = R * Math.sin(curTheta);
    var x = R * Math.cos(curTheta);
    for (var i = 0; i < size; i ++) {
      var alpha = i / size * Math.PI * 2;
      var y = w * Math.cos(alpha);
      var z = w * Math.sin(alpha);
      positions[(l * size + i) * 3 + 0] = x;
      positions[(l * size + i) * 3 + 1] = y;
      positions[(l * size + i) * 3 + 2] = z;
    }
  }
  geometry.attributes.position.needsUpdate = true;
  material.uniforms.percent.value = percent;
}

function animate() {
  mRenderer.render(mScene, mCamera);
  earth.rotation.y += 0.001;
  mPoints.rotation.y += 0.001;
  // mControls.update();
  requestAnimationFrame(animate);
}


