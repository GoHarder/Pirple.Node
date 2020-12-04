/*
 * Primary file for the API
 */

// Node Dependencies
// var http = require('http');

// Project Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');

// Declare the app
var app = {};

// Init function
app.init = ()=>{

   // Start the server
   server.init();

   // Start the workers
   workers.init();
};

// Execute
app.init();

// Export the module
module.exports = app;

// // ---TEST---
// // setTimeout(()=>{

// // helpers.sendTwilioSms('4158375309', 'test', (err)=>{
// //    console.log('Error:', err);
// // });

// // }, 20000);
// // ----------