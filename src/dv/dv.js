var Shader = {
  vertexShader: 
    ['#define PI 3.14159265358979;',
    'vec2 latlongTween(float latitudeA, float longitudeA, float latitudeB, float longitudeB, float tween) {',
      'latitudeA  = radians(latitudeA);',
      'longitudeA = radians(longitudeA);',
      'latitudeB  = radians(latitudeB);',
      'longitudeB = radians(longitudeB);',

      'float d = 2.0 * asin( sqrt(',
       ' pow(( sin(( latitudeA - latitudeB ) / 2.0 )), 2.0 ) +',
        'cos( latitudeA ) *',
        'cos( latitudeB ) *',
        'pow( sin(( longitudeA - longitudeB ) / 2.0 ), 2.0 )',
      '));',
      'float A = sin(( 1.0 - tween ) * d ) / sin( d );',
      'float B = sin( tween * d ) / sin( d );',


      'float x = A * cos( latitudeA ) * cos( longitudeA ) + B * cos( latitudeB ) * cos( longitudeB );',
      'float y = A * cos( latitudeA ) * sin( longitudeA ) + B * cos( latitudeB ) * sin( longitudeB );',
      'float z = A * sin( latitudeA ) + B * sin( latitudeB );',


      'float latitude  = atan ( z, sqrt( pow( x, 2.0 ) + pow( y, 2.0 ))) * 180.0 / PI;',
      'float longitude = atan( y, x ) * 180.0 / PI;',


      'return vec2(latitude, longitude);',
    '}',

    'vec3 ll2xyz(float latitude, float longitude, float radius) {',
      'float phi   = radians(  90.0 - latitude  ); //  * PI / 180.0;',
      'float theta = radians( 360.0 - longitude ); // * PI / 180.0;',

      'return vec3(radius * sin(phi) * cos(theta), radius * cos(phi), radius * sin(phi) * sin(theta));',
    '}',

    'uniform float size;',
    'uniform float time;',
    'uniform float totTime;',
    'attribute vec4 latlong;',
    'attribute float altitude;',
    'attribute float delay;',
    'attribute vec3 customColor;',
    'varying vec3 v_color;',
    'void main() {',
      'v_color = customColor;',
      'float ratio = mod(time + delay, 30000.0) / 30000.0;',
      'vec2 ll = latlongTween(latlong.x, latlong.y, latlong.z, latlong.w, ratio);',
      'float arcAngle = radians(ratio * 180.0);',
      'float arcRadius = 1.25 + sin(arcAngle) * altitude;',
      'vec3 pos = ll2xyz(ll.x, ll.y, arcRadius);',
      'vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);',
      'gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ));',
      'gl_Position = projectionMatrix * mvPosition;',
    '}'].join('\n')
  ,
  fragmentShader: 
    ['uniform sampler2D map;',
    'varying vec3 v_color;',
    'void main() {',
      'gl_FragColor = vec4(v_color, 1.0 );',
      'gl_FragColor = gl_FragColor * texture2D(map, gl_PointCoord);',
    '}'].join('\n')
  
};

var mScene, mContainer, mRenderer, mCamera, mSystem, mControls, mFlightsPathLines, mPlane;
var earth;
var mFlightsPathSplines = [];
var mFlightsStartTimes = [];
var mFlightsEndTimes = [];
var mFlightsDelayTimes = [];
var mFlightsPathLinesOpacity = 0.02;
var mLoader = new THREE.TextureLoader();
var mStartTime = Date.now();

var mStartPoints = [];
var mEndPoints = [];
var mDistances = [];
var mMaxAltitudes = [];

var mTotTime = 20000;
mLoader.crossOrigin = true;

THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
    // console.log( item, loaded, total );
    if (loaded === total) {
      $('.static-earth').css('display', 'none');
    }
};
window.onload = function onload () {
  init();
};

function init() {
  initTHREE();
  addSystem();
  addSun();
  addEarth();
  addFlights();
  addPlanes();
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

  // var axisHelper = new THREE.AxisHelper(1500);
  // mScene.add(axisHelper);

  // mControls = new THREE.OrbitControls(mCamera, mRenderer.domElement);
  // mControls.enableZoom = false;
  // mControls.autoRotate = true;
  // mControls.autoRotateSpeed = 1.0;
}

function addSystem() {
  mSystem = new THREE.Object3D();
  mSystem.name = 'system';
  mScene.add(mSystem);
}

function addSun() {
  var ambientLight = new THREE.AmbientLight(0xffffff, 1);
  var sun = new THREE.SpotLight(0xffffff, 0.8);

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

  // sun.shadowCameraHelper = new THREE.CameraHelper( sun.shadow.camera );
  // mSystem.add(sun.shadowCameraHelper);

  mSystem.add(ambientLight);
  mSystem.add(sun);
}

function addEarth() {
  var earthGeom = new THREE.SphereGeometry(1.25, 64, 32);
  var earthMat = new THREE.MeshPhongMaterial({
    map: mLoader.load('https://img.alicdn.com/tps/TB1IdZwNXXXXXcFaXXXXXXXXXXX-2048-1024.jpg'),
    // normalMap: mLoader.load('https://img.alicdn.com/tps/TB1gSwKJFXXXXXNaXXXXXXXXXXX-8192-4096.jpg'),
    bumpScale: 0.02,
    shininess: 4,
  });

  earth = new THREE.Mesh(earthGeom, earthMat);
  earth.name = 'earth';
  earth.castShadow = true;
  earth.receiveShadow = false;
  mSystem.add(earth);
}

function addFlights() {
  setupFlightsPathSplines(1.25);
  setupFlightsPathLines();
}

function setupFlightsPathSplines(radius) {
  var i, distance, altitudeMax,
    originLatitude, originLongitude,
    destinationLatitude, destinationLongitude,
    pointsTotal, points, p,
    arcAngle, arcRadius,
    pointLL, pointXYZ,
    spline;
  var flightsTotal = flights.length;

  for (i = 0; i < flightsTotal; i++) {
    originLatitude = flights[i][0];
    originLongitude = flights[i][1];
    destinationLatitude = flights[i][2];
    destinationLongitude = flights[i][3];
    distance = latlongDistance(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    altitudeMax = 0.02 + distance * 0.1;

    /* *********为shader纪录信息************ */
    mMaxAltitudes[i] = altitudeMax;
    mDistances[i] = distance;
    /* ********************** */
    pointsTotal = 8;
    points = [];
    for (p = 0; p < pointsTotal + 1; p++) {

      arcAngle = p * 180 / pointsTotal;
      arcRadius = radius + (Math.sin(arcAngle * Math.PI / 180)) * altitudeMax;

      pointLL = latlongTween(
        originLatitude,
        originLongitude,
        destinationLatitude,
        destinationLongitude,
        p / pointsTotal
      );

      pointXYZ = ll2xyz(pointLL.latitude, pointLL.longitude, arcRadius);
      points.push(new THREE.Vector3( pointXYZ.x, pointXYZ.y, pointXYZ.z));
    }
    spline = new THREE.CatmullRomCurve3(points);
    mFlightsPathSplines.push(spline);
    setFlightTimes(i);

    // var geometry = new THREE.Geometry();
    // console.log(spline.getPoints(50));
    // geometry.vertices = spline.getPoints(50);
    // var material = new THREE.MeshPhongMaterial({color: 0xff0000});
    // var testLine = new THREE.Line(geometry, material);
    // mSystem.add(testLine);
  }
}

function setupFlightsPathLines() {
  var i, j, point, beginsAtNormal, endAtNormal, index;
  var color = new THREE.Color();
  var flightsTotal = flights.length;
  var segmentsTotal = 32;
  var geometry = new THREE.BufferGeometry();
  var material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
    transparent: true,
    opacity: mFlightsPathLinesOpacity,
    depthTest: true,
    depthWrite: false,
    linewidth: 1
  });

  var positions = new Float32Array(flightsTotal * segmentsTotal * 3 * 2);
  var colors = new Float32Array(flightsTotal * segmentsTotal * 3 * 2);
  for (i = 0; i < flightsTotal; i++) {
    var points = mFlightsPathSplines[i].getPoints(32);
    for (j = 0; j < segmentsTotal; j++) {
      beginsAtNormal = j / (segmentsTotal - 1);
      index = (i * segmentsTotal + j) * 3;
      //point = mFlightsPathSplines[i].getPoint(beginsAtNormal);
      positions[index + 0] = points[j].x;
      positions[index + 1] = points[j].y;
      positions[index + 2] = points[j].z;

      // color.setHSL(
      //   (flights[i][1] + 100) % 360 / 360,
      //   1,
      //   0.3 + beginsAtNormal * 0.2
      // );
      color.set(0x166fff);

      colors[index + 0] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;

    }
  }


  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

  mFlightsPathLines = new THREE.Line(geometry, material);
  mSystem.add(mFlightsPathLines);
}

function setFlightTimes( index ){
  var flight    = flights[index],
  distance  = latlongDistance(flight[0], flight[1], flight[2], flight[3]),
  startTime = Date.now() + Math.floor(Math.random() * 1000 * 20);
  var duration  = Math.floor(distance * 1000 * 80);


  //  Just a little bit of variation in there.

  duration *= 0.8 + Math.random()
  mFlightsStartTimes[index] = startTime
  mFlightsEndTimes[index] = startTime + duration
}


//  This resource is fantastic (borrowed the algo from there):
//  http://www.movable-type.co.uk/scripts/latlong.html
//  Would be nice to integrate this with latlongTween() to reduce
//  code and bring the styles more in line with each other.
function latlongDistance( latitudeA, longitudeA, latitudeB, longitudeB ){

  var
  earthRadiusMeters = 6371000,

  φ1 = latitudeA * Math.PI / 180,
  φ2 = latitudeB * Math.PI / 180,
  Δφ = ( latitudeB  - latitudeA  ) * Math.PI / 180,
  Δλ = ( longitudeB - longitudeA ) * Math.PI / 180,

  a = Math.sin( Δφ / 2 ) * Math.sin( Δφ / 2 ) +
    Math.cos( φ1 ) * Math.cos( φ2 ) *
    Math.sin( Δλ / 2 ) * Math.sin( Δλ / 2 ),
  c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a )),

  distanceMeters = earthRadiusMeters * c;


  //  For this demo we don’t need actual distance in kilometers
  //  because we’re just using a factor to scale time by
  //  so we’ll just return the normal of earth’s circumference.

  return c;
}

function latlongTween( latitudeA, longitudeA, latitudeB, longitudeB, tween ){


  //  First, var’s convert degrees to radians.

  latitudeA  *= Math.PI / 180
  longitudeA *= Math.PI / 180
  latitudeB  *= Math.PI / 180
  longitudeB *= Math.PI / 180


  //  Now we can get seriously mathy.

  var
  d = 2 * Math.asin( Math.sqrt(

    Math.pow(( Math.sin(( latitudeA - latitudeB ) / 2 )), 2 ) +
    Math.cos( latitudeA ) *
    Math.cos( latitudeB ) *
    Math.pow( Math.sin(( longitudeA - longitudeB ) / 2 ), 2 )
  )),
  A = Math.sin(( 1 - tween ) * d ) / Math.sin( d ),
  B = Math.sin( tween * d ) / Math.sin( d )


  //  Here’s our XYZ location for the tween Point. Sort of.
  //  (It doesn’t take into account the sphere’s radius.)
  //  It’s a necessary in between step that doesn’t fully
  //  resolve to usable XYZ coordinates.

  var
  x = A * Math.cos( latitudeA ) * Math.cos( longitudeA ) + B * Math.cos( latitudeB ) * Math.cos( longitudeB ),
  y = A * Math.cos( latitudeA ) * Math.sin( longitudeA ) + B * Math.cos( latitudeB ) * Math.sin( longitudeB ),
  z = A * Math.sin( latitudeA ) + B * Math.sin( latitudeB )


  //  And we can convert that right back to lat / long.

  var
  latitude  = Math.atan2( z, Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ))) * 180 / Math.PI,
  longitude = Math.atan2( y, x ) * 180 / Math.PI


  //  Return a nice package of useful values for our tween Point.

  return {

    latitude:  latitude,
    longitude: longitude
  }
}

function ll2xyz( latitude, longitude, radius ){

  var
  phi   = (  90 - latitude  ) * Math.PI / 180,
  theta = ( 360 - longitude ) * Math.PI / 180

  return {

    x: radius * Math.sin( phi ) * Math.cos( theta ),
    y: radius * Math.cos( phi ),
    z: radius * Math.sin( phi ) * Math.sin( theta )
  }
}

function addPlanes() {
  var flightsTotal = flights.length;
  var geometry = new THREE.BufferGeometry();
  var material = new THREE.ShaderMaterial({
    vertexShader: Shader.vertexShader,
    fragmentShader: Shader.fragmentShader,
    uniforms: {
      map: { type: 't', value: mLoader.load('https://img.alicdn.com/tps/TB1f7ThNXXXXXcHXVXXXXXXXXXX-128-128.png') },
      size: { type: 'f', value: 0.04},
      time: { type: 'f', value: 0 },
      totTime: { type: 'f', value: mTotTime },
    },
    // blending:       THREE.AdditiveBlending,
    depthTest:      true,
    depthWrite:     false,
    transparent:    true
  });
  var positions = new Float32Array(flightsTotal * 3);
  var colors = new Float32Array(flightsTotal * 3);
  var latlongs = new Float32Array(flightsTotal * 4);
  var altitudes = new Float32Array(flightsTotal * 1);
  var delays = new Float32Array(flightsTotal * 1);
  var color = new THREE.Color();
  var i;
  for ( i = 0; i < flightsTotal; i ++) {
    var point = mFlightsPathSplines[i].getPoint(0.5);
    positions[i * 3 + 0] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;

    latlongs[i * 4 + 0] = flights[i][0];
    latlongs[i * 4 + 1] = flights[i][1];
    latlongs[i * 4 + 2] = flights[i][2];
    latlongs[i * 4 + 3] = flights[i][3];

    altitudes[i] = mMaxAltitudes[i];

    // color.setHSL(
    //   (( flights[ i ][ 1 ] + 100 ) % 360 ) / 360,
    //   1.0,
    //   0.55
    // )

    color.set(0x166fff);

    colors[ 3 * i + 0 ] = color.r//  Red
    colors[ 3 * i + 1 ] = color.g//  Green
    colors[ 3 * i + 2 ] = color.b//  Blue

    delays[i] = THREE.Math.randFloat(0, 30000);
  }
  geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
  geometry.addAttribute('latlong', new THREE.BufferAttribute(latlongs, 4));
  geometry.addAttribute('altitude', new THREE.BufferAttribute(altitudes, 1));
  geometry.addAttribute('delay', new THREE.BufferAttribute(delays, 1));
  geometry.computeBoundingBox();
  var planes = new THREE.Points(geometry, material);
  mPlane = planes;
  mSystem.add(planes);
  // updatePlanesPosition();
}

function updatePlanesPosition() {
  var flightsTotal = flights.length;
  var totTime = 100000;
  var i;
  var nowTime = Date.now();
  var deltaTime = (nowTime - mStartTime) % 30000;
  var positions = mPlane.geometry.attributes.position.array;
  for ( i = 0; i < flightsTotal; i ++) {
    var point = mFlightsPathSplines[i].getPoint((deltaTime + mFlightsDelayTimes[i] + 30000) / 30000);
    positions[i * 3 + 0] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  }
  mPlane.geometry.attributes.position.needsUpdate = true;
}

function animate() {
  mRenderer.render(mScene, mCamera);
  TWEEN.update();

  earth.rotation.y += 0.001;
  mPlane.rotation.y += 0.001;
  mFlightsPathLines.rotation.y += 0.001;
  
  // mControls.update();
  var time = Date.now() % mTotTime;
  mPlane.material.uniforms.time.value = time;
  requestAnimationFrame(animate);
}
