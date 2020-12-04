/*
 * Server related tasks
 */

// Node Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var path = require('path');
var util = require('util');
var debug = util.debuglog('server');

// Project Dependencies
var config = require('./config');
var handlers = require('./handlers');
var helpers = require('./classHelpers');

// Instantiate server module object
var server = {};

// Instantiate the HTTP server
server.httpServer = http.createServer((req, res) => {
   server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
   key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
   cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
   server.unifiedServer(req, res);
});

// All the server logic for both the http and https servers
server.unifiedServer = (req, res) => {
   // Get the URL and Parse it
   var parsedUrl = url.parse(req.url, true);

   // Get the path
   var path = parsedUrl.pathname;
   var trimmedPath = path.replace(/^\/+|\/+$/g, '');

   // Get the query string as an object
   var queryStringObject = parsedUrl.query;

   // Get the HTTP Method
   var method = req.method.toLowerCase();

   // Get the headers as an object
   var headers = req.headers;

   // Get the payload, if any
   var decoder = new StringDecoder('utf-8');
   var buffer = '';

   req.on('data', data => {
      buffer += decoder.write(data);
   });

   req.on('end', () => {
      buffer += decoder.end();

      // Choose the handler this request should go to
      var chosenHandler = typeof server.router[trimmedPath] !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
         trimmedPath: trimmedPath,
         queryStringObject: queryStringObject,
         method: method,
         headers: headers,
         payload: helpers.parseJsonToObject(buffer)
      };

      // Route the request to the handler specified in the router
      chosenHandler(data, (statusCode, payload) => {
         // Use the status code called back by the handler, or default to 200
         statusCode = typeof statusCode == 'number' ? statusCode : 200;

         // Use the payload called back by the handler, or default an empty object
         payload = typeof payload == 'object' ? payload : {};

         // Convert the payload to string
         var payloadString = JSON.stringify(payload);

         // Return the response
         res.setHeader('Content-Type', 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);

         // Log the request path
         // debug('Returning this response:', statusCode, payloadString);
         // If response is 200 print green, else print red
         if (statusCode == 200) {
            debug('\x1b[32m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
         } else {
            debug('\x1b[31m%s\x1b[0m', `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
         }
      });
   });
};

// Define a request router
server.router = {
   ping: handlers.ping,
   users: handlers.users,
   tokens: handlers.tokens,
   checks: handlers.checks
};

// Init server
server.init = () => {
   // Start the HTTP server
   server.httpServer.listen(config.httpPort, () => {
      console.log('\x1b[36m%s\x1b[0m', `The HTTP server is listening on port ${config.httpPort}`);
   });

   // Start the HTTPs server
   server.httpsServer.listen(config.httpsPort, () => {
      console.log('\x1b[35m%s\x1b[0m', `The HTTPS server is listening on port ${config.httpsPort}`);
   });
};

// Export the module
module.exports = server;
