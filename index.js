var got = require('got');

var delaySeconds = 3;
var url = "http://api.open-notify.org/iss-now.json";


function loop(){
	got(url, { json: true })

		// Get current ISS coordinates
		.then(function(iss) {
			var position = iss.body.iss_position;
			console.log(position);
		})
		.catch(function(error) {
			console.log(error.response.body);
		});

	// Get ISS position every 3 seconds
	setTimeout(loop, delaySeconds * 1000);
}

loop();
