/*
 * Primary file for the API
 */

// Node Dependencies

// Project Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');

// Declare the app
var app = {};

// Init function
app.init = () => {
   // Start the server
   server.init();

   // Start the workers
   workers.init();
};

// Execute
app.init();

// Export the module
module.exports = app;
