/*
 * http2 Server
 */

// Node Dependencies
const http2 = require('http2');

// Project Dependencies

// Init the server
const server = http2.createServer();

// On a stream, send back hello world html
server.on('stream', (stream, headers) => {
   stream.respond({
      status: 200,
      'content-type': 'text/html'
   });
   stream.end('<html><body><p>This is a stream</p></body></html>');
});

// Listen on 6000
server.listen(6000);
