/**
 * @author CJ Bland & Melchor Dominguez
 * Building one of the most dope mazes of all time
 * @version 4/17/2017
 */
/**Various different variables needed**/
var scene, camera, renderer, canvasHeight, canvasWidth, aspRat,
    viewLength;

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
    document.addEventListener("keydown", onDocumentKeyDown);
    camera = setCamera();
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
 *  1(49/97) puts the cmaera above the maze to look at the maze
 */
function onDocumentKeyDown(event){
    
    //keyboard events
    if(event.keyCode == 48 || event.keyCode == 96){
        console.log('0');
    }if(event.keyCode == 49 || event.keyCode == 97){
        console.log('1');
    }
}//end onDocumentKeyDown

/**
 *
 */
function drawBox(){
    var boxGeo = new THREE.BoxBufferGeometry = new THREE.BoxBufferGeometry(200, 200, 200);
    var boxMaterial = new THREE.MeshBasicMaterial({color:0xff0000, side: THREE.DoubleSide});
    var box = new THREE.Mesh(boxGeo, boxMaterial);

    box.position.set(100, 0, 100);
    scene.add(box);
}//end drawBox()
