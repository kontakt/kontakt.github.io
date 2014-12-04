//// PHYSICS ////

//// Constants ////
// Gravitational Constant
var G = 6.674e-11;

// Astronomical Unit in km
var AU = 149597871;

// Null vector
var zero = new THREE.Vector3( 0, 0, 0 );

// Temp vector
var tmp = new THREE.Vector3();

//// Control variables ////
// Physics method
var physMode = "euler";
// Number of points in physics trace
var traceLength = 10000;
// Distance between trace points squared
var traceInterval = 1000;
// Speed of physics simulation (seconds per second)
var multiplier = 1;
var multiSave = multiplier;
var pause = false;

// Init physics
function physInit(){
	
	// Physics reserved clock
	physClock = new THREE.Clock();
	physClock.start();
	
	// Array of all physics objects
	physArray = [];
	if ( DEBUG ) console.debug( "Phys Init" );
}

// Add and object to the array and initialize all extra vectors
function physAdd( a ){
	
	// Add necessary vectors (x, y ,z)
	a.velocity 		= new THREE.Vector3( 0, 0, 0 );
	a.acceleration 	= new THREE.Vector3( 0, 0, 0 );
	a.gravity		= new THREE.Vector3( 0, 0, 0 );
	a.spin 			= new THREE.Vector3( 0, 0, 0 );
	a.mass			= 0;
	a.dead 			= false;
	
	// Points in trace
	a.tracePT		= new THREE.Geometry();
	
	for (i=0; i<traceLength; i++){
    	a.tracePT.vertices.push(a.position.clone());
    }    
    
    // Line for trace
    a.traceLine 	= new THREE.Line( a.tracePT, material3 );
    a.traceLine.geometry.dynamic = true;  
    a.traceLine.frustumCulled = false;
    scene.add( a.traceLine );

	// Add to the array
	physArray.push(a);
}

// Steps all physics objects
function physUpdate(){
	
	// Get time since last update
	var delta = physClock.getDelta() * multiplier;
	
	// Update acceleration
	physAcceleration();
	
	
	// Update positions
	if( physMode == "verlet" ){
		for ( i = 0; i < physArray.length; i++ ){
			physPositionVerlet( physArray[i], delta );
			drawLine( physArray[i] );	
		}
	}
	else if( physMode == "RK4" ){
		for (i = 0; i < physArray.length; i++){
			physPositionRK4( physArray[i], delta );
			drawLine( physArray[i] );	
		}
	}
	else {
		for (i = 0; i < physArray.length; i++){
			if ( !physArray[i].dead ){
				physPositionEuler( physArray[i], delta );
				if ( i != physArray.length-1 ) missileTrack( physArray[i], cube1 );
				drawLine( physArray[i] );	
			}
			else {
				eraseLine( physArray[i] );
			}
				
		}
	}
	// Update physics FPS
	physStats.update();
	
	// Set the next call for physics
	setTimeout( function(){physUpdate();}, 8 );
}

function physAcceleration(){
	// Update all physics objects
	for ( i = 0; i < physArray.length; i++ ){
		if ( physArray[i].dead ) continue;
		for ( j = 0; j < physArray.length; j++ ){
			if ( physArray[j].dead ) continue;
			if ( i != j ){
				 physGravity(physArray[i], physArray[j]);
			}	
		}	
	}
}

function physPause(){
		if(pause){
			multiplier = multiSave;
			multiSave = 0;
			pause = false;
		}
		else{
			multiSave = multiplier;
			multiplier = 0;
			pause = true;
		}
}

//// KINEMATICS ////
// Euler method
function physPositionEuler(a, delta){	
	// Update Velocity (acceleration)
	a.velocity.x += a.acceleration.x * delta;
	a.velocity.y += a.acceleration.y * delta;
	a.velocity.z += a.acceleration.z * delta;
	
	// Update Velocity (gravity)
	a.velocity.x += a.gravity.x * delta;
	a.velocity.y += a.gravity.y * delta;
	a.velocity.z += a.gravity.z * delta;
	
	// Update Position
	a.position.x += a.velocity.x * delta;
	a.position.y += a.velocity.y * delta;
	a.position.z += a.velocity.z * delta;
	
	// Update Rotation
	a.rotation.x += a.spin.x * delta; 
	a.rotation.y += a.spin.y * delta; 
	a.rotation.z += a.spin.z * delta; 
}

// Verlet Method
function physPositionVerlet(a, delta){
	//todo
	throw "Verlet physics not implemented yet!";
}

// Runge-Kutta Method
function physPositionRK4(a, delta){
	//todo
	throw "Runge-Kutta physics not implemented yet!";
}

// Calculates the gravitational pull between two objects 
function physGravity(a, b){
	var grav = new THREE.Vector3(0, 0, 0);
	grav = grav.subVectors(a.position, b.position);
	var as = a.geometry.boundingSphere.radius;
	var bs = b.geometry.boundingSphere.radius;
	// Detect collision
	if ( grav.length() <= as+bs) {
		if ( a.mass <= b.mass ) physCollision( b, a );
			
		else physCollision( a, b );
		return;	
	}
	grav.multiplyScalar(1000);
	var r = grav.lengthSq();
	var A = (G)*(b.mass)/(r);
	grav = grav.normalize();
	grav.multiplyScalar(-A);
	a.gravity.copy( grav );
	
}

// Collision physics
function physCollision ( a, b ){
	// Transfer mass and momentum
	var aMomentum 		= new THREE.Vector3( 0, 0, 0 );
	var bMomentum 		= new THREE.Vector3( 0, 0, 0 );
	aMomentum.copy( a.velocity );
	bMomentum.copy( b.velocity );
	aMomentum.multiplyScalar( a.mass );
	bMomentum.multiplyScalar( b.mass );
	aMomentum.addVectors( aMomentum, bMomentum );
	a.mass += b.mass;
	aMomentum.divideScalar( a.mass );
	a.velocity.copy( aMomentum );
	
	// Remove the object from the scene and mark it as 'dead' for physics purposes
	b.velocity.copy( zero );
	b.acceleration.copy( zero );
	b.gravity.copy( zero );
	b.spin.copy( zero );
	b.mass = 0;
	b.dead = true;
	scene.remove( b );
	if ( DEBUG ) console.debug(b.name+" collided with "+a.name);
		
}

//// LINES ////
function drawLine ( a ){
	tmp.subVectors( a.position, a.traceLine.geometry.vertices[traceLength-2] );
	if ( tmp.lengthSq() > traceInterval ){
		// Delete first element
		a.traceLine.geometry.vertices.push( a.traceLine.geometry.vertices.shift() );
    	// Append to line
    	a.traceLine.geometry.vertices[traceLength-1].copy( a.position ); 
    	a.traceLine.geometry.verticesNeedUpdate = true;
    }
    else {
    	a.traceLine.geometry.vertices[traceLength-1].copy( a.position );
    	a.traceLine.geometry.verticesNeedUpdate = true;
    }
    	
}

function eraseLine( a ){
		a.traceLine.geometry.vertices.push(a.traceLine.geometry.vertices.shift());
    	a.traceLine.geometry.vertices[a.traceLine.geometry.vertices.length-1].copy( a.position ); 
    	a.traceLine.geometry.verticesNeedUpdate = true;
}

//// Utilities ////

// Dynamically resizes the window based on current dimensions
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	HUDinit();
    if ( DEBUG ) console.debug( "Window resized" );
}
	
// Initializes stats
function statsInit(){
	stats = new Stats();
	stats.setMode( 0 ); // 0: fps, 1: ms
	
	physStats = new Stats();
	physStats.setMode( 0 ); // 0: fps, 1: ms
	
	// Framerate for draw
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	
	// Framerate for Physics
	physStats.domElement.style.position = 'absolute';
	physStats.domElement.style.left = '0px';
	physStats.domElement.style.top = '50px';

	document.body.appendChild( stats.domElement );
	document.body.appendChild( physStats.domElement );
	if (DEBUG) console.debug( "Stats Init" );
}

// Window Visibility
var vis = (function(){
    var stateKey, eventKey, keys = {
        hidden: "visibilitychange",
        webkitHidden: "webkitvisibilitychange",
        mozHidden: "mozvisibilitychange",
        msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
        if ( stateKey in document ) {
            eventKey = keys[stateKey];
            break;
        }
    }
    return function( c ) {
        if ( c ) document.addEventListener( eventKey, c );
        return !document[stateKey];
    };
})();

function focusChange(){
	if( vis() ){
		document.title = 'Version ' + version;
		physPause();
	}
	else{
		document.title = 'Version ' + version + ' - PAUSE';
		physPause();
	}

}

// Function to toggle fullscreen
    function toggleFullScreen() {
	  if (!document.fullscreenElement &&    // alternative standard method
	      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
	    if (document.documentElement.requestFullscreen) {
	      document.documentElement.requestFullscreen();
	    } else if (document.documentElement.msRequestFullscreen) {
	      document.documentElement.msRequestFullscreen();
	    } else if (document.documentElement.mozRequestFullScreen) {
	      document.documentElement.mozRequestFullScreen();
	    } else if (document.documentElement.webkitRequestFullscreen) {
	      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	    }
	  } else {
	    if (document.exitFullscreen) {
	      document.exitFullscreen();
	    } else if (document.msExitFullscreen) {
	      document.msExitFullscreen();
	    } else if (document.mozCancelFullScreen) {
	      document.mozCancelFullScreen();
	    } else if (document.webkitExitFullscreen) {
	      document.webkitExitFullscreen();
	    }
	  }
	}
	
// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};
