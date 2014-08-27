//// PHYSICS ////

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
	object.spin 		= new THREE.Vector3(0, 0, 0);
	
	// Add to the array
	physArray.push(object);
}

// Steps all physics objects
function physUpdate(){
	
	// Get time since last update
	var delta = physClock.getDelta();
	
	// Update all physics objects
	for (i = 0; i < physArray.length; i++){
		physPosition(physArray[i], delta);	
	}
}

// Returns a vector3 with time adjusted movement
function addVector(vector, delta){
	var tmp = vector.clone();
	tmp.multiplyScalar(delta);
	return tmp;
}

// Kinematics
function physPosition(object, delta){
	// Update Position
	object.position.x += (object.velocity.x * delta) + (0.5*object.acceleration.x*(Math.pow(delta,2)));
	object.position.y += (object.velocity.y * delta) + (0.5*object.acceleration.y*(Math.pow(delta,2)));
	object.position.z += (object.velocity.z * delta) + (0.5*object.acceleration.z*(Math.pow(delta,2)));
	
	// Update Velocity
	object.velocity.x += object.acceleration.x * delta;
	object.velocity.y += object.acceleration.y * delta;
	object.velocity.z += object.acceleration.z * delta;
	
	// Update Rotation
	object.rotation.x += object.spin.x * delta; 
	object.rotation.y += object.spin.y * delta; 
	object.rotation.z += object.spin.z * delta; 
}

//// Utilities ////
