const got = require('got'); // NPM module for getting Web content with JavaScript promises
const geolib = require('geolib'); // module for calculating distance, etc.
const fs = require('fs');
const path = require('path');
const eol = require('os').EOL; // returns end-of-line marker for current OS
const moment = require('moment'); // module for formatting and parsing dates

const loopSeconds = 10;
const url = "http://api.open-notify.org/iss-now.json";
const myPosition = { latitude: 40.712784, longitude: -74.005941, city: "New York", region: "NY", countryCode: "US" }; // Set default coordinates to New York, NY
const urlIp = "http://ip-api.com/json"; // API that returns a user's IP address and location info. Limited to 150 requests per minute.

const logDir = path.join(__dirname, 'logs');
const dataLogFile = 'issResults.csv';

const currentDateTime = moment().format('YYMMDD[T]HHmmss');
const closestDistanceFile = `issClosest-${currentDateTime}.csv`;
const furthestDistanceFile = `issFurthest-${currentDateTime}.csv`;

let closestDistance = Number.MAX_VALUE;
let furthestDistance = Number.MIN_VALUE;

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
	let logFilePath = path.join(logDir, logFileName);
	let timestamp = new Date().toLocaleString();
	let data = `${timestamp} , ${dataToWrite} ${eol}`;

	let flags = append ? {flag: 'a' } : {};

	fs.writeFile(logFilePath, data, flags, (error) => {
		if (error) {
			console.log(`Write error to ${logFileName} : ${error.message}`);
		}
	});
}

// get user IP address and location
function getMyLocation() {
	got(urlIp, {json: true })
		.then((res) => {
			console.log(`myPos lat: ${myPosition.latitude}, lon: ${myPosition.longitude}, ${myPosition.city}, ${myPosition.region}, ${myPosition.countryCode}`);
			myPosition.latitude = res.body.lat;
			myPosition.longitude = res.body.lon;
			myPosition.city = res.body.city;
			myPosition.region = res.body.region;
			myPosition.countryCode = res.body.countryCode;
			console.log(`urlIp lat: ${res.body.lat}, lon: ${res.body.lon}, ${res.body.city}, ${res.body.region}, ${res.body.countryCode}`);
			console.log(`myPos lat: ${myPosition.latitude}, lon: ${myPosition.longitude}, ${myPosition.city}, ${myPosition.region}, ${myPosition.countryCode}`);
		})
		.catch((error) => {
			console.log(error.response.body);
		});
}

function loop(){
	got(url, { json: true })

		// Get current ISS coordinates
		.then((iss) => {
			let position = iss.body.iss_position;
			let distanceFromIss = geolib.getDistance(myPosition, position);
			let distanceFromIssMiles = geolib.convertUnit('mi', distanceFromIss, 2);
			
			console.log(`${distanceFromIssMiles} miles`);
			//console.log("myPosition updated -- lat: " + myPosition.latitude + ", lon: " + myPosition.longitude + ", " + myPosition.city + ", " + myPosition.region + ", " + myPosition.countryCode);
			logToFile(dataLogFile, distanceFromIssMiles);

			if (distanceFromIssMiles < closestDistance) {
				closestDistance = distanceFromIssMiles;
				console.log(`Closer than ever: ${closestDistance}`);
				logToFile(closestDistanceFile, closestDistance, false);
			}

			if (distanceFromIssMiles > furthestDistance) {
				furthestDistance = distanceFromIssMiles;
				console.log(`Further than ever: ${furthestDistance}`);
				logToFile(furthestDistanceFile, furthestDistance, false);
			}

		})
		.catch((error) => {
			console.log(error.response.body);
		});

	// Get ISS position every several seconds
	setTimeout(loop, loopSeconds * 1000);
}

init();
getMyLocation();
loop();

module.exports.getMyLocation = getMyLocation;