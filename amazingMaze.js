/**
 * @author CJ Bland & Melchor Dominguez
 * Building one of the most dope mazes of all time
 * @version 4/17/2017
 */
/**Various different variables needed**/
var camera, scene, renderer, pcamera, ocamera;
var geometry, material, mesh;
var canvasWidth, canvasHeight, aspRat, viewLength;

//Controls for the cursor
var controls;

//Objects in the scene to collide
var objects = [];

//Raycaster to help with collision
var raycaster;

//Material for different scenes
var matWallGreen, matWallRoom, matGroundGreen, matGroundRoom;

var walls = [];
var plane, plane2;
var room = [];
var check;
var lights = [];

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {

	var element = document.body;
	var pointerlockchange = function ( event ) {

		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
			controlsEnabled = true;
			controls.enabled = true;
			blocker.style.display = 'none';
		} else {

			controls.enabled = false;
			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';
			instructions.style.display = '';

		}
	};

	var pointerlockerror = function ( event ) {
		instructions.style.display = '';
	};

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

	instructions.addEventListener( 'click', function ( event ) {
		instructions.style.display = 'none';
		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
		element.requestPointerLock();
    }, false );

} else {
	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

init();
draw();
animate();

var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

function init() {
    
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    aspRat = canvasWidth/canvasHeight;

	pcamera = setPerspective();

	scene = new THREE.Scene();
	scene.fog = new THREE.Fog(0xffffff, 0, 750);

	var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
	light.position.set(0.5, 1, 0.75);
	scene.add(light);

    camera = pcamera;
	controls = new THREE.PointerLockControls(camera);
	scene.add(controls.getObject());

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x0088ff, 1);
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize(canvasWidth, canvasHeight);
    renderer.shadowMapEnabled = true;

	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
    
    ocamera = setOrthographic();

    material = new THREE.MeshPhongMaterial({color: 0x00ffff});
    matWallGreen = new THREE.MeshPhongMaterial({color: 0x228822});
    matWallRoom = new THREE.MeshPhongMaterial({color: 0x777777});
    matGroundRoom = new THREE.MeshBasicMaterial({color: 0x999999, side: THREE.DoubleSide});
    matGroundGreen = new THREE.MeshBasicMAterial({color: 0x33cc33, side: THREE.DoubleSide});

    var geometry = new THREE.SphereGeometry(5, 32, 32); 
    var materialSphere = new THREE.MeshPhongMaterial({color: 0x00ffff});
    var sphere = new THREE.Mesh(geometry, materialSphere);
    sphere.position.y = 10;
    pcamera.add(sphere);


    camera = pcamera;
	controls = new THREE.PointerLockControls(camera);
	scene.add(controls.getObject());

    draw();
}

function draw(){
    //drawFloor();
    drawBoxes();
    buildGround();
}//end draw()

/**
 * Draws the floor for the scene()
 */
function drawFloor(){
    // floor
	geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	geometry.rotateX( - Math.PI / 2 );

	for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
		var vertex = geometry.vertices[ i ];
		vertex.x += Math.random() * 20 - 10;
		vertex.y += Math.random() * 2;
		vertex.z += Math.random() * 20 - 10;
	}

	for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
		var face = geometry.faces[ i ];
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
	}

	material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

}//end drawFloor()

/**
 * Draws the boxes for the scene()
 */
function drawBoxes(){
    // objects
	geometry = new THREE.BoxGeometry( 20, 20, 20 );
	for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {
		var face = geometry.faces[ i ];
		face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
	}
	for ( var i = 0; i < 500; i ++ ) {
		material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
		mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
		mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
		scene.add( mesh );
		material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
		objects.push( mesh );
	}

}//end drawBoxes()

function setPerspective(){
    var cameraTemp = new THREE.PerspectiveCamera(75, aspRat, 1, 1000);

    return cameraTemp;
}//end setPerspective()

function setOrthographic(){
    viewLength = 300;

    var cameraTemp = new THREE.OrthographicCamera(-aspRat * viewLength/2, aspRat*viewLength/2, 
                                                    viewLength/2, -viewLength/2, -1000, 1000);
    cameraTemp.position.set(0, 25, 0);
    cameraTemp.lookAt(scene.position);

    return cameraTemp;
}//end setOrthographic()

function onKeyDown(event) {
    //keyboard events
	switch(event.keyCode){
		case 38: // up
		case 87: // w
			moveForward = true;
			break;
		case 37: // left
		case 65: // a
			moveLeft = true; 
            break;
		case 40: // down
		case 83: // s
       		moveBackward = true;
			break;
		case 39: // right
		case 68: // d
			moveRight = true;
			break;
        case 32: //space
            camera = ocamera;
            if(canJump === true)
                velocity.y += 350;
			canJump = false;
			break;
	}//end switch
}//end onKeyDown(event)

function onKeyUp(event){
	switch( event.keyCode ) {
		case 38: // up
		case 87: // w
			moveForward = false;
			break;
		case 37: // left
		case 65: // a
			moveLeft = false;
			break;
		case 40: // down
		case 83: // s
			moveBackward = false;
			break;
		case 39: // right
		case 68: // d
			moveRight = false;
			break;
        case 32: //space
            camera = pcamera;
            break;
	}//end switch
}//end onKeyUp

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}//end onWindowResize()

function animate() {
	requestAnimationFrame( animate );
	if (controlsEnabled) {
		raycaster.ray.origin.copy( controls.getObject().position );
    	raycaster.ray.origin.y -= 10;
		var intersections = raycaster.intersectObjects( objects );
		var isOnObject = intersections.length > 0;
		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;
		velocity.x -= velocity.x * 10.0 * delta;
    	velocity.z -= velocity.z * 10.0 * delta;
		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
		if ( moveForward ) velocity.z -= 400.0 * delta;
		if ( moveBackward ) velocity.z += 400.0 * delta;
		if ( moveLeft ) velocity.x -= 400.0 * delta;
		if ( moveRight ) velocity.x += 400.0 * delta;
		if ( isOnObject === true ) {
			velocity.y = Math.max( 0, velocity.y );
			canJump = true;
		}
		controls.getObject().translateX( velocity.x * delta );
		controls.getObject().translateY( velocity.y * delta );
		controls.getObject().translateZ( velocity.z * delta );
		if ( controls.getObject().position.y < 10 ) {
			velocity.y = 0;
			controls.getObject().position.y = 10;
			canJump = true;
		}
		prevTime = time;
	}
	renderer.render( scene, camera );
}

function buildGround(){
    var geom = new THREE.PlaneGeometry(600, 600);
    plane = new THREE.Mesh(geom, matGroundGreen);
    plane.rotation.x = Math.PI/2;
    scene.add(plane);
}//end buildGround()

