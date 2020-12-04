/*
 * Primary file for the API
 */

// Node Dependencies

// Project Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');

// Declare the app
var app = {};

// Init function
app.init = callback => {
   // Start the server
   server.init();

   // Start the workers
   workers.init();

   // Start the CLI, but start it last
   setTimeout(() => {
      cli.init();
      callback();
   }, 100);
};

// Self running only if required directly
if (require.main === module) {
   app.init(() => {});
}

// Export the module
module.exports = app;
