//// PHYSICS ////

// Constants
// Gravitational Constant
var G = 6.674e-11;

// Init physics
function physInit(){
	
	// Physics reserved clock
	physClock = new THREE.Clock();
	physClock.start();
	
	// Array of all physics objects
	physArray = [];
}

// Add and object to the array and initialize all extra vectors
function physAdd(object){
	
	// Add necessary vectors (x, y ,z)
	object.velocity 	= new THREE.Vector3(0, 0, 0);
	object.acceleration = new THREE.Vector3(0, 0, 0);
	object.gravity		= new THREE.Vector3(0, 0, 0);
	object.spin 		= new THREE.Vector3(0, 0, 0);
	object.mass			= 0;
	
	geometry		= new THREE.Geometry();
	
	for (i=0; i<traceLength; i++){
    	geometry.vertices.push(object.position.clone());
    }    
    
    object.traceLine 	= new THREE.Line(geometry, material3);
    object.traceLine.geometry.dynamic = true;  
    scene.add(object.traceLine);
	
	// Add to the array
	physArray.push(object);
}

// Steps all physics objects
function physUpdate(){
	
	// Get time since last update
	var delta = (physClock.getDelta())*multiplier;
	
	// Update acceleration
	physAcceleration();
	
	// Update positions
	if(physMode == "verlet"){
		for (i = 0; i < physArray.length; i++){
			physPositionVerlet(physArray[i], delta);	
		}
	}
	else if(physMode == "RK4"){
		for (i = 0; i < physArray.length; i++){
			physPositionRK4(physArray[i], delta);	
		}
	}
	else {
		for (i = 0; i < physArray.length; i++){
			physPositionEuler(physArray[i], delta);	
		}
	}
	// Update physics FPS
	physStats.update();
}

function physAcceleration(){
	// Update all physics objects
	for (i = 0; i < physArray.length; i++){
		for (j = 0; j < physArray.length; j++){
			if (i != j){
				 physGravity(physArray[i], physArray[j]);
			}	
		}	
	}
}

// Returns a vector3 with time adjusted movement
function addVector(vector, delta){
	var tmp = vector.clone();
	tmp.multiplyScalar(delta);
	return tmp;
}

//// KINEMATICS ////
// Euler method
function physPositionEuler(object, delta){	
	// Update Velocity (acceleration)
	object.velocity.x += object.acceleration.x * delta;
	object.velocity.y += object.acceleration.y * delta;
	object.velocity.z += object.acceleration.z * delta;
	
	// Update Velocity (gravity)
	object.velocity.x += object.gravity.x * delta;
	object.velocity.y += object.gravity.y * delta;
	object.velocity.z += object.gravity.z * delta;
	
	// Update Position
	object.position.x += object.velocity.x * delta;
	object.position.y += object.velocity.y * delta;
	object.position.z += object.velocity.z * delta;
	
	// Update Rotation
	object.rotation.x += object.spin.x * delta; 
	object.rotation.y += object.spin.y * delta; 
	object.rotation.z += object.spin.z * delta; 
}

// Verlet Method
function physPositionVerlet(object, delta){
	//todo
	console.warn("Verlet physics not implemented yet!");
}

// Runge-Kutta Method
function physPositionRK4(object, delta){
	//todo
	console.warn("Runge-Kutta physics not implemented yet!");
}

// Calculates the gravitational pull between two objects 
function physGravity(a, b){
	var grav = new THREE.Vector3(0, 0, 0);
	grav = grav.subVectors(a.position, b.position);
	var r = grav.lengthSq();
	var A = (G)*(b.mass)/(r);
	grav = grav.normalize();
	grav.multiplyScalar(-A);
	a.gravity = grav;
}

//// LINES ////
function drawLine(){
		// obsolete dot method
		// dot = new THREE.Mesh( point, material);
		// scene.add( dot );
		// dot.position.copy(cube1.position);
		
		// Delete first element
		cube1.traceLine.geometry.vertices.push(cube1.traceLine.geometry.vertices.shift());
    	// Append to line
    	cube1.traceLine.geometry.vertices[traceLength-1].copy(cube1.position); 
    	cube1.traceLine.geometry.verticesNeedUpdate = true;
    	
    	setTimeout("drawLine()",1000);
}

//// Utilities ////

// Calculates the distance between two objects
function distanceFunction(a, b){
	return Math.pow(a.position.x - b.position.x, 2) +  Math.pow(a.position.y - b.position.y, 2) +  Math.pow(a.position.z - b.position.z, 2);
}

// Dynamically resizes the window based on current dimensions
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
    if (DEBUG) console.debug("Window resized");
}
	
// Initializes stats
function statsInit(){
	stats = new Stats();
	stats.setMode(0); // 0: fps, 1: ms
	
	physStats = new Stats();
	physStats.setMode(0); // 0: fps, 1: ms
		
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	
	physStats.domElement.style.position = 'absolute';
	physStats.domElement.style.left = '0px';
	physStats.domElement.style.top = '50px';

	document.body.appendChild( stats.domElement );
	document.body.appendChild( physStats.domElement );
}
