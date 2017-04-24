/**
 * @author CJ Bland & Melchor Dominguez
 * Building one of the most dope mazes of all time
 * @version 4/17/2017
 */
/**Various different variables needed**/
var scene, camera, renderer, canvasHeight, canvasWidth, aspRat,
    viewLength, raycaster, controlsEnabled, controls;

var objects = [];

var raycaster;

var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document ||
                        'webkitPointerLockElement' in document;

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
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
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
renderScene();
animate();

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var lookUp = false; 

var prevTime = performance.now();
var velocity = new THREE.Vector3();


/**
 * Sets the window color, the canvas width and height, creates a new scene and
 * orthographic camera, and add an event handler that listens for the alpha 
 * change.
 */
function init(){
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    renderer.setSize(canvasWidth, canvasHeight);
    document.getElementById("WebGLCanvas").appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    scene = new THREE.Scene();

    viewLength = 500;
    aspRat = canvasWidth/canvasHeight;

    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

    camera = setPerspective();

    controls = new THREE.PointerLockControls(camera);
    if(controls == null){
        console.log("oops");
    }
    scene.add(controls.getObject());
    draw();
}//end init()

function onWindowResize(){
    camera.aspect = canvasWidth/ canvasHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(canvasWidth, canvasHeight);
    renderScene();
}
/**
 * Returns the camera to its initial position when the scene is first loaded
 */
function setCamera(){
    var cameraTemp = new THREE.OrthographicCamera(-aspRat*viewLength/2, aspRat*viewLength/2,
                                                    viewLength/2, -viewLength/2, -1000, 1000);
    cameraTemp.position.set(0, 100, 0);
    cameraTemp.lookAt(scene.position);
    return cameraTemp;
}//end setCamera()

function setPerspective(){
    cameraTemp = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    controls = new THREE.PointerLockControls(cameraTemp);
    return cameraTemp;
}//end setPerspective()

/**
 * Draws the material in the scenes 
 */
function draw(){
    drawFloor();
    drawBox();
}//end draw()


/**
 * Renders the scene
 */
function renderScene(){
    renderer.render(scene, camera);
}//end render scene

/**
 * Draws the floor for the scene 
 */
function drawFloor(){
    var floorMaterial = new THREE.MeshBasicMaterial({color: 0x444444, side: THREE.DoubleSide});
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI/2;
    scene.add(floor);
}//end drawFloor()

/**
 * Event handler for key down events in the scene
 *  0(48/96) puts the camera back to its initial state
 *  
 *
 */
function onKeyDown(event){
    
    //keyboard events
    switch(event.keyCode){
        case 48:
        case 96:
            lookUp = true;
            break;
        case 38: //up
        case 87: //w
            console.log('w');
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
    }//end switch
}//end onKeyDown()

/**
 * Stops any events where keys are no longer being pressed
 */
function onKeyUp(event){
    
    //keyboard events
    switch(event.keyCode){
        case 48:
        case 96:
            lookUp = false;
            break;
        case 38: //up
        case 87: //w
            console.log('w');
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
    }//end switch
}//end onKeyUp

function animate(){
    requestAnimationFrame(animate);
    
    if(controlsEnabled){
        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects(objects);

        var isOnObject = intersections.length > 0;

        var time = performance.now();
        var delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        if(moveForward) velocity.z -= 400.0 * delta;
        if(moveBackward) velocity.z += 400.0 * delta;

        if(moveLeft) velocity.x -= 400.0 * delta;
        if(moveRight) velocity.x += 400.0 * delta;

        if(isOnObject == true){
            //velocity.y = Math.max(0, velocity.y);
            //velocity.z = Math.max(0,velocity.z);
            //velocity.x = Math.max(0, velocity.x);
        }//end if

        controls.getObject().translateX(velocity.x * delta);
        controls.getObject().translateY(velocity.y * delta);
        controls.getObject().translateZ(velocity.z * delta);

        prevTime = time;
    }//end if 
}//end animate()

/**
 *
 */
function drawBox(){
    var boxGeo = new THREE.BoxBufferGeometry(200, 200, 200);
    var boxMaterial = new THREE.MeshBasicMaterial({color:0xff0000, side: THREE.DoubleSide});
    var box = new THREE.Mesh(boxGeo, boxMaterial);

    box.position.set(100, 0, 100);
    objects.push(box);
    scene.add(box);
}//end drawBox()
