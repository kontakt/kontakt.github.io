 function HUDinit(){
    	var width = window.innerWidth/2; 	
    	var div = document.getElementById('HUDTime');
    	var x = div.offsetLeft + div.offsetWidth/2;
    	var dist = width/Math.tan(Math.radians(FOV/2));
    	var rot = Math.degrees(Math.atan((width-x)/dist));
    	div.style.webkitTransform = "rotateY("+rot+"deg)";
    	if (DEBUG) console.debug("HUD Resized");
    }