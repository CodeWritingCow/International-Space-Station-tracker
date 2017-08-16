var got = require('got'); // NPM module for getting Web content with JavaScript promises
var geolib = require('geolib'); // module for calculating distance, etc.

var delaySeconds = 3;
var url = "http://api.open-notify.org/iss-now.json";
var myPosition = { latitude: 40.712784, longitude: -74.005941 }; // Coordinates for New York, NY


function loop(){
	got(url, { json: true })

		// Get current ISS coordinates
		.then(function(iss) {
			var position = iss.body.iss_position;
			var distanceFromIss = geolib.getDistance(myPosition, position);
			console.log(`${distanceFromIss} meters`);
		})
		.catch(function(error) {
			console.log(error.response.body);
		});

	// Get ISS position every 3 seconds
	setTimeout(loop, delaySeconds * 1000);
}

loop();
