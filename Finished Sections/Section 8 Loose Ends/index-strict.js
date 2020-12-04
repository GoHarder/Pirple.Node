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

// Declare a global that strict should catch
// run node --use_strict index-strict
foo = 'bar';

// Init function
app.init = () => {
   // Start the server
   server.init();

   // Start the workers
   workers.init();

   // Start the CLI, but start it last
   setTimeout(() => {
      cli.init();
   }, 100);
};

// Execute
app.init();

// Export the module
module.exports = app;
