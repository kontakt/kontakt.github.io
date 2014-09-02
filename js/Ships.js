
var SHIP = { REVISION: '1' };

// Determines the thrust vector for an intercept
function shipPilot ( a, b ){
	var targetVel = new THREE.Vector3();
	var targetPos = new THREE.Vector3();
	var shipAccel = new THREE.Vector3();
	var maxAccel = 10;
	var t = 10;
	
	// Get the target's position and velocity relative to the ship
	targetVel.subVectors(b.velocity, a.velocity);
	targetPos.subVectors(b.position, a.position);
	
	shipAccel.x = 2*(targetPos.x)/t + 2*targetVel.x;
	shipAccel.y = 2*(targetPos.y)/t + 2*targetVel.y;
	shipAccel.z = 2*(targetPos.z)/t + 2*targetVel.z;
	console.log(shipAccel.lengthSq());
	
	a.acceleration.copy(shipAccel);
}

function missileTrack ( a, b ){
	var acceleration 	= new THREE.Vector3();
	var targetVel 		= new THREE.Vector3();
	var targetPos 		= new THREE.Vector3(); 
	var rotation 		= new THREE.Vector3();
	var N				= 3;
	
	// Get the target's position and velocity relative to the missile
	targetVel.subVectors( b.velocity, a.velocity );
	targetPos.subVectors( b.position, a.position );
	
	// Determine the rotation vector
	rotation.crossVectors( targetVel, targetPos );
	rotation.divideScalar( targetPos.lengthSq() );
	
	
	// Get the direction to the target and set your acceleration
	targetVel.multiplyScalar( N );
	
	// Set the acceleration 
	acceleration.crossVectors( rotation, targetVel );
	a.acceleration.copy( acceleration );
}

SHIP.Missile = function () {
	
};

SHIP.Missile.prototype = {
	
	constructor: SHIP.Missile,
	
};
