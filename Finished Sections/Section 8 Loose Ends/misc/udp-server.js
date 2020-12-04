/*
 * UDP Datagram Server (eg video streaming)
 */

// Node Dependencies
const dgram = require('dgram');

// Project Dependencies

// Init the server
const server = dgram.createSocket('udp4');

// On a stream, send back hello world html
server.on('message', (messageBuffer, sender) => {
   // Do something with an incoming message or do something with the sender
   const messageString = messageBuffer.toString();
   console.log(messageString);
});

// Listen on 6000
server.bind(6000);
