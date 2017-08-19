# International Space Station tracker

This Node.js app tracks the distance between the International Space Station (ISS) and our location on Earth in real time. It logs data into a CSV file.

It gets data from two APIs: [Open Notify API](http://open-notify.org) by Nathan Bergey; and [IP-API.com.](http://ip-api.com) Open Notify fetches raw ISS data from NASA, while IP-API gets the user's IP address and geolocation data.

If the user's geolocation data are unavailable, then the location is set by default to New York, NY.

Based on the tutorials ["Node.js IoT: Tracking the ISS through the Sky,"](http://thisdavej.com/node-js-iot-tracking-the-iss-through-the-sky) and ["Node.js IoT: Logging Data That Is Out of This World"](http://thisdavej.com/node-js-iot-logging-data-that-is-out-of-this-world/) by Dave Johnson.