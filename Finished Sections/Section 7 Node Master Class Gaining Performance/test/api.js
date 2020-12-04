/*
 * Api tests
 */

// Node Dependencies
const assert = require('assert');
const http = require('http');

// Project Dependencies
const app = require('./../index');
const config = require('./../lib/config');

// Declare the app
const api = {};

// Helpers
const helpers = {};

helpers.makeGetRequest = (path, callback) => {
   // Configure the request details
   const requestDetails = {
      protocol: 'http:',
      hostname: 'localhost',
      port: config.httpPort,
      method: 'GET',
      path: path,
      headers: {
         Content: 'application/json'
      }
   };

   // Send the request
   const req = http.request(requestDetails, res => {
      callback(res);
   });

   req.end();
};

// The main init() should be able to run without throwing
api['app.init should start without throwing'] = done => {
   assert.doesNotThrow(() => {
      app.init(err => {
         done();
      });
   }, TypeError);
};

// Make a request to ping
api['/ping should respond to get with 200'] = done => {
   helpers.makeGetRequest('/ping', res => {
      assert.equal(res.statusCode, 200);
      done();
   });
};

// Make a request /api/users
api['/api/users should respond to get with 400'] = done => {
   helpers.makeGetRequest('/api/users', res => {
      assert.equal(res.statusCode, 400);
      done();
   });
};

// Make a request to a random path
api['A random path should respond with 404'] = done => {
   helpers.makeGetRequest('/random/path', res => {
      assert.equal(res.statusCode, 404);
      done();
   });
};

// Export to the runner
module.exports = api;
