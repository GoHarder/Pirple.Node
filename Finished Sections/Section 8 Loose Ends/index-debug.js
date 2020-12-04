/*
 * Primary file for the API
 */

// Node Dependencies

// Project Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
const problem = require('./lib/exampleProblem');

// Declare the app
var app = {};

// node inspect index-debug run debug mode
// cont go to next debugger;
// repl can see the value of variables

// Init function
app.init = () => {
   debugger;
   // Start the server
   server.init();
   debugger;

   debugger;
   // Start the workers
   workers.init();
   debugger;

   debugger;
   // Hide the problem
   let foo = 1;
   console.log('foo 1');
   debugger;
   foo++;
   console.log('foo 2');
   debugger;
   foo = foo * foo;
   console.log('foo 3');
   debugger;
   foo = foo.toString();
   console.log('foo 4');
   debugger;
   problem.init();
   console.log('foo 5');
   debugger;

   debugger;
   // Start the CLI, but start it last
   setTimeout(() => {
      cli.init();
   }, 100);
   debugger;
};

// Execute
app.init();

// Export the module
module.exports = app;
