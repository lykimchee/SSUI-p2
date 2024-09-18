// Ultra-simple web server implemented with Express
// This just serves everything in the folder named below when requested

// Bring in the object for the express API
const express = require("express");

// folder we will serve files out of
const SERVICE_FOLDER = "./out";

// port we will use for HTTP on localhost
const PORT = 8080;  

// create and run the server 
const server = express()
 .use(express.static(SERVICE_FOLDER)) // set it up to serve static content from our folder
 .listen(PORT);                       // and start it listening on our port

// report to the console to show we have (re)started
console.log(`Local server listening on ${PORT}, serving files from "${SERVICE_FOLDER}"`);
