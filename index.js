var got = require('got'); // NPM module for getting Web content with JavaScript promises
var geolib = require('geolib'); // module for calculating distance, etc.
var fs = require('fs');
var path = require('path');
var eol = require('os').EOL; // returns end-of-line marker for current OS
var moment = require('moment'); // module for formatting and parsing dates

var loopSeconds = 10;
var url = "http://api.open-notify.org/iss-now.json";
var myPosition = { latitude: 40.712784, longitude: -74.005941, city: "New York", region: "NY", countryCode: "US" }; // Set default coordinates to New York, NY
var urlIp = "http://ip-api.com/json"; // API that returns a user's IP address and location info. Limited to 150 requests per minute.

var logDir = path.join(__dirname, 'logs');
var dataLogFile = 'issResults.csv';

var currentDateTime = moment().format('YYMMDD[T]HHmmss');
var closestDistanceFile = "issClosest-" + currentDateTime + ".csv";
var furthestDistanceFile = "issFurthest-" + currentDateTime + ".csv";

var closestDistance = Number.MAX_VALUE;
var furthestDistance = Number.MIN_VALUE;

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
function logToFile(logFileName, dataToWrite, append = true) {
	var logFilePath = path.join(logDir, logFileName);
	var timestamp = new Date().toLocaleString();
	var data = timestamp + ', ' + dataToWrite + eol;

	var flags = append ? {flag: 'a' } : {};

	fs.writeFile(logFilePath, data, flags, function(error) {
		if (error) {
			console.log('Write error to ' + logFileName + ': ' + error.message);
		}
	});
}

// get user IP address and location
function getMyLocation() {
	got(urlIp, {json: true })
		.then(function(res) {
			console.log("myPos lat: " + myPosition.latitude + ", lon: " + myPosition.longitude + ", " + myPosition.city + ", " + myPosition.region + ", " + myPosition.countryCode);
			myPosition.latitude = res.body.lat;
			myPosition.longitude = res.body.lon;
			myPosition.city = res.body.city;
			myPosition.region = res.body.region;
			myPosition.countryCode = res.body.countryCode;
			console.log("urlIp lat: " + res.body.lat + ", lon: " + res.body.lon + ", " + res.body.city + ", " + res.body.region + ", " + res.body.countryCode);
			console.log("myPos lat: " + myPosition.latitude + ", lon: " + myPosition.longitude + ", " + myPosition.city + ", " + myPosition.region + ", " + myPosition.countryCode);
		})
		.catch(function(error) {
			console.log(error.response.body);
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
			//console.log("myPosition updated -- lat: " + myPosition.latitude + ", lon: " + myPosition.longitude + ", " + myPosition.city + ", " + myPosition.region + ", " + myPosition.countryCode);
			logToFile(dataLogFile, distanceFromIssMiles);

			if (distanceFromIssMiles < closestDistance) {
				closestDistance = distanceFromIssMiles;
				console.log("Closer than ever: " + closestDistance);
				logToFile(closestDistanceFile, closestDistance, false);
			}

			if (distanceFromIssMiles > furthestDistance) {
				furthestDistance = distanceFromIssMiles;
				console.log("Further than ever: " + furthestDistance);
				logToFile(furthestDistanceFile, furthestDistance, false);
			}

		})
		.catch(function(error) {
			console.log(error.response.body);
		});

	// Get ISS position every several seconds
	setTimeout(loop, loopSeconds * 1000);
}

init();
getMyLocation();
loop();