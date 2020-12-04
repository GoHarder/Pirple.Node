/*
 * Primary file for the API
 */

// Node Dependencies
var cluster = require('cluster');
var os = require('os');

// Project Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');

// Declare the app
var app = {};

// Init function
app.init = callback => {
   // If on the master thread , Start the workers and the CLI
   if (cluster.isMaster) {
      // Start the workers
      workers.init();

      // Start the CLI, but start it last
      setTimeout(() => {
         cli.init();
         callback();
      }, 100);

      // For the process
      for (let i = 0; i < os.cpus().length; i++) {
         cluster.fork();
      }
   } else {
      // If not on the master thread, Start the server
      server.init();
   }
};

// Self running only if required directly
if (require.main === module) {
   app.init(() => {});
}

// Export the module
module.exports = app;
