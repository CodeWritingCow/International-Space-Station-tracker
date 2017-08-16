var got = require('got');

var url = "http://api.open-notify.org/iss-now.json";

got(url, { json: true })
	.then(function(iss) {
		console.log(iss.body);
	})
	.catch(function(error) {
		console.log(error.response.body);
	});