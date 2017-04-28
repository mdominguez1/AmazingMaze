//All materials needed for camera & scene
var camera, scene, renderer;
var canvasWidth, canvasHeight;
var controls, viewLength, aspRat;

//Array of collision objects
var objects = [];

//Raycaser to find collisions
var raycaster;

//empty object
var pivot = new THREE.Object3D();

var matWallGreen, matWallRoom, matGroundGreen, matGroundRoom;

var walls = [];
var plane, plane2;
var room = [];
var check;
var lights = [];

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if(havePointerLock){
    
    var element = document.body;

    var pointerlockchange = function(event){
        
        if(document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element){
            controlsEnabled = true;
            controls.enabled = true;

            blocker.style.display = 'none';

        }else{
            controls.enabled = false;

            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';

            instructions.style.display = '';

        }

    };
    
    var pointerlockerror = function(event){

        instructions.style.display = '';

    };

    //Hook pointer lock state change events
    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    instructions.addEventListener('click', function(event){
        instructions.style.display = 'none';

        //Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();

    }, false);

}else{
        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

/**
 * Sets the window color, the canvas width & height, creates a new scene &
 * perspective camera, and add an event handler that listens for key presses
 */
function init(){

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    camera = setPerspective();

    scene = new THREE.Scene;

    var light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    //controls = new THREE.PointerLockControls(camera);
    //scene.add(controls.getObject());

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

    draw();

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xfffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasWidth, canvasHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

    //Initialize materials for wals and rooms
    material = new THREE.MeshPhongMaterial({color: 0x00ffff});
    matWallGreen = new THREE.MeshPhongMaterial({color: 0x228822});
    matWallRoom = new THREE.MeshPhongMaterial({color:0x777777});
    matGroundRoom = new THREE.MeshBasicMaterial({color: 0x999999, side:THREE.DoubleSide});
    matGroundGreen = new THREE.MeshBasicMaterial({color: 0x33cc33, side: THREE.DoubleSide});

    var geometry = new THREE.SphereGeometry(5, 32, 32);
    var materialSphere = new THREE.MeshPhongMaterial({color: 0x00ffff});
    var sphere = new THREE.Mesh(geometry, materialSphere);
    sphere.position.y = 10;
    
    camera.add(sphere);
    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());
    scene.add(sphere);
    
}//end init()

/**
 * Sets the perspective camera that will move around the scene
 */
function setPerspective(){

    var cameraTemp = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 1, 1000);
    cameraTemp.position.x = 50;
    cameraTemp.position.y = 10;
    cameraTemp.position.z = 0;
    cameraTemp.lookAt(new THREE.Vector3(0, 10, 0));

    return cameraTemp;

}//end cameraTemp;

/**
 * Sets the orthographical camera that will look at the maze
 */
function setOrthographic(){
    aspRat = canvasWidth/ canvasHeight;
    viewLength = 300;

    var cameraTemp = new THREE.OrthographicCamera(-aspRat * viewLength/2, aspRat*viewLength/2,
                                                    viewLength/2, -viewLength/2, -1000, 1000);
    cameraTemp.position.set(0, 25, 0);
    cameraTemp.lookAt(scene.position);

    return cameraTemp;
}//end setOrthographic()

function onKeyDown(event){
    
    //keyboard events
    switch(event.keyCode){

        case 38: //up
        case 87: //w
            moveForward = true;
            break;
        case 37: //left
        case 65: //a
            moveLeft = true;
            break;
        case 40: //down
        case 83: //s
            moveBackward = true;
            break;
        case 39: //right
        case 68: //d
            moveRight = true;
            break;
        case 32: //space
            camera = setOrthographic();
            if(canJump === true)
                velocity.y += 350;
            canJump = false;
            break;

    }
}//end onKeyDown

/**
 * Event handler for key up events in the scene
 */
function onKeyUp(event){
    
    //keyboard events
    switch(event.keyCode){
        case 38: // up
        case 87: //w
            moveForward = false;
            break;
        case 37: //left
        case 65: //a
            moveLeft = false;
            break;
        case 40: //down
        case 83: //s
            moveBackward = false;
            break;
        case 39: //right
        case 68: //d
            moveRight = false;
            break;
        case 32: //space
            camera = setPerspective();
            break;
    }//end switch

}//end onKeyUp()

/**
 *  Helper function to draw everything in the scene
 */
function draw(){
    
    setLights();
    buildGround();
    buildWalls(1);
    makeCeiling();
    makeLights();
    //drawFloor();
    //drawBoxes();

}//end draw()

/**
 * Renders the scene
 */
function renderScene(){
    renderer.render(scene, camera);
}

/**
 * Sets main lights for the scene 
 */
function setLights(){

    var light = new THREE.HemisphereLight(0xeeeeff, 777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 140, 130);
    spotLight.intensity = 1;
    //scene.add(spotLight);

}//end setLights()

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

    plane2.roation.x = Math.PI/2;
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

}//end makeCeiling()

function makeLights(){
    var light = new THREE.PointLight(0x550000, 3, 100, 2);
    light.position.set(-60, 30, -70);

    var light2 = light.clone();
    light2.position.set(-60, 30, -62);

    var light3 = light.clone();
    light3.position.set(7, 30, -30);

    var light4 = light.clone();
    light4.position.set(23, 30, -30);

    var light5 = light.clone();
    light5.position.set(40, 30, -78);

    var light6 = light.clone();
    light6.position.set(50, 30, -78);

    var light7 = light.clone();
    light7.position.set(-53, 30, -10);

    var light8 = light.clone();
    light8.position.set(-37, 30, -10);
    
    var light9
}

/**
 * Draws the floor for the scene
 */
function drawFloor(){

    var geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    geometry.rotateX(-Math.PI/2);

    for(var i = 0, l = geometry.vertices.length; i < 1; i++){
    
        var vertex = geometry.vertices[i];
        vertex.x += Math.random() * 20 -10;
        vertex.y += Math.random() * 2;
        vertex.z += Math.random() * 20-10;

    }//end for

    for(var i = 0, l = geometry.faces.length; i < l; i++){
        
        var face = geometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

    }//end for

    var material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

}//end drawFloor()

function drawBoxes(){

    var geometry = new THREE.BoxGeometry(20, 20, 20);
    
    for(var i = 0, l = geometry.faces.length; i < l; i++){
        
        var face = geometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

    }//end for 

    var material;
    for(var i = 0; i < 500; i ++){
        material = new THREE.MeshPhongMaterial({ specular: 0xffffff,
                                                shading: THREE.FlatShading,
                                                vertexColors: THREE.VertexColors});

        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.floor(Math.random() * 20 - 10) * 20;
        mesh.position.y = Math.floor(Math.random() * 20) * 20 + 10;
        mesh.position.z = Math.floor(Math.random() * 20 - 10) * 20;
        scene.add(mesh);
        
        material.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);

        objects.push(mesh);

    }//end for
}//end drawBoxes()

function onWindowResize(){

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    camera.aspect = canvasWidth/canvasHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(canvasWidth, canvasHeight);
}//end onWindowResize()

function animate(){
    
    requestAnimationFrame(animate);

    if(controlsEnabled){
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects(objects);

        var isOnObject = intersections.length > 0;
        var time = performance. now();
        var delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; //100 = mass

        if(moveForward) velocity.z -= 400.0 * delta;
        if(moveBackward) velocity.z += 400.0 * delta;

        if(moveLeft) velocity.x -= 400.0 * delta;
        if(moveRight) velocity.x += 400.0 * delta;

        if(isOnObject == true){

            velocity.y = Math.max(0, velocity.y);

            canJump = true;

        }//end if

        controls.getObject().translateX(velocity.x * delta);
        controls.getObject().translateY(velocity.y * delta);
        controls.getObject().translateZ(velocity.z * delta);

        if(controls.getObject().position.y < 10){

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }
        
        prevTime = time;
    }//end if 

    renderer.render(scene, camera);

}//end animate()