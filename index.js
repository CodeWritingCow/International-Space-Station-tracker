var got = require('got'); // NPM module for getting Web content with JavaScript promises
var geolib = require('geolib'); // module for calculating distance, etc.
var fs = require('fs');
var path = require('path');
var eol = require('os').EOL; // returns end-of-line marker for current OS

var loopSeconds = 10;
var url = "http://api.open-notify.org/iss-now.json";
var myPosition = { latitude: 40.712784, longitude: -74.005941 }; // Coordinates for New York, NY

var logDir = path.join(__dirname, 'logs');
var dataLogFile = 'issResults.csv';


// check if directory exists
function directoryExists(filePath) {
	try {
		return fs.statSync(filePath).isDirectory();
	} catch (err) {
		return false;
	}
}

// if log directory doesn't exists, create it
function init() {
	if (!directoryExists(logDir)) {
		fs.mkdirSync(logDir);
	}
}

// log data with timestamp into csv file
function logToFile(logFileName, dataToWrite) {
	var logFilePath = path.join(logDir, logFileName);
	var timestamp = new Date().toLocaleString();
	var data = timestamp + ', ' + dataToWrite + eol;

	fs.appendFile(logFilePath, data, function(error) {
		if (error) {
			console.log('Write error to ' + logFileName + ': ' + error.message);
		}
	});
}


function loop(){
	got(url, { json: true })

		// Get current ISS coordinates
		.then(function(iss) {
			var position = iss.body.iss_position;
			var distanceFromIss = geolib.getDistance(myPosition, position);
			var distanceFromIssMiles = geolib.convertUnit('mi', distanceFromIss, 2);
			
			console.log(`${distanceFromIssMiles} miles`);
			logToFile(dataLogFile, distanceFromIssMiles);
		})
		.catch(function(error) {
			console.log(error.response.body);
		});

	// Get ISS position every 3 seconds
	setTimeout(loop, loopSeconds * 1000);
}

init();
loop();