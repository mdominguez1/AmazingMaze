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
    buildGround();
    buildWalls(1);
    makeCeiling();
    makeLights();
    //drawFloor();
    //drawBoxes();
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

/**
 * Makes the ceiling for the dungeon view
 */
function makeCeiling(){
    var geom = new THREE.PlaneGeometry(600, 600);
    plane2 = new THREE.Mesh(geom, matGroundRoom);

    var front = plane2.clone();
    var back= plane2.clone();
    var left = plane2.clone();
    var right = plane2.clone();

    plane2.rotation.x = Math.PI/2;
    plane2.position.y = 51;

    left.position.z = 300;
    right.position.z = -300;
    front.rotation.y = Math.PI/2;
    front.position.x = 300;
    back.rotation.y = Math.PI/2;
    back.position.x = -300;

    room.push(plane2);
    room.push(front);
    room.push(back);
    room.push(left);
    room.push(right);

    for(var i = 0; i < room.length; i++){
        room[i].visible = false;
        scene.add(room[i]);
    }//end for

}//end makeCeiling

/**
 * Builds the walls for the maze
 * @param type - The different scenes determine the type of walls
 */
function buildWalls(type){
    var width = 10;
    
    var wall1 = makeWalls(130, 50, width, type);
    wall1.position.z = -85;
    walls.push(wall1);
    
    var wall2 = makeWalls(width, 50, 180, type);
    wall2.position.x = 60;
    walls.push(wall2);
    
    var wall3 = makeWalls(100, 50, width, type);
    wall3.position.z = 95;
    wall3.position.x = 15;
    walls.push(wall3);
    
    var wall4 = makeWalls(width, 50, 160, type);
    wall4.position.x = -60;
    wall4.position.z = 20;
    walls.push(wall4);
    
    var wall5 = makeWalls(width, 50, 60, type);
    wall5.position.x = 30;
    wall5.position.z = -55;
    walls.push(wall5);
    
    var wall6 = makeWalls(70, 50, width, type);
    wall6.position.x = -30;
    wall6.position.z = -55;
    walls.push(wall6);
    
    var wall7 = makeWalls(width, 50, 30, type);
    wall7.position.z = -40;
    walls.push(wall7);
    
    var wall8 = makeWalls(width, 50, 30, type);
    wall8.position.x = -30;
    wall8.position.z = -10;
    walls.push(wall8);
    
    var wall9 = makeWalls(100, 50, width, type);
    wall9.position.x = 15;
    walls.push(wall9);
    
    var wall10 = makeWalls(100, 50, width, type);
    wall10.position.z = 30;
    wall10.position.x = -15;
    walls.push(wall10);
    
    var wall11 = makeWalls(70, 50, width, type);
    wall11.position.z = 60;
    walls.push(wall11);
    
    var wall12 = makeWalls(width, 50, 40, type);
    wall12.position.z = 75;
    wall12.position.x = -30;
    walls.push(wall12);
    
    
    for(var i = 0; i<walls.length; i++){
        objects.push(walls[i]);
		scene.add(walls[i]);
    }//end for
	
}//end buildWalls()

/**
 * Helper method to make all the walls
 */
function makeWalls(length, width, height, type){
    
	var geometry = new THREE.BoxGeometry( length, width, height );
    var cube = new THREE.Mesh( geometry, material);
    if(type == 1){
        cube.material = matWallGreen;
    }
    if(type == 2){
       cube.material = matWallRoom;     
    }
	cube.castShadow = true;
    cube.position.y = width/2;
	return cube;
    
}//end makeWalls()

/**
 * Make lights for the maze
 */
function makeLights(){
    
    var light = new THREE.PointLight( 0x550000, 3, 100 ,2);
    light.position.set( -60, 30, -78);
    lights.push(light);
	
	var light2 = light.clone();
	light2.position.set(-60, 30, -62);
	lights.push(light2);
	
	var light3 = light.clone();
	light3.position.set(7, 30, -30);
	lights.push(light3);
	
	var light4 = light.clone();
	light4.position.set(23, 30, -30);
	lights.push(light4);
	
	var light5 = light.clone();
	light5.position.set(40, 30, -78);
	lights.push(light5);
	
	var light6 = light.clone();
	light6.position.set(50, 30, -78);
	lights.push(light6);
	
	var light7 = light.clone();
	light7.position.set(-53, 30, -10);
	lights.push(light7);
	
	var light8 = light.clone();
	light8.position.set(-37, 30, -10);
	lights.push(light8);
	
	var light9 = light.clone();
	light9.position.set(0, 30, 7);
	lights.push(light9);
	
	var light10 = light.clone();
	light10.position.set(0, 30, 22);
	lights.push(light10);
	
	var light11 = light.clone();
	light11.position.set(30, 30, 37);
	lights.push(light11);
	
	var light12 = light.clone();
	light12.position.set(30, 30, 53);
	lights.push(light12);
	
	var light13 = light.clone();
	light13.position.set(35, 30, 60);
	lights.push(light13);
	
	var light14 = light.clone();
	light14.position.set(53, 30, 60);
	lights.push(light14);
	
	var light15 = light.clone();
	light15.position.set(-30, 30, 37);
	lights.push(light15);
	
	var light16 = light.clone();
	light16.position.set(-30, 30, 53);
	lights.push(light16);
	
	var light17 = light.clone();
	light17.position.set(-53, 30, 90);
	lights.push(light17);
	
	var light18 = light.clone();
	light18.position.set(-37, 30, 90);
	lights.push(light18);
	
	for(var i = 0; i<lights.length; i++){
		scene.add( lights[i] );
		lights[i].intensity = 0;
	}//end for
}//end makeLights()
