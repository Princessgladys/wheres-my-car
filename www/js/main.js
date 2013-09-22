// var home = {lat: 32.78108, lon: -96.79099};
var home = {lat: 33.21219, lon: -97.15112};

var RAD = Math.PI / 180;
var DEG = 180 / Math.PI;

var pos = {dist: 0, bearing: 0, heading: 0};

document.addEventListener('deviceready', function() {
	var canvas = oCanvas.create({ 
	    canvas: "#canvas", 
	    background: "#FFFFFF", 
	    fps: 60
	});

	var eCanvas = document.getElementById('canvas');
	if (eCanvas.getContext) {
		canvas.width = $(document).width();
		canvas.height = $(document).height();
	}

	var arrow = canvas.display.image({
	origin: { x: "center", y: "center" },
	image: "img/pointer.png",
	x: canvas.width/2,
	y: (canvas.height/2)*(4/5),
	origin: {x: "center", y: "center"},
	clickable_value: 0
	});

	$('#distance').css("top", (canvas.height-arrow.y)/5);
	canvas.addChild(arrow);

	function rotate(rot){
		arrow.animate({
			rotation: rot
		}, {
			duration: 500,
			easing: "linear"
		});

		innerArrow.animate({
			rotation: arrow.rotation - 270
		}, {
			duration: 500,
			easing: "linear"
		});
	} 

	function distAndBear(p1, p2) {
		// Distance
		var R = 6371; // km of radius of earth
		var dLat = (p2.lat - p1.lat) * RAD;
		var dLon = (p2.lon - p1.lon) * RAD;
		var lat1 = p1.lat * RAD;
		var lat2 = p2.lat * RAD;

		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
		var d = R * c;

		// Bearing
		var y = Math.sin(dLon) * Math.cos(lat2);
		var x = Math.cos(lat1) * Math.sin(lat2) -
		        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
		var b = Math.atan2(y, x) * DEG;

		return {
			distance: d, // Km
			bearing: b // Deg
		};
	}

	function updatePos() {
		navigator.geolocation.watchPosition(function(p) {
			var dab = distAndBear({lat: p.coords.latitude, lon: p.coords.longitude}, home);

			var dist = dab.distance * 1000;
			var feet = Math.round(dist * 3.28084);

			var diff = pos.dist - feet;
			if (Math.abs(diff) > 5) {
				pos.dist = feet;
			}
			pos.bearing = dab.bearing;
			setTimeout(updatePos, 1);
		}, function(err) {
			$('#distance').text(err);
			setTimeout(updatePos, 1);
		});
	}
	updatePos();


	navigator.compass.watchHeading(function(heading) {
		pos.heading = heading.magneticHeading;
	}, function(err) {
		$('#distance').text(err);
	});

	setInterval(function() {
		$('#distance').text(pos.dist + ' ft');
		rotate(360 - pos.bearing - pos.heading);
	}, 500);
});
