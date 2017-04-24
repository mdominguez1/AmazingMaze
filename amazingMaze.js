/**
 * @author CJ Bland & Melchor Dominguez
 * Building one of the most dope mazes of all time
 * @version 4/17/2017
 */
/**Various different variables needed**/
var scene, camera, renderer, canvasHeight, canvasWidth, aspRat,
    viewLength, raycaster, controlsEnabled;

/** Controls **/
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var lookUp = false;

init();
draw();
renderScene();

/**
 * Sets the window color, the canvas width and height, creates a new scene and
 * orthographic camera, and add an event handler that listens for the alpha 
 * change.
 */
function init(){
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor(0xffffff, 1);

    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    renderer.setSize(canvasWidth, canvasHeight);
    document.getElementById("WebGLCanvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();

    viewLength = 500;
    aspRat = canvasWidth/canvasHeight;

    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

    camera = setPerspective();
    scene.add(camera);
    draw();
}//end init()

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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    controls = new THREE.PointerLockControls(camera);
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
    requestAnimaionFrame(animate);

    if(controlsEnabled){
        raycaster.ray.origin.cop(controls.getObject().position);
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
            velocity.y = Math.max(0, velocity.y);
        }
    }
}

/**
 *
 */
function drawBox(){
    var boxGeo = new THREE.BoxBufferGeometry(200, 200, 200);
    var boxMaterial = new THREE.MeshBasicMaterial({color:0xff0000, side: THREE.DoubleSide});
    var box = new THREE.Mesh(boxGeo, boxMaterial);

    box.position.set(100, 0, 100);
    scene.add(box);
}//end drawBox()
